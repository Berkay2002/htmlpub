import { authenticateRequest } from "@/lib/auth";
import { dataResponse, errorResponse } from "@/lib/api";
import { getRepository } from "@/lib/repository";

export async function GET(request: Request) {
  try {
    const ownerId = await authenticateRequest(request, "documents:read");
    const collections = await getRepository().listCollections(ownerId);
    return dataResponse({
      collections: collections.map((collection) => ({
        ...collection,
        createdAt: collection.createdAt.toISOString()
      }))
    });
  } catch (error) {
    return errorResponse(error);
  }
}
