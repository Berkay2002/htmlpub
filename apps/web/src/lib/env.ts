export function appOrigin(): string {
  return process.env.NEXT_PUBLIC_APP_ORIGIN ?? "http://localhost:3000";
}

export function rendererOrigin(): string {
  return process.env.NEXT_PUBLIC_RENDERER_ORIGIN ?? "http://localhost:3001";
}

export function renderSecret(): string {
  const value = process.env.RENDER_TICKET_SECRET;
  if (!value) throw new Error("RENDER_TICKET_SECRET is required");
  return value;
}
