import { authenticateRequest } from "@/lib/auth";
import { errorResponse } from "@/lib/api";
import { getRepository } from "@/lib/repository";
import { rawResponse } from "@/lib/raw-response";
import { renderUrl } from "@/lib/render";
import { AppError, normalizeSlug } from "@htmlpub/core";

type Context = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Context) {
  try {
    const ownerId = await authenticateRequest(request, "documents:read");
    const { slug } = await params;
    const normalized = normalizeSlug(slug);
    const document = await getRepository().getDocument(ownerId, normalized);
    if (!document?.currentVersionId) throw new AppError("document_not_found", "Document not found", 404);
    const rendered = await fetch(renderUrl(document.currentVersionId, "raw"), { cache: "no-store" });
    return rawResponse(rendered, normalized);
  } catch (error) {
    return errorResponse(error);
  }
}
