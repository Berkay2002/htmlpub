import { publishRequestSchema } from "@htmlpub/core";
import { authenticateRequest } from "@/lib/auth";
import { dataResponse, errorResponse } from "@/lib/api";
import { getPublishingService } from "@/lib/publishing";

export async function POST(request: Request) {
  try {
    const ownerId = await authenticateRequest(request, "documents:write");
    const input = publishRequestSchema.parse(await request.json());
    return dataResponse(await getPublishingService().start(ownerId, input), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
