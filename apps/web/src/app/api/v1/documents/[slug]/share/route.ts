import { authenticateRequest } from "@/lib/auth";
import { dataResponse, errorResponse } from "@/lib/api";
import { normalizeSlug } from "@htmlpub/core";
import { getRepository } from "@/lib/repository";

type Context = { params: Promise<{ slug: string }> };

export async function POST(request: Request, { params }: Context) {
  try {
    const ownerId = await authenticateRequest(request, "shares:write");
    const { slug } = await params;
    return dataResponse(await getRepository().rotateShare(ownerId, normalizeSlug(slug)), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const ownerId = await authenticateRequest(request, "shares:write");
    const { slug } = await params;
    return dataResponse(await getRepository().revokeShare(ownerId, normalizeSlug(slug)));
  } catch (error) {
    return errorResponse(error);
  }
}
