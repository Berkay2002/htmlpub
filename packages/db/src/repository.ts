import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, ilike, inArray, isNotNull, isNull, lt, notExists, or, sql } from "drizzle-orm";
import { AppError, createOpaqueToken, createShareUrls, normalizeSlug, sha256, type BlobMetadata, type CreateReviewComment, type DocumentSummary, type PendingUpload, type PublishRepository, type PublishRequest, type PublishResult, type ReviewDecision, type ReviewRoundStatus, type ReviewStatus, type ShareResult } from "@htmlpub/core";
import type { HtmlpubDb } from "./client";
import { accounts, apiTokens, collections, documents, documentVersions, reviewComments, reviewEvents, reviewRounds, shareLinks, uploadSessions } from "./schema";

export type RepositoryOptions = { dashboardOrigin: string };
type HtmlpubTransaction = Parameters<Parameters<HtmlpubDb["transaction"]>[0]>[0];

function mapUpload(row: typeof uploadSessions.$inferSelect): PendingUpload {
  return {
    id: row.id,
    ownerId: row.ownerId,
    documentId: row.documentId,
    versionId: row.versionId,
    blobPath: row.blobPath,
    byteSize: row.byteSize,
    sha256: row.sha256,
    expiresAt: row.expiresAt,
    status: row.status,
    completedResult: row.completedResult ?? null
  };
}

export function createRepository(db: HtmlpubDb, { dashboardOrigin }: RepositoryOptions) {
  const origin = new URL(dashboardOrigin).origin;

  async function openReviewRound(tx: HtmlpubTransaction, documentId: string, versionId: string) {
    await tx.update(reviewRounds).set({ status: "superseded", decidedAt: new Date() })
      .where(and(eq(reviewRounds.documentId, documentId), eq(reviewRounds.status, "open")));
    await tx.insert(reviewRounds).values({ documentId, versionId });
  }

  async function getOrCreateReviewStatus(ownerId: string, slug: string, requestedRoundId?: string): Promise<ReviewStatus> {
    const [document] = await db.select({
      id: documents.id,
      slug: documents.slug,
      title: documents.title,
      currentVersionId: documents.currentVersionId
    }).from(documents).where(and(
      eq(documents.ownerId, ownerId),
      eq(documents.slug, slug),
      isNull(documents.archivedAt),
      isNotNull(documents.currentVersionId)
    )).limit(1);
    if (!document?.currentVersionId) throw new AppError("document_not_found", "Document not found", 404);

    let [round] = requestedRoundId
      ? await db.select().from(reviewRounds).where(and(eq(reviewRounds.id, requestedRoundId), eq(reviewRounds.documentId, document.id))).limit(1)
      : await db.select().from(reviewRounds).where(and(
        eq(reviewRounds.documentId, document.id),
        eq(reviewRounds.versionId, document.currentVersionId)
      )).orderBy(desc(reviewRounds.createdAt)).limit(1);
    if (!round && requestedRoundId) throw new AppError("review_not_found", "Review round not found", 404);
    if (!round) {
      await db.insert(reviewRounds).values({ documentId: document.id, versionId: document.currentVersionId }).onConflictDoNothing();
      [round] = await db.select().from(reviewRounds).where(and(
        eq(reviewRounds.documentId, document.id),
        eq(reviewRounds.versionId, document.currentVersionId)
      )).orderBy(desc(reviewRounds.createdAt)).limit(1);
    }
    if (!round) throw new AppError("review_unavailable", "Review round could not be prepared", 500);

    const [version] = await db.select({ versionNumber: documentVersions.versionNumber }).from(documentVersions)
      .where(and(eq(documentVersions.id, round.versionId), eq(documentVersions.documentId, document.id))).limit(1);
    if (!version) throw new AppError("version_unavailable", "Review version could not be resolved", 500);

    const comments = await db.select().from(reviewComments).where(eq(reviewComments.reviewRoundId, round.id))
      .orderBy(sql`${reviewComments.startPosition} asc nulls last`, asc(reviewComments.createdAt), asc(reviewComments.id));
    const [latestEvent] = await db.select({ id: reviewEvents.id }).from(reviewEvents)
      .where(eq(reviewEvents.reviewRoundId, round.id)).orderBy(desc(reviewEvents.id)).limit(1);

    return {
      slug: document.slug,
      title: document.title,
      version: version.versionNumber,
      roundId: round.id,
      status: round.status,
      comments: comments.map((comment) => ({
        id: comment.id,
        body: comment.body,
        selection: {
          exact: comment.exactText,
          prefix: comment.prefixText,
          suffix: comment.suffixText,
          start: comment.startPosition,
          end: comment.endPosition,
          heading: comment.heading
        },
        createdAt: comment.createdAt.toISOString()
      })),
      latestEventId: latestEvent?.id ?? null,
      decidedAt: round.decidedAt?.toISOString() ?? null
    };
  }

  async function ensureAccount(ownerId: string) {
    await db.insert(accounts).values({ id: ownerId }).onConflictDoNothing();
  }

  async function resolveCollection(ownerId: string, name?: string): Promise<string | null> {
    if (!name) return null;
    const slug = normalizeSlug(name);
    await db.insert(collections).values({ ownerId, name, slug }).onConflictDoNothing();
    const [collection] = await db.select({ id: collections.id }).from(collections).where(and(eq(collections.ownerId, ownerId), eq(collections.slug, slug))).limit(1);
    if (!collection) throw new AppError("collection_unavailable", "Collection could not be created", 500);
    return collection.id;
  }

  const publishRepository: PublishRepository = {
    async findDuplicate(ownerId, slug, contentHash) {
      const [document] = await db.select().from(documents).where(and(eq(documents.ownerId, ownerId), eq(documents.slug, slug), isNull(documents.archivedAt))).limit(1);
      if (!document?.currentVersionId) return null;
      const [version] = await db.select().from(documentVersions).where(and(eq(documentVersions.id, document.currentVersionId), eq(documentVersions.sha256, contentHash))).limit(1);
      if (!version) return null;
      return {
        documentId: document.id,
        slug: document.slug,
        title: document.title,
        version: version.versionNumber,
        dashboardUrl: `${origin}/dashboard/documents/${encodeURIComponent(document.slug)}`,
        shareUrl: null,
        shareContentUrl: null,
        duplicate: true
      };
    },

    async createUpload(ownerId: string, request: PublishRequest, expiresAt: Date) {
      await ensureAccount(ownerId);
      const requestedCollectionId = await resolveCollection(ownerId, request.collection);
      await db.insert(documents).values({ ownerId, slug: request.slug, title: request.title, collectionId: requestedCollectionId }).onConflictDoNothing();
      const [document] = await db.select().from(documents).where(and(eq(documents.ownerId, ownerId), eq(documents.slug, request.slug))).limit(1);
      if (!document) throw new AppError("document_unavailable", "Document could not be prepared", 500);
      const collectionId = request.collection ? requestedCollectionId : document.collectionId;

      const id = randomUUID();
      const versionId = randomUUID();
      const blobPath = `owners/${ownerId}/documents/${document.id}/versions/${versionId}.html`;
      const [created] = await db.insert(uploadSessions).values({
        id,
        ownerId,
        documentId: document.id,
        versionId,
        title: request.title,
        collectionId,
        blobPath,
        sha256: request.sha256,
        byteSize: request.byteSize,
        sourceFilename: request.filename,
        expiresAt
      }).returning();
      if (!created) throw new AppError("upload_unavailable", "Upload session could not be created", 500);
      return mapUpload(created);
    },

    async getUpload(ownerId, uploadId) {
      const [row] = await db.select().from(uploadSessions).where(and(eq(uploadSessions.id, uploadId), eq(uploadSessions.ownerId, ownerId))).limit(1);
      return row ? mapUpload(row) : null;
    },

    async completeUpload(uploadId: string, blob: BlobMetadata) {
      return db.transaction(async (tx) => {
        const [session] = await tx.select().from(uploadSessions).where(eq(uploadSessions.id, uploadId)).limit(1);
        if (!session) throw new AppError("upload_not_found", "Upload session not found", 404);
        if (session.status === "completed" && session.completedResult) return session.completedResult;
        if (session.status !== "pending") throw new AppError("upload_unavailable", "Upload session is not pending", 409);

        const [document] = await tx.update(documents).set({
          versionCounter: sql`${documents.versionCounter} + 1`,
          currentVersionId: session.versionId,
          title: session.title,
          collectionId: session.collectionId,
          archivedAt: null,
          updatedAt: new Date()
        }).where(eq(documents.id, session.documentId)).returning();
        if (!document) throw new AppError("document_not_found", "Document not found", 404);

        await tx.insert(documentVersions).values({
          id: session.versionId,
          documentId: session.documentId,
          versionNumber: document.versionCounter,
          blobPath: session.blobPath,
          blobUrl: blob.url,
          etag: blob.etag,
          sha256: session.sha256,
          byteSize: session.byteSize,
          sourceFilename: session.sourceFilename
        });

        await openReviewRound(tx, document.id, session.versionId);

        const result: PublishResult = {
          documentId: document.id,
          slug: document.slug,
          title: document.title,
          version: document.versionCounter,
          dashboardUrl: `${origin}/dashboard/documents/${encodeURIComponent(document.slug)}`,
          shareUrl: null,
          shareContentUrl: null,
          duplicate: false
        };
        await tx.update(uploadSessions).set({ status: "completed", completedAt: new Date(), completedResult: result }).where(eq(uploadSessions.id, uploadId));
        return result;
      });
    },

    async listStaleUploads(cutoff) {
      const rows = await db.select().from(uploadSessions).where(and(eq(uploadSessions.status, "pending"), lt(uploadSessions.createdAt, cutoff)));
      return rows.map(mapUpload);
    },

    async expireUploads(uploadIds) {
      if (uploadIds.length === 0) return;
      await db.transaction(async (tx) => {
        const sessions = await tx.select({ documentId: uploadSessions.documentId }).from(uploadSessions).where(inArray(uploadSessions.id, uploadIds));
        await tx.update(uploadSessions).set({ status: "expired" }).where(inArray(uploadSessions.id, uploadIds));
        const documentIds = [...new Set(sessions.map((session) => session.documentId))];
        if (documentIds.length > 0) {
          await tx.delete(documents).where(and(
            inArray(documents.id, documentIds),
            eq(documents.versionCounter, 0),
            notExists(tx.select({ id: uploadSessions.id }).from(uploadSessions).where(and(eq(uploadSessions.documentId, documents.id), eq(uploadSessions.status, "pending"))))
          ));
        }
      });
    }
  };

  return {
    publishRepository,
    ensureAccount,

    async listDocuments(ownerId: string, input: { search?: string; collection?: string; limit?: number; offset?: number } = {}): Promise<DocumentSummary[]> {
      const conditions = [eq(documents.ownerId, ownerId), isNull(documents.archivedAt), isNotNull(documents.currentVersionId)];
      if (input.search) {
        const search = `%${input.search}%`;
        conditions.push(or(
          ilike(documents.title, search),
          ilike(documents.slug, search),
          ilike(documentVersions.sourceFilename, search),
          ilike(collections.name, search)
        )!);
      }
      if (input.collection) conditions.push(eq(collections.slug, input.collection));
      const rows = await db.select({
        id: documents.id,
        slug: documents.slug,
        title: documents.title,
        collection: collections.name,
        currentVersion: documentVersions.versionNumber,
        versionCount: documents.versionCounter,
        latestFilename: documentVersions.sourceFilename,
        updatedAt: documents.updatedAt,
        shareId: shareLinks.id
      }).from(documents)
        .leftJoin(collections, eq(documents.collectionId, collections.id))
        .innerJoin(documentVersions, eq(documents.currentVersionId, documentVersions.id))
        .leftJoin(shareLinks, and(eq(shareLinks.documentId, documents.id), isNull(shareLinks.revokedAt)))
        .where(and(...conditions))
        .orderBy(desc(documents.updatedAt))
        .limit(Math.min(input.limit ?? 50, 100))
        .offset(input.offset ?? 0);
      return rows.map((row) => ({ ...row, updatedAt: row.updatedAt.toISOString(), shared: Boolean(row.shareId) }));
    },

    async listCollections(ownerId: string) {
      return db.select({ id: collections.id, name: collections.name, slug: collections.slug, createdAt: collections.createdAt })
        .from(collections).where(eq(collections.ownerId, ownerId)).orderBy(collections.name);
    },

    async getDocument(ownerId: string, slug: string) {
      const [document] = await db.select({
        id: documents.id,
        slug: documents.slug,
        title: documents.title,
        currentVersionId: documents.currentVersionId,
        versionCount: documents.versionCounter,
        updatedAt: documents.updatedAt,
        collection: collections.name,
        shared: shareLinks.id
      }).from(documents)
        .leftJoin(collections, eq(documents.collectionId, collections.id))
        .leftJoin(shareLinks, and(eq(shareLinks.documentId, documents.id), isNull(shareLinks.revokedAt)))
        .where(and(eq(documents.ownerId, ownerId), eq(documents.slug, slug), isNull(documents.archivedAt), isNotNull(documents.currentVersionId))).limit(1);
      if (!document) return null;
      const versions = await db.select().from(documentVersions).where(eq(documentVersions.documentId, document.id)).orderBy(desc(documentVersions.versionNumber));
      const currentVersion = versions.find((version) => version.id === document.currentVersionId);
      if (!currentVersion) throw new AppError("version_unavailable", "Current version could not be resolved", 500);
      return { ...document, currentVersion: currentVersion.versionNumber, shared: Boolean(document.shared), updatedAt: document.updatedAt.toISOString(), versions: versions.map((version) => ({ ...version, createdAt: version.createdAt.toISOString() })) };
    },

    async getReviewStatus(ownerId: string, slug: string, roundId?: string) {
      return getOrCreateReviewStatus(ownerId, slug, roundId);
    },

    async addReviewComment(ownerId: string, slug: string, input: CreateReviewComment) {
      const review = await getOrCreateReviewStatus(ownerId, slug);
      if (review.status !== "open") throw new AppError("review_closed", "This review round is no longer open", 409);
      await db.transaction(async (tx) => {
        const [openRound] = await tx.select({ id: reviewRounds.id }).from(reviewRounds)
          .where(and(eq(reviewRounds.id, review.roundId), eq(reviewRounds.status, "open"))).for("update").limit(1);
        if (!openRound) throw new AppError("review_closed", "This review round is no longer open", 409);
        const [comment] = await tx.insert(reviewComments).values({
          reviewRoundId: review.roundId,
          body: input.body,
          exactText: input.selection.exact,
          prefixText: input.selection.prefix,
          suffixText: input.selection.suffix,
          startPosition: input.selection.start,
          endPosition: input.selection.end,
          heading: input.selection.heading
        }).returning();
        if (!comment) throw new AppError("comment_unavailable", "Review comment could not be created", 500);
      });
      return getOrCreateReviewStatus(ownerId, slug, review.roundId);
    },

    async decideReview(ownerId: string, slug: string, decision: ReviewDecision) {
      const review = await getOrCreateReviewStatus(ownerId, slug);
      if (review.status !== "open") throw new AppError("review_closed", "This review round is no longer open", 409);
      const statusByDecision = {
        accept: "accepted",
        request_revision: "revision_requested",
        cancel: "cancelled"
      } as const satisfies Record<ReviewDecision, Exclude<ReviewRoundStatus, "open" | "superseded">>;
      const status = statusByDecision[decision];
      await db.transaction(async (tx) => {
        const [roundRecord] = await tx.select({ documentId: reviewRounds.documentId }).from(reviewRounds).where(eq(reviewRounds.id, review.roundId)).limit(1);
        if (!roundRecord) throw new AppError("review_not_found", "Review round not found", 404);
        const [closed] = await tx.update(reviewRounds).set({ status, decidedAt: new Date() })
          .where(and(eq(reviewRounds.id, review.roundId), eq(reviewRounds.status, "open"))).returning({ id: reviewRounds.id });
        if (!closed) throw new AppError("review_closed", "This review round is no longer open", 409);
        await tx.insert(reviewEvents).values({ documentId: roundRecord.documentId, reviewRoundId: review.roundId, type: status });
      });
      return getOrCreateReviewStatus(ownerId, slug, review.roundId);
    },

    async ensureShare(ownerId: string, slug: string): Promise<ShareResult | null> {
      const [document] = await db.select({ id: documents.id }).from(documents)
        .where(and(eq(documents.ownerId, ownerId), eq(documents.slug, slug), isNull(documents.archivedAt), isNotNull(documents.currentVersionId))).limit(1);
      if (!document) throw new AppError("document_not_found", "Document not found", 404);

      const [active] = await db.select({ id: shareLinks.id }).from(shareLinks)
        .where(and(eq(shareLinks.documentId, document.id), isNull(shareLinks.revokedAt))).limit(1);
      if (active) return null;

      const created = createOpaqueToken("share");
      const [inserted] = await db.insert(shareLinks).values({ documentId: document.id, tokenHash: created.hash }).onConflictDoNothing().returning({ id: shareLinks.id });
      return inserted ? createShareUrls(origin, created.token) : null;
    },

    async getVersion(versionId: string) {
      const [version] = await db.select().from(documentVersions).where(eq(documentVersions.id, versionId)).limit(1);
      return version ?? null;
    },

    async resolveShare(token: string) {
      const tokenHash = sha256(token);
      const [row] = await db.select({
        documentId: documents.id,
        slug: documents.slug,
        title: documents.title,
        currentVersionId: documents.currentVersionId,
        updatedAt: documents.updatedAt
      }).from(shareLinks).innerJoin(documents, eq(shareLinks.documentId, documents.id))
        .where(and(eq(shareLinks.tokenHash, tokenHash), isNull(shareLinks.revokedAt), isNull(documents.archivedAt))).limit(1);
      return row ? { ...row, updatedAt: row.updatedAt.toISOString() } : null;
    },

    async rotateShare(ownerId: string, slug: string) {
      const [document] = await db.select().from(documents).where(and(eq(documents.ownerId, ownerId), eq(documents.slug, slug), isNull(documents.archivedAt))).limit(1);
      if (!document) throw new AppError("document_not_found", "Document not found", 404);
      const created = createOpaqueToken("share");
      await db.transaction(async (tx) => {
        await tx.update(shareLinks).set({ revokedAt: new Date() }).where(and(eq(shareLinks.documentId, document.id), isNull(shareLinks.revokedAt)));
        await tx.insert(shareLinks).values({ documentId: document.id, tokenHash: created.hash });
      });
      return createShareUrls(origin, created.token);
    },

    async revokeShare(ownerId: string, slug: string) {
      const [document] = await db.select({ id: documents.id }).from(documents).where(and(eq(documents.ownerId, ownerId), eq(documents.slug, slug))).limit(1);
      if (!document) throw new AppError("document_not_found", "Document not found", 404);
      const revoked = await db.update(shareLinks).set({ revokedAt: new Date() }).where(and(eq(shareLinks.documentId, document.id), isNull(shareLinks.revokedAt))).returning({ id: shareLinks.id });
      return { revoked: revoked.length > 0 };
    },

    async createApiToken(ownerId: string, name: string, scopes = ["documents:read", "documents:write", "shares:write"]) {
      await ensureAccount(ownerId);
      const created = createOpaqueToken("htmlpub");
      const [record] = await db.insert(apiTokens).values({ ownerId, name, displayPrefix: created.displayPrefix, tokenHash: created.hash, scopes }).returning({ id: apiTokens.id, name: apiTokens.name, displayPrefix: apiTokens.displayPrefix, scopes: apiTokens.scopes, createdAt: apiTokens.createdAt });
      return { ...record!, token: created.token };
    },

    async listApiTokens(ownerId: string) {
      return db.select({ id: apiTokens.id, name: apiTokens.name, displayPrefix: apiTokens.displayPrefix, scopes: apiTokens.scopes, lastUsedAt: apiTokens.lastUsedAt, expiresAt: apiTokens.expiresAt, revokedAt: apiTokens.revokedAt, createdAt: apiTokens.createdAt })
        .from(apiTokens).where(eq(apiTokens.ownerId, ownerId)).orderBy(desc(apiTokens.createdAt));
    },

    async authenticateApiToken(token: string) {
      const [record] = await db.select().from(apiTokens).where(and(eq(apiTokens.tokenHash, sha256(token)), isNull(apiTokens.revokedAt))).limit(1);
      if (!record || (record.expiresAt && record.expiresAt <= new Date())) return null;
      await db.update(apiTokens).set({ lastUsedAt: new Date() }).where(eq(apiTokens.id, record.id));
      return { ownerId: record.ownerId, scopes: record.scopes };
    },

    async revokeApiToken(ownerId: string, tokenId: string) {
      const revoked = await db.update(apiTokens).set({ revokedAt: new Date() }).where(and(eq(apiTokens.id, tokenId), eq(apiTokens.ownerId, ownerId), isNull(apiTokens.revokedAt))).returning({ id: apiTokens.id });
      return { revoked: revoked.length > 0 };
    },

    async archiveDocument(ownerId: string, slug: string) {
      const [document] = await db.update(documents).set({ archivedAt: new Date() }).where(and(eq(documents.ownerId, ownerId), eq(documents.slug, slug), isNull(documents.archivedAt))).returning({ id: documents.id });
      if (!document) throw new AppError("document_not_found", "Document not found", 404);
      await db.update(shareLinks).set({ revokedAt: new Date() }).where(and(eq(shareLinks.documentId, document.id), isNull(shareLinks.revokedAt)));
      return { archived: true };
    },

    async restoreVersion(ownerId: string, slug: string, versionNumber: number): Promise<PublishResult> {
      return db.transaction(async (tx) => {
        const [document] = await tx.select().from(documents).where(and(eq(documents.ownerId, ownerId), eq(documents.slug, slug), isNull(documents.archivedAt))).limit(1);
        if (!document) throw new AppError("document_not_found", "Document not found", 404);
        const [source] = await tx.select().from(documentVersions).where(and(eq(documentVersions.documentId, document.id), eq(documentVersions.versionNumber, versionNumber))).limit(1);
        if (!source) throw new AppError("version_not_found", "Version not found", 404);
        const [updated] = await tx.update(documents).set({ currentVersionId: source.id, updatedAt: new Date() }).where(eq(documents.id, document.id)).returning();
        if (!updated) throw new AppError("document_not_found", "Document not found", 404);
        await openReviewRound(tx, document.id, source.id);
        return { documentId: document.id, slug: document.slug, title: document.title, version: source.versionNumber, dashboardUrl: `${origin}/dashboard/documents/${encodeURIComponent(document.slug)}`, shareUrl: null, shareContentUrl: null, duplicate: false };
      });
    }
  };
}
