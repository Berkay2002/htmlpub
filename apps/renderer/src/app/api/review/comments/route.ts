import { createReviewCommentSchema } from "@htmlpub/core";
import { dataResponse, errorResponse } from "@/lib/api";
import { addReviewComment } from "@/lib/review-capability";

export async function POST(request: Request) {
  try {
    const input = createReviewCommentSchema.parse(await request.json());
    return dataResponse(await addReviewComment(request, input), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
