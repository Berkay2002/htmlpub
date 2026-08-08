import { decideReviewSchema } from "@htmlpub/core";
import { dataResponse, errorResponse } from "@/lib/api";
import { decideReview, getReviewWorkspace } from "@/lib/review-capability";

export async function GET(request: Request) {
  try {
    return dataResponse(await getReviewWorkspace(request));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = decideReviewSchema.parse(await request.json());
    return dataResponse(await decideReview(request, input.decision));
  } catch (error) {
    return errorResponse(error);
  }
}
