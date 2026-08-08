export function publicContentNotFound(): Response {
  return new Response("Shared artifact not found", {
    status: 404,
    headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" }
  });
}

export function publicContentRedirect(location: string): Response {
  return new Response(null, {
    status: 307,
    headers: {
      "Cache-Control": "no-store",
      "Location": location,
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

export function publicRawContent(rendered: Response, slug: string): Response {
  if (!rendered.ok || !rendered.body) {
    return new Response("Shared artifact unavailable", {
      status: 502,
      headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" }
    });
  }
  return new Response(rendered.body, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `inline; filename="${slug}.html"`,
      "Content-Type": "text/plain; charset=utf-8",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
