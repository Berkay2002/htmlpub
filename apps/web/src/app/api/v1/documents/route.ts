import { authenticateRequest } from "@/lib/auth";
import { dataResponse, errorResponse } from "@/lib/api";
import { getRepository } from "@/lib/repository";

export async function GET(request: Request) {
  try {
    const ownerId = await authenticateRequest(request, "documents:read");
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "50");
    const offset = Number(url.searchParams.get("offset") ?? "0");
    const search = url.searchParams.get("search");
    const collection = url.searchParams.get("collection");
    const documents = await getRepository().listDocuments(ownerId, {
      ...(search ? { search } : {}),
      ...(collection ? { collection } : {}),
      limit: Number.isFinite(limit) ? limit : 50,
      offset: Number.isFinite(offset) ? offset : 0
    });
    return dataResponse({ documents, nextOffset: documents.length === Math.min(limit, 100) ? offset + documents.length : null });
  } catch (error) {
    return errorResponse(error);
  }
}
