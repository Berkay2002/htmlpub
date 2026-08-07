import { publishRequestSchema } from "@htmlpub/core";
import { authenticateRequest } from "@/lib/auth";
import { dataResponse, errorResponse } from "@/lib/api";
import { getPublishingService } from "@/lib/publishing";
import { getRepository } from "@/lib/repository";

export async function POST(request: Request) {
  try {
    const ownerId = await authenticateRequest(request, "documents:write");
    const input = publishRequestSchema.parse(await request.json());
    const started = await getPublishingService().start(ownerId, input);
    if (started.status !== "duplicate") return dataResponse(started, { status: 201 });
    const share = await getRepository().ensureShare(ownerId, started.result.slug);
    return dataResponse({ ...started, result: { ...started.result, shareUrl: share?.url ?? started.result.shareUrl, shareContentUrl: share?.contentUrl ?? started.result.shareContentUrl } }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
