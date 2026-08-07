import { authenticateRequest } from "@/lib/auth";
import { dataResponse, errorResponse } from "@/lib/api";
import { AppError, normalizeSlug } from "@htmlpub/core";
import { getRepository } from "@/lib/repository";

type Context = { params: Promise<{ slug: string; version: string }> };

export async function POST(request: Request, { params }: Context) {
  try {
    const ownerId = await authenticateRequest(request, "documents:write");
    const { slug, version } = await params;
    const versionNumber = Number(version);
    if (!Number.isInteger(versionNumber) || versionNumber < 1) throw new AppError("invalid_version", "Version must be a positive integer", 422);
    return dataResponse(await getRepository().restoreVersion(ownerId, normalizeSlug(slug), versionNumber), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
