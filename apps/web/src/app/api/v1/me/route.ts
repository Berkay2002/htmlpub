import { authenticateRequest } from "@/lib/auth";
import { dataResponse, errorResponse } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const ownerId = await authenticateRequest(request, "documents:read");
    return dataResponse({ ownerId, service: "htmlpub", apiVersion: "v1" });
  } catch (error) {
    return errorResponse(error);
  }
}
