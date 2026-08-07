import { del, get, issueSignedToken, presignUrl } from "@vercel/blob";
import type { BlobGateway } from "@htmlpub/core";

export function createBlobGateway(): BlobGateway {
  return {
    async createUploadUrl({ pathname, maximumSizeInBytes, validUntil }) {
      const token = await issueSignedToken({
        operations: ["put"],
        allowedContentTypes: ["text/html"],
        maximumSizeInBytes,
        validUntil
      });
      const { presignedUrl } = await presignUrl(token, {
        pathname,
        operation: "put",
        access: "private",
        validUntil,
        addRandomSuffix: false
      });
      return presignedUrl;
    },
    async inspect(pathname) {
      const result = await get(pathname, { access: "private", useCache: false });
      if (!result || result.statusCode !== 200) return null;
      await result.stream.cancel();
      return {
        pathname: result.blob.pathname,
        contentType: result.blob.contentType,
        size: result.blob.size,
        etag: result.blob.etag,
        url: result.blob.url
      };
    },
    async remove(pathnames) {
      if (pathnames.length > 0) await del(pathnames);
    }
  };
}
