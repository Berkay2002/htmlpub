import { CliApiError } from "./api-client";

export function printSuccess(data: unknown, json: boolean, human?: string): void {
  process.stdout.write(json ? `${JSON.stringify({ ok: true, data })}\n` : `${human ?? JSON.stringify(data, null, 2)}\n`);
}

export function printProgress(message: string, json: boolean): void { if (!json) process.stderr.write(`${message}\n`); }

export function printFailure(error: unknown, json: boolean): void {
  const code = error instanceof CliApiError ? error.code : "cli_error";
  const message = error instanceof Error ? error.message.replace(/htmlpub_[A-Za-z0-9_-]+/g, "htmlpub_[redacted]") : "Unknown error";
  if (json) process.stdout.write(`${JSON.stringify({ ok: false, error: { code, message } })}\n`);
  else process.stderr.write(`Error: ${message}\n`);
  process.exitCode = 1;
}
