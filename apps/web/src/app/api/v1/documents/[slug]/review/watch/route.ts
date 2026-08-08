import { authenticateRequest } from "@/lib/auth";
import { dataResponse, errorResponse } from "@/lib/api";
import { normalizeSlug, watchReviewSchema } from "@htmlpub/core";
import { getRepository } from "@/lib/repository";

type Context = { params: Promise<{ slug: string }> };

export async function POST(request: Request, { params }: Context) {
  try {
    const ownerId = await authenticateRequest(request, "documents:write");
    const { slug } = await params;
    const input = watchReviewSchema.parse(await request.json());
    return dataResponse(await getRepository().watchReview(ownerId, normalizeSlug(slug), input.roundId));
  } catch (error) {
    return errorResponse(error);
  }
}
