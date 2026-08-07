import { createRenderTicket } from "@htmlpub/core";
import { rendererOrigin, renderSecret } from "./env";

export type RenderMode = "raw" | "reader" | "markdown";

export function renderUrl(versionId: string, mode: RenderMode = "raw"): string {
  const ticket = createRenderTicket(versionId, renderSecret());
  const query = mode === "raw" ? "" : `?mode=${mode}`;
  return `${rendererOrigin()}/render/${encodeURIComponent(ticket)}${query}`;
}
