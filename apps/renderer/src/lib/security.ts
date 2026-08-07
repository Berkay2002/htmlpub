export const SANDBOX_TOKENS = ["allow-scripts", "allow-downloads", "allow-popups", "allow-popups-to-escape-sandbox"] as const;

export function rendererHeaders(appOrigin = process.env.APP_ORIGIN ?? "http://localhost:3000"): HeadersInit {
  const sandbox = SANDBOX_TOKENS.join(" ");
  return {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Disposition": "inline",
    "Cache-Control": "private, no-store, max-age=0",
    "Content-Security-Policy": [
      `sandbox ${sandbox}`,
      "default-src 'none'",
      "script-src 'unsafe-inline' 'unsafe-eval' https: blob:",
      "style-src 'unsafe-inline' 'self' https:",
      "img-src https: data: blob:",
      "font-src https: data:",
      "media-src https: data: blob:",
      "connect-src https:",
      "worker-src blob:",
      "frame-src https:",
      "object-src 'none'",
      "base-uri 'none'",
      "form-action 'none'",
      `frame-ancestors ${appOrigin}`
    ].join("; "),
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  };
}

export function rendererErrorHeaders(appOrigin = process.env.APP_ORIGIN ?? "http://localhost:3000"): Headers {
  const headers = new Headers(rendererHeaders(appOrigin));
  headers.set("Content-Type", "text/plain; charset=utf-8");
  return headers;
}
