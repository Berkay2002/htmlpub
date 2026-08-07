import { auth } from "@clerk/nextjs/server";
import { AppError } from "@htmlpub/core";
import { cache } from "react";
import { getRepository } from "./repository";

export type HtmlpubScope = "documents:read" | "documents:write" | "shares:write";

export async function authenticateRequest(request: Request, requiredScope: HtmlpubScope): Promise<string> {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer htmlpub_")) {
    const principal = await getRepository().authenticateApiToken(authorization.slice("Bearer ".length));
    if (!principal) throw new AppError("invalid_token", "The API token is invalid or revoked", 401);
    if (!principal.scopes.includes(requiredScope)) throw new AppError("insufficient_scope", `The API token requires ${requiredScope}`, 403);
    return principal.ownerId;
  }

  const session = await auth();
  if (!session.userId) throw new AppError("unauthorized", "Sign in is required", 401);
  const configuredOwner = process.env.OWNER_CLERK_USER_ID;
  if (!configuredOwner || session.userId !== configuredOwner) throw new AppError("forbidden", "This workspace is restricted to its configured owner", 403);
  return session.userId;
}

export const requireOwnerPage = cache(async (): Promise<string> => {
  const session = await auth();
  if (!session.userId) throw new AppError("unauthorized", "Sign in is required", 401);
  if (!process.env.OWNER_CLERK_USER_ID || session.userId !== process.env.OWNER_CLERK_USER_ID) throw new AppError("forbidden", "This workspace is restricted to its configured owner", 403);
  return session.userId;
});
