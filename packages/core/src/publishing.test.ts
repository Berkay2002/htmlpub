import { describe, expect, it, vi } from "vitest";
import type { BlobMetadata, PendingUpload, PublishRepository } from "./publishing";
import { createPublishingService } from "./publishing";

const ownerId = "owner_123";
const uploadId = "c7ff31c0-9db4-4fb3-95f8-66a414a889fb";
const documentId = "e581a9f2-ec21-4e59-a29f-d6ca15d225e6";
const versionId = "ba72a719-68a9-444d-a649-2d53d2a9d66b";
const request = {
  slug: "Launch Plan.html",
  title: "Launch plan",
  byteSize: 284,
  sha256: "a".repeat(64),
  filename: "launch-plan.html"
};

function pending(overrides: Partial<PendingUpload> = {}): PendingUpload {
  return {
    id: uploadId,
    ownerId,
    documentId,
    versionId,
    blobPath: `owners/${ownerId}/documents/${documentId}/versions/${versionId}.html`,
    byteSize: 284,
    sha256: "a".repeat(64),
    expiresAt: new Date(601_000),
    status: "pending",
    completedResult: null,
    ...overrides
  };
}

function fixture(options: { duplicate?: boolean; blob?: Partial<BlobMetadata> } = {}) {
  const result = {
    documentId,
    slug: "launch-plan",
    title: "Launch plan",
    version: 1,
    dashboardUrl: "https://app.example.com/dashboard/documents/launch-plan",
    shareUrl: null,
    duplicate: Boolean(options.duplicate)
  };
  const repo: PublishRepository = {
    findDuplicate: vi.fn(async () => options.duplicate ? result : null),
    createUpload: vi.fn(async () => pending()),
    getUpload: vi.fn(async () => pending()),
    completeUpload: vi.fn(async () => result),
    listStaleUploads: vi.fn(async () => []),
    expireUploads: vi.fn(async () => undefined)
  };
  const blob = {
    createUploadUrl: vi.fn(async () => "https://blob.example.com/upload?signature=short-lived"),
    inspect: vi.fn(async () => ({ pathname: pending().blobPath, contentType: "text/html", size: 284, etag: "etag-1", url: "https://private.blob/version.html", ...options.blob })),
    remove: vi.fn(async () => undefined)
  };
  return { service: createPublishingService({ repo, blob, dashboardOrigin: "https://app.example.com", now: () => 1_000 }), repo, blob, result };
}

describe("the two-phase publishing interface", () => {
  it("returns the existing version without uploading duplicate content", async () => {
    const { service, blob } = fixture({ duplicate: true });
    const response = await service.start(ownerId, request);
    expect(response).toEqual(expect.objectContaining({ status: "duplicate", result: expect.objectContaining({ duplicate: true }) }));
    expect(blob.createUploadUrl).not.toHaveBeenCalled();
  });

  it("issues a scoped upload and completes it after Blob metadata is verified", async () => {
    const { service, repo } = fixture();
    const started = await service.start(ownerId, request);
    expect(started).toEqual({ status: "ready", uploadId, uploadUrl: "https://blob.example.com/upload?signature=short-lived", expiresAt: "1970-01-01T00:10:01.000Z" });

    const completed = await service.complete(ownerId, uploadId);
    expect(completed.version).toBe(1);
    expect(repo.completeUpload).toHaveBeenCalledWith(uploadId, expect.objectContaining({ etag: "etag-1", size: 284 }));
  });

  it("refuses completion when the uploaded bytes do not match the declared size", async () => {
    const { service } = fixture({ blob: { size: 283 } });
    await expect(service.complete(ownerId, uploadId)).rejects.toThrow("size does not match");
  });

  it("returns an already completed upload without creating another version", async () => {
    const { service, repo, result } = fixture();
    vi.mocked(repo.getUpload).mockResolvedValue(pending({ status: "completed", completedResult: result }));
    await expect(service.complete(ownerId, uploadId)).resolves.toEqual(result);
    expect(repo.completeUpload).not.toHaveBeenCalled();
  });

  it("removes abandoned Blob objects before expiring their sessions", async () => {
    const { service, repo, blob } = fixture();
    vi.mocked(repo.listStaleUploads).mockResolvedValue([pending()]);
    await expect(service.cleanupStale(new Date(0))).resolves.toEqual({ expired: 1 });
    expect(blob.remove).toHaveBeenCalledWith([pending().blobPath]);
    expect(repo.expireUploads).toHaveBeenCalledWith([uploadId]);
  });
});
