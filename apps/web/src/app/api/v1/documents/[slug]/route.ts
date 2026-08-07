import { authenticateRequest } from "@/lib/auth";
import { dataResponse, errorResponse } from "@/lib/api";
import { AppError, normalizeSlug } from "@htmlpub/core";
import { getRepository } from "@/lib/repository";

type Context = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Context) {
  try {
    const ownerId = await authenticateRequest(request, "documents:read");
    const { slug } = await params;
    const document = await getRepository().getDocument(ownerId, normalizeSlug(slug));
    if (!document) throw new AppError("document_not_found", "Document not found", 404);
    return dataResponse(document);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const ownerId = await authenticateRequest(request, "documents:write");
    const { slug } = await params;
    return dataResponse(await getRepository().archiveDocument(ownerId, normalizeSlug(slug)));
  } catch (error) {
    return errorResponse(error);
  }
}
