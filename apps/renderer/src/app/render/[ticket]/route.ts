import { get } from "@vercel/blob";
import { verifyRenderTicket } from "@htmlpub/core";
import { getDb, createRepository } from "@htmlpub/db";
import { applyReaderMode } from "@/lib/reader";
import { rendererErrorHeaders, rendererHeaders } from "@/lib/security";

type Context = { params: Promise<{ ticket: string }> };

export async function GET(request: Request, { params }: Context) {
  try {
    const { ticket } = await params;
    const readerMode = new URL(request.url).searchParams.get("mode") === "reader";
    const secret = process.env.RENDER_TICKET_SECRET;
    if (!secret) throw new Error("Renderer is not configured");
    const { versionId } = verifyRenderTicket(ticket, secret);
    const repo = createRepository(getDb(), { dashboardOrigin: process.env.APP_ORIGIN ?? "http://localhost:3000" });
    const version = await repo.getVersion(versionId);
    if (!version) return new Response("Render version not found", { status: 404, headers: rendererErrorHeaders() });
    const result = await get(version.blobUrl, { access: "private" });
    if (!result || result.statusCode !== 200) return new Response("HTML artifact not found", { status: 404, headers: rendererErrorHeaders() });
    const body = readerMode
      ? applyReaderMode(await new Response(result.stream).text(), new URL("/typeset.css", request.url).toString())
      : result.stream;
    return new Response(body, { status: 200, headers: rendererHeaders() });
  } catch (error) {
    const message = error instanceof Error && /expired|invalid/i.test(error.message) ? "Render link expired or invalid" : "Artifact could not be rendered";
    return new Response(message, { status: /expired|invalid/i.test(message) ? 401 : 500, headers: rendererErrorHeaders() });
  }
}
