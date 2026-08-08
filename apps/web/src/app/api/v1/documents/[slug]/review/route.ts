import { authenticateRequest } from "@/lib/auth";
import { dataResponse, errorResponse } from "@/lib/api";
import { decideReviewSchema, normalizeSlug, reviewRoundIdSchema } from "@htmlpub/core";
import { getRepository } from "@/lib/repository";

type Context = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Context) {
  try {
    const ownerId = await authenticateRequest(request, "documents:read");
    const { slug } = await params;
    const requestedRoundId = new URL(request.url).searchParams.get("roundId");
    const roundId = requestedRoundId === null ? undefined : reviewRoundIdSchema.parse(requestedRoundId);
    return dataResponse(await getRepository().getReviewStatus(ownerId, normalizeSlug(slug), roundId));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request, { params }: Context) {
  try {
    const ownerId = await authenticateRequest(request, "documents:write");
    const { slug } = await params;
    const input = decideReviewSchema.parse(await request.json());
    return dataResponse(await getRepository().decideReview(ownerId, normalizeSlug(slug), input.decision));
  } catch (error) {
    return errorResponse(error);
  }
}
