import { del, head, issueSignedToken, presignUrl } from "@vercel/blob";
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
      try {
        const metadata = await head(pathname);
        return {
          pathname: metadata.pathname,
          contentType: metadata.contentType,
          size: metadata.size,
          etag: metadata.etag,
          url: metadata.url
        };
      } catch (error) {
        if (error instanceof Error && /not found|does not exist/i.test(error.message)) return null;
        throw error;
      }
    },
    async remove(pathnames) {
      if (pathnames.length > 0) await del(pathnames);
    }
  };
}
