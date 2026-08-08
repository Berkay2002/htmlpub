import type { ApiEnvelope } from "@htmlpub/core";

export class CliApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly status?: number) { super(message); this.name = "CliApiError"; }
}

export class HtmlpubApiClient {
  constructor(private readonly endpoint: string, private readonly token: string) {}

  private async send(method: string, path: string, body?: unknown): Promise<Response> {
    const url = new URL(path, `${this.endpoint}/`);
    if (url.origin !== new URL(this.endpoint).origin) throw new CliApiError("invalid_path", "Request paths must stay on the configured htmlpub endpoint");
    return fetch(url, {
      method,
      headers: { authorization: `Bearer ${this.token}`, ...(body === undefined ? {} : { "content-type": "application/json" }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
  }

  private async responseError(response: Response): Promise<CliApiError> {
    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json") ? await response.json() as ApiEnvelope<unknown> : null;
    if (payload && !payload.ok) return new CliApiError(payload.error.code, payload.error.message, response.status);
    return new CliApiError("http_error", `htmlpub returned HTTP ${response.status}`, response.status);
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await this.send(method, path, body);
    if (!response.ok) throw await this.responseError(response);
    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json") ? await response.json() as ApiEnvelope<T> : null;
    if (!payload || !payload.ok) throw new CliApiError("invalid_response", "htmlpub returned an invalid response", response.status);
    return payload.data;
  }

  async requestBytes(method: string, path: string): Promise<Uint8Array> {
    const response = await this.send(method, path);
    if (!response.ok) throw await this.responseError(response);
    return new Uint8Array(await response.arrayBuffer());
  }

  async upload(url: string, bytes: Uint8Array): Promise<void> {
    const body = Uint8Array.from(bytes).buffer;
    const response = await fetch(url, { method: "PUT", headers: { "content-type": "text/html" }, body });
    if (!response.ok) throw new CliApiError("blob_upload_failed", `Blob upload failed with HTTP ${response.status}`, response.status);
  }
}
