import { AppError } from "@htmlpub/core";
import { dataResponse, errorResponse } from "@/lib/api";
import { getPublishingService } from "@/lib/publishing";

export async function GET(request: Request) {
  try {
    const expected = process.env.CRON_SECRET;
    if (!expected || request.headers.get("authorization") !== `Bearer ${expected}`) throw new AppError("unauthorized", "Invalid cron authorization", 401);
    return dataResponse(await getPublishingService().cleanupStale());
  } catch (error) {
    return errorResponse(error);
  }
}
