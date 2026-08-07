import { Command } from "commander";
import open from "open";
import { normalizeSlug, type DocumentSummary, type PublishResult, type StartUploadResult } from "@htmlpub/core";
import { HtmlpubApiClient } from "./api-client";
import { loadConfig, promptSecret, resolveConfiguration, saveConfig } from "./config";
import { inspectHtmlFile } from "./html-file";
import { printFailure, printProgress, printSuccess } from "./output";

const program = new Command();
program.name("htmlpub").description("Publish, version, and share self-contained HTML reports.").version("0.1.0").option("--json", "emit a stable JSON envelope on stdout");

function jsonMode(): boolean { return Boolean(program.opts().json); }

async function configuredClient() {
  const resolved = resolveConfiguration(process.env, await loadConfig());
  if (!resolved.token) throw new Error("No API token found. Set HTMLPUB_TOKEN or run `htmlpub auth login`.");
  return { client: new HtmlpubApiClient(resolved.endpoint, resolved.token), resolved };
}

program.command("doctor").description("Verify configuration, authentication, and endpoint reachability.").action(async () => {
  const saved = await loadConfig();
  const resolved = resolveConfiguration(process.env, saved);
  const report: Record<string, unknown> = { version: program.version(), endpoint: resolved.endpoint, endpointSource: resolved.endpointSource, tokenAvailable: Boolean(resolved.token), tokenSource: resolved.tokenSource, reachable: false, authenticated: false };
  if (resolved.token) {
    try { report.identity = await new HtmlpubApiClient(resolved.endpoint, resolved.token).request("GET", "/api/v1/me"); report.reachable = true; report.authenticated = true; }
    catch (error) { report.error = error instanceof Error ? error.message : "Endpoint check failed"; }
  } else report.nextStep = "Run `htmlpub auth login` or set HTMLPUB_TOKEN.";
  printSuccess(report, jsonMode(), [`Endpoint: ${report.endpoint}`, `Token: ${report.tokenAvailable ? `available from ${report.tokenSource}` : "missing"}`, `Reachable: ${report.reachable ? "yes" : "not verified"}`, `Authenticated: ${report.authenticated ? "yes" : "no"}`].join("\n"));
});

const authCommand = program.command("auth").description("Manage local CLI authentication.");
authCommand.command("login").description("Validate and save a revocable htmlpub API token.").option("--endpoint <url>", "htmlpub web origin").action(async (options: { endpoint?: string }) => {
  const saved = await loadConfig();
  const endpoint = (options.endpoint ?? process.env.HTMLPUB_API_URL ?? saved.endpoint ?? "http://localhost:3000").replace(/\/+$/, "");
  const token = await promptSecret("htmlpub API token: ");
  if (!token.startsWith("htmlpub_")) throw new Error("Expected an API token beginning with htmlpub_");
  await new HtmlpubApiClient(endpoint, token).request("GET", "/api/v1/me");
  await saveConfig({ endpoint, token });
  printSuccess({ endpoint, tokenStored: true }, jsonMode(), `Authenticated with ${endpoint}.`);
});
authCommand.command("logout").description("Remove the API token from local configuration.").action(async () => {
  const saved = await loadConfig();
  const endpoint = resolveConfiguration(process.env, saved).endpoint;
  await saveConfig({ endpoint });
  printSuccess({ endpoint, tokenStored: false }, jsonMode(), "Saved API token removed.");
});

program.command("publish").description("Publish an HTML file or create the next immutable version.")
  .argument("<file>", "self-contained .html file")
  .option("--slug <slug>", "stable document slug")
  .option("--title <title>", "document title")
  .option("--collection <name>", "collection name")
  .option("--dry-run", "validate and show metadata without uploading")
  .action(async (path: string, options: { slug?: string; title?: string; collection?: string; dryRun?: boolean }) => {
    const inspected = await inspectHtmlFile(path);
    const request = { slug: normalizeSlug(options.slug ?? inspected.slug), title: options.title?.trim() || inspected.title, ...(options.collection?.trim() ? { collection: options.collection.trim() } : {}), byteSize: inspected.byteSize, sha256: inspected.sha256, filename: inspected.filename };
    if (options.dryRun) { printSuccess({ action: "publish", file: inspected.path, ...request }, jsonMode(), `Would publish ${request.filename} as ${request.slug} (${request.byteSize} bytes).`); return; }
    const { client } = await configuredClient();
    printProgress(`Preparing ${request.slug}…`, jsonMode());
    const started = await client.request<StartUploadResult>("POST", "/api/v1/uploads", request);
    if (started.status === "duplicate") { printSuccess(started.result, jsonMode(), `${started.result.title} is already at version ${started.result.version}.\n${started.result.dashboardUrl}`); return; }
    printProgress(`Uploading ${inspected.filename}…`, jsonMode());
    await client.upload(started.uploadUrl, inspected.bytes);
    printProgress("Finalizing immutable version…", jsonMode());
    const result = await client.request<PublishResult>("POST", `/api/v1/uploads/${started.uploadId}/complete`);
    printSuccess(result, jsonMode(), `Published ${result.title} v${result.version}.\n${result.dashboardUrl}`);
  });

program.command("list").description("List documents in the workspace.")
  .option("--limit <number>", "maximum documents", "50")
  .option("--offset <number>", "pagination offset", "0")
  .option("--search <query>", "title or slug search")
  .option("--collection <slug>", "collection slug")
  .action(async (options: { limit: string; offset: string; search?: string; collection?: string }) => {
    const { client } = await configuredClient();
    const query = new URLSearchParams({ limit: options.limit, offset: options.offset });
    if (options.search) query.set("search", options.search); if (options.collection) query.set("collection", options.collection);
    const result = await client.request<{ documents: DocumentSummary[]; nextOffset: number | null }>("GET", `/api/v1/documents?${query}`);
    const human = result.documents.length ? result.documents.map((document) => `${document.slug.padEnd(28)} v${String(document.versionCount).padEnd(4)} ${document.shared ? "shared " : "private"}  ${document.title}`).join("\n") : "No documents found.";
    printSuccess(result, jsonMode(), human);
  });

program.command("open").description("Open a document in the authenticated dashboard.").argument("<slug>").option("--print", "print the URL without launching a browser").action(async (slug: string, options: { print?: boolean }) => {
  const { client, resolved } = await configuredClient();
  const document = await client.request<{ slug: string; title: string }>("GET", `/api/v1/documents/${encodeURIComponent(normalizeSlug(slug))}`);
  const url = `${resolved.endpoint}/dashboard/documents/${encodeURIComponent(document.slug)}`;
  if (!options.print) await open(url);
  printSuccess({ slug: document.slug, url, opened: !options.print }, jsonMode(), options.print ? url : `Opened ${document.title}.`);
});

program.command("share").description("Create or rotate the stable latest-version share link.").argument("<slug>").action(async (slug: string) => {
  const { client } = await configuredClient(); const normalized = normalizeSlug(slug);
  const result = await client.request<{ url: string }>("POST", `/api/v1/documents/${encodeURIComponent(normalized)}/share`);
  printSuccess({ slug: normalized, ...result, rotated: true }, jsonMode(), `Share link created. Any previous link was revoked.\n${result.url}`);
});

program.command("unshare").description("Revoke the active share link.").argument("<slug>").action(async (slug: string) => {
  const { client } = await configuredClient(); const normalized = normalizeSlug(slug);
  const result = await client.request<{ revoked: boolean }>("DELETE", `/api/v1/documents/${encodeURIComponent(normalized)}/share`);
  printSuccess({ slug: normalized, ...result }, jsonMode(), result.revoked ? `Sharing disabled for ${normalized}.` : `${normalized} was already private.`);
});

program.command("request").description("Make a raw authenticated read request.").argument("<method>", "GET").argument("<path>", "API path").action(async (method: string, path: string) => {
  if (method.toUpperCase() !== "GET") throw new Error("The raw request command is read-only and accepts GET only");
  const { client } = await configuredClient(); const result = await client.request("GET", path);
  printSuccess(result, jsonMode());
});

async function main() {
  try { await program.parseAsync(process.argv); }
  catch (error) { printFailure(error, process.argv.includes("--json")); }
}

void main();
