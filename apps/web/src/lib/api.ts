import { AppError, type ApiEnvelope } from "@htmlpub/core";
import { ZodError } from "zod";

export function dataResponse<T>(data: T, init?: ResponseInit) {
  return Response.json({ ok: true, data } satisfies ApiEnvelope<T>, init);
}

export function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return Response.json({ ok: false, error: { code: "invalid_request", message: error.issues[0]?.message ?? "Invalid request" } } satisfies ApiEnvelope<never>, { status: 422 });
  }
  if (error instanceof AppError) {
    return Response.json({ ok: false, error: { code: error.code, message: error.message } } satisfies ApiEnvelope<never>, { status: error.status });
  }
  console.error(error);
  return Response.json({ ok: false, error: { code: "internal_error", message: "An unexpected error occurred" } } satisfies ApiEnvelope<never>, { status: 500 });
}
