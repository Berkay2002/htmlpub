import { MAX_HTML_BYTES, UPLOAD_TTL_MS, type PublishRequest, type PublishResult, type StartUploadResult, publishRequestSchema } from "./contracts";
import { AppError } from "./errors";
import { normalizeSlug } from "./slug";

export type PendingUpload = {
  id: string;
  ownerId: string;
  documentId: string;
  versionId: string;
  blobPath: string;
  byteSize: number;
  sha256: string;
  expiresAt: Date;
  status: "pending" | "completed" | "expired";
  completedResult: PublishResult | null;
};

export type BlobMetadata = {
  pathname: string;
  contentType: string;
  size: number;
  etag: string;
  url: string;
};

export type PublishRepository = {
  findDuplicate(ownerId: string, slug: string, sha256: string): Promise<PublishResult | null>;
  createUpload(ownerId: string, request: PublishRequest, expiresAt: Date): Promise<PendingUpload>;
  getUpload(ownerId: string, uploadId: string): Promise<PendingUpload | null>;
  completeUpload(uploadId: string, blob: BlobMetadata): Promise<PublishResult>;
  listStaleUploads(cutoff: Date): Promise<PendingUpload[]>;
  expireUploads(uploadIds: string[]): Promise<void>;
};

export type BlobGateway = {
  createUploadUrl(input: { pathname: string; maximumSizeInBytes: number; validUntil: number }): Promise<string>;
  inspect(pathname: string): Promise<BlobMetadata | null>;
  remove(pathnames: string[]): Promise<void>;
};

type PublishingDependencies = {
  repo: PublishRepository;
  blob: BlobGateway;
  dashboardOrigin: string;
  now?: () => number;
};

export function createPublishingService({ repo, blob, dashboardOrigin, now = Date.now }: PublishingDependencies) {
  new URL(dashboardOrigin);

  return {
    async start(ownerId: string, rawRequest: PublishRequest): Promise<StartUploadResult> {
      const parsed = publishRequestSchema.safeParse({ ...rawRequest, slug: normalizeSlug(rawRequest.slug) });
      if (!parsed.success) throw new AppError("invalid_publish_request", parsed.error.issues[0]?.message ?? "Invalid publish request", 422);

      const duplicate = await repo.findDuplicate(ownerId, parsed.data.slug, parsed.data.sha256);
      if (duplicate) return { status: "duplicate", result: { ...duplicate, duplicate: true } };

      const validUntil = now() + UPLOAD_TTL_MS;
      const upload = await repo.createUpload(ownerId, parsed.data, new Date(validUntil));
      const uploadUrl = await blob.createUploadUrl({
        pathname: upload.blobPath,
        maximumSizeInBytes: Math.min(parsed.data.byteSize, MAX_HTML_BYTES),
        validUntil
      });

      return { status: "ready", uploadId: upload.id, uploadUrl, expiresAt: new Date(validUntil).toISOString() };
    },

    async complete(ownerId: string, uploadId: string): Promise<PublishResult> {
      const upload = await repo.getUpload(ownerId, uploadId);
      if (!upload) throw new AppError("upload_not_found", "Upload session not found", 404);
      if (upload.status === "completed" && upload.completedResult) return upload.completedResult;
      if (upload.status !== "pending") throw new AppError("upload_unavailable", "Upload session is not pending", 409);
      if (upload.expiresAt.getTime() <= now()) throw new AppError("upload_expired", "Upload session expired", 410);

      const metadata = await blob.inspect(upload.blobPath);
      if (!metadata) throw new AppError("blob_not_found", "Uploaded HTML was not found", 409);
      if (metadata.pathname !== upload.blobPath) throw new AppError("blob_mismatch", "Uploaded Blob path does not match the session", 409);
      if (metadata.size !== upload.byteSize) throw new AppError("blob_size_mismatch", "Uploaded Blob size does not match the declared size", 409);
      if (metadata.contentType.split(";", 1)[0]?.trim().toLowerCase() !== "text/html") throw new AppError("blob_type_mismatch", "Uploaded Blob must have the text/html content type", 409);

      return repo.completeUpload(upload.id, metadata);
    },

    async cleanupStale(cutoff = new Date(now() - 24 * 60 * 60 * 1000)): Promise<{ expired: number }> {
      const stale = await repo.listStaleUploads(cutoff);
      if (stale.length === 0) return { expired: 0 };
      await blob.remove(stale.map((upload) => upload.blobPath));
      await repo.expireUploads(stale.map((upload) => upload.id));
      return { expired: stale.length };
    }
  };
}
