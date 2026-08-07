import { z } from "zod";
import { dataResponse, errorResponse } from "@/lib/api";
import { requireOwnerPage } from "@/lib/auth";
import { getRepository } from "@/lib/repository";

const createTokenSchema = z.object({ name: z.string().trim().min(1).max(80) });

export async function GET() {
  try {
    const ownerId = await requireOwnerPage();
    return dataResponse(await getRepository().listApiTokens(ownerId));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const ownerId = await requireOwnerPage();
    const { name } = createTokenSchema.parse(await request.json());
    return dataResponse(await getRepository().createApiToken(ownerId, name), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
