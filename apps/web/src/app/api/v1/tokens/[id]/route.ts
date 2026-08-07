import { dataResponse, errorResponse } from "@/lib/api";
import { requireOwnerPage } from "@/lib/auth";
import { getRepository } from "@/lib/repository";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const ownerId = await requireOwnerPage();
    const { id } = await params;
    return dataResponse(await getRepository().revokeApiToken(ownerId, id));
  } catch (error) {
    return errorResponse(error);
  }
}
