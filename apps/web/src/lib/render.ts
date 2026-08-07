import { createRenderTicket } from "@htmlpub/core";
import { rendererOrigin, renderSecret } from "./env";

export function renderUrl(versionId: string): string {
  const ticket = createRenderTicket(versionId, renderSecret());
  return `${rendererOrigin()}/render/${encodeURIComponent(ticket)}`;
}
