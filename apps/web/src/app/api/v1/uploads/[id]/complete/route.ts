import { authenticateRequest } from "@/lib/auth";
import { dataResponse, errorResponse } from "@/lib/api";
import { getPublishingService } from "@/lib/publishing";
import { getRepository } from "@/lib/repository";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  try {
    const ownerId = await authenticateRequest(request, "documents:write");
    const { id } = await params;
    const result = await getPublishingService().complete(ownerId, id);
    const share = await getRepository().ensureShare(ownerId, result.slug);
    return dataResponse({ ...result, shareUrl: share?.url ?? result.shareUrl, shareContentUrl: share?.contentUrl ?? result.shareContentUrl });
  } catch (error) {
    return errorResponse(error);
  }
}
