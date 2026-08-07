import { readFile, stat } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import { MAX_HTML_BYTES, normalizeSlug, sha256 } from "@htmlpub/core";

export type InspectedHtmlFile = {
  path: string;
  filename: string;
  title: string;
  slug: string;
  byteSize: number;
  sha256: string;
  bytes: Buffer;
};

export async function inspectHtmlFile(inputPath: string): Promise<InspectedHtmlFile> {
  const path = resolve(inputPath);
  if (extname(path).toLowerCase() !== ".html") throw new Error("Only a self-contained .html file can be published");
  const metadata = await stat(path);
  if (!metadata.isFile()) throw new Error("The publish path must be a file");
  if (metadata.size <= 0 || metadata.size > MAX_HTML_BYTES) throw new Error("HTML files must be between 1 byte and 10 MB");
  const bytes = await readFile(path);
  let text: string;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { throw new Error("The HTML file must be valid UTF-8"); }
  const filename = basename(path);
  const title = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || filename.replace(/\.html$/i, "");
  return { path, filename, title, slug: normalizeSlug(filename), byteSize: bytes.byteLength, sha256: sha256(bytes), bytes };
}
