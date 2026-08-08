import { dataResponse, errorResponse } from "@/lib/api";
import { getReviewStatus } from "@/lib/review-capability";

export async function GET(request: Request) {
  try {
    return dataResponse(await getReviewStatus(request));
  } catch (error) {
    return errorResponse(error);
  }
}
