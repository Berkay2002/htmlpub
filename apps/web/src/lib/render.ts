import { createRenderTicket } from "@htmlpub/core";
import { rendererOrigin, renderSecret } from "./env";

export type RenderMode = "raw" | "reader";

export function renderUrl(versionId: string, mode: RenderMode = "raw"): string {
  const ticket = createRenderTicket(versionId, renderSecret());
  const query = mode === "reader" ? "?mode=reader" : "";
  return `${rendererOrigin()}/render/${encodeURIComponent(ticket)}${query}`;
}
