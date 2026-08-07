import { authenticateRequest } from "@/lib/auth";
import { dataResponse, errorResponse } from "@/lib/api";
import { getPublishingService } from "@/lib/publishing";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  try {
    const ownerId = await authenticateRequest(request, "documents:write");
    const { id } = await params;
    return dataResponse(await getPublishingService().complete(ownerId, id));
  } catch (error) {
    return errorResponse(error);
  }
}
