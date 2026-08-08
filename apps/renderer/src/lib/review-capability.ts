import {
  AppError,
  createRenderTicket,
  verifyReviewTicket,
  type CreateReviewComment,
  type ReviewDecision,
  type ReviewStatus,
  type ReviewTicketPayload,
  type ReviewWorkspaceAccess
} from "@htmlpub/core";
import { getRepository } from "./repository";

function ticketSecret(): string {
  const secret = process.env.RENDER_TICKET_SECRET;
  if (!secret) throw new Error("Renderer is not configured");
  return secret;
}

function readBearer(request: Request): string {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) throw new AppError("invalid_review_capability", "This review link is missing or invalid", 401);
  return authorization.slice("Bearer ".length);
}

async function bindCapability(request: Request): Promise<{ payload: ReviewTicketPayload; review: ReviewStatus }> {
  let payload: ReviewTicketPayload;
  try {
    payload = verifyReviewTicket(readBearer(request), ticketSecret());
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("invalid_review_capability", "This review link has expired or is invalid", 401);
  }

  const repository = getRepository();
  const document = await repository.getDocument(payload.ownerId, payload.slug);
  const version = document?.versions.find((candidate) => candidate.id === payload.versionId);
  if (!document || !version) throw new AppError("invalid_review_capability", "This review link is no longer available", 404);
  const review = await repository.getReviewStatus(payload.ownerId, payload.slug, payload.roundId);
  if (review.version !== version.versionNumber) throw new AppError("invalid_review_capability", "This review link does not match the requested version", 403);
  return { payload, review };
}

export async function getReviewWorkspace(request: Request): Promise<ReviewWorkspaceAccess> {
  const { payload, review } = await bindCapability(request);
  const origin = new URL(request.url).origin;
  const renderTicket = createRenderTicket(payload.versionId, ticketSecret());
  const renderBase = `${origin}/render/${encodeURIComponent(renderTicket)}`;
  const dashboardOrigin = new URL(process.env.APP_ORIGIN ?? "http://localhost:3000").origin;
  return {
    title: review.title,
    readerUrl: `${renderBase}?mode=reader`,
    rawUrl: renderBase,
    dashboardUrl: `${dashboardOrigin}/dashboard/documents/${encodeURIComponent(payload.slug)}`,
    review
  };
}

export async function addReviewComment(request: Request, input: CreateReviewComment): Promise<ReviewStatus> {
  const { payload } = await bindCapability(request);
  return getRepository().addReviewComment(payload.ownerId, payload.slug, input, payload.roundId);
}

export async function decideReview(request: Request, decision: ReviewDecision): Promise<ReviewStatus> {
  const { payload } = await bindCapability(request);
  return getRepository().decideReview(payload.ownerId, payload.slug, decision, payload.roundId);
}
