import { AppError } from "@htmlpub/core";

export function rawResponse(rendered: Response, slug: string): Response {
  if (!rendered.ok || !rendered.body) throw new AppError("raw_unavailable", "Raw HTML could not be retrieved", 502);
  return new Response(rendered.body, {
    status: 200,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": `inline; filename="${slug}.html"`,
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
