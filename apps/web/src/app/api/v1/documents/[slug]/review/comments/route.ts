import { authenticateRequest } from "@/lib/auth";
import { dataResponse, errorResponse } from "@/lib/api";
import { createReviewCommentSchema, normalizeSlug } from "@htmlpub/core";
import { getRepository } from "@/lib/repository";

type Context = { params: Promise<{ slug: string }> };

export async function POST(request: Request, { params }: Context) {
  try {
    const ownerId = await authenticateRequest(request, "documents:write");
    const { slug } = await params;
    const input = createReviewCommentSchema.parse(await request.json());
    return dataResponse(await getRepository().addReviewComment(ownerId, normalizeSlug(slug), input), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
