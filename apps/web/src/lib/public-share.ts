export function publicContentNotFound(): Response {
  return new Response("Shared HTML not found", {
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
