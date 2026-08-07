import { AppError } from "@htmlpub/core";

export function markdownResponse(rendered: Response, slug: string): Response {
  if (!rendered.ok || !rendered.body) throw new AppError("markdown_unavailable", "Markdown could not be generated", 502);
  return new Response(rendered.body, {
    status: 200,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": `inline; filename="${slug}.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
