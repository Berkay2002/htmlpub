import { z } from "zod";

export const MAX_HTML_BYTES = 10 * 1024 * 1024;
export const UPLOAD_TTL_MS = 10 * 60 * 1000;
export const RENDER_TICKET_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const publishRequestSchema = z.object({
  slug: z.string().min(1).max(120),
  title: z.string().trim().min(1).max(200),
  collection: z.string().trim().min(1).max(100).optional(),
  byteSize: z.number().int().positive().max(MAX_HTML_BYTES),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  filename: z.string().trim().min(1).max(255).refine((name) => name.toLowerCase().endsWith(".html"), "Only .html files are accepted")
});

export type PublishRequest = z.infer<typeof publishRequestSchema>;

export const publishResultSchema = z.object({
  documentId: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  version: z.number().int().positive(),
  dashboardUrl: z.string().url(),
  shareUrl: z.string().url().nullable(),
  shareContentUrl: z.string().url().nullable(),
  duplicate: z.boolean()
});

export type PublishResult = z.infer<typeof publishResultSchema>;

export const startUploadResultSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("duplicate"), result: publishResultSchema }),
  z.object({
    status: z.literal("ready"),
    uploadId: z.string().uuid(),
    uploadUrl: z.string().url(),
    expiresAt: z.string().datetime()
  })
]);

export type StartUploadResult = z.infer<typeof startUploadResultSchema>;

export type DocumentSummary = {
  id: string;
  slug: string;
  title: string;
  collection: string | null;
  currentVersion: number;
  versionCount: number;
  latestFilename: string | null;
  updatedAt: string;
  shared: boolean;
};

export type ShareResult = {
  url: string;
  markdownUrl: string;
  contentUrl: string;
};

export type ApiEnvelope<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };

export const reviewSelectionSchema = z.object({
  exact: z.string().min(1).max(4_000).refine((value) => value.trim().length > 0, "Selected text must contain visible characters"),
  prefix: z.string().max(500).default(""),
  suffix: z.string().max(500).default(""),
  start: z.number().int().nonnegative().nullable().default(null),
  end: z.number().int().nonnegative().nullable().default(null),
  heading: z.string().trim().min(1).max(500).nullable().default(null)
}).superRefine((selection, context) => {
  if ((selection.start === null) !== (selection.end === null)) {
    context.addIssue({ code: "custom", message: "Text positions must include both start and end" });
  } else if (selection.start !== null && selection.end !== null && selection.end < selection.start) {
    context.addIssue({ code: "custom", message: "Text position end must not precede start" });
  }
});

export const createReviewCommentSchema = z.object({
  body: z.string().trim().min(1).max(10_000),
  selection: reviewSelectionSchema
});

export const reviewDecisionSchema = z.enum(["accept", "request_revision", "cancel"]);
export const decideReviewSchema = z.object({ decision: reviewDecisionSchema });
export const reviewRoundIdSchema = z.string().uuid();
export const reviewRoundStatusSchema = z.enum(["open", "accepted", "revision_requested", "cancelled", "superseded"]);

export type ReviewSelection = z.infer<typeof reviewSelectionSchema>;
export type CreateReviewComment = z.infer<typeof createReviewCommentSchema>;
export type ReviewDecision = z.infer<typeof reviewDecisionSchema>;
export type ReviewRoundStatus = z.infer<typeof reviewRoundStatusSchema>;

export type ReviewComment = {
  id: string;
  body: string;
  selection: ReviewSelection;
  createdAt: string;
};

export type ReviewStatus = {
  slug: string;
  title: string;
  version: number;
  roundId: string;
  status: ReviewRoundStatus;
  comments: ReviewComment[];
  latestEventId: number | null;
  decidedAt: string | null;
};
