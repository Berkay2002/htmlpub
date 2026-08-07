import { z } from "zod";

export const MAX_HTML_BYTES = 10 * 1024 * 1024;
export const UPLOAD_TTL_MS = 10 * 60 * 1000;
export const RENDER_TICKET_TTL_MS = 5 * 60 * 1000;

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
  versionCount: number;
  latestFilename: string | null;
  updatedAt: string;
  shared: boolean;
};

export type ApiEnvelope<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };
