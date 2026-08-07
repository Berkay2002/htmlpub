import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { inspectHtmlFile } from "./html-file";
import { loadConfig, resolveConfiguration } from "./config";
import { parseBoundedInteger, resolveCollection } from "./command-input";

const temporaryDirectories: string[] = [];
afterEach(async () => Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))));

describe("the installed CLI input contract", () => {
  it("derives a title, slug, byte size, and stable hash from an HTML file", async () => {
    const directory = await mkdtemp(join(tmpdir(), "htmlpub-test-")); temporaryDirectories.push(directory);
    const path = join(directory, "Launch Plan.html");
    await writeFile(path, "<!doctype html><title>Launch Plan</title><h1>Hello</h1>", "utf8");
    const file = await inspectHtmlFile(path);
    expect(file).toEqual(expect.objectContaining({ filename: "Launch Plan.html", title: "Launch Plan", slug: "launch-plan", byteSize: 55 }));
    expect(file.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("rejects companion assets and non-HTML inputs before network access", async () => {
    const directory = await mkdtemp(join(tmpdir(), "htmlpub-test-")); temporaryDirectories.push(directory);
    const path = join(directory, "notes.txt"); await writeFile(path, "notes", "utf8");
    await expect(inspectHtmlFile(path)).rejects.toThrow(".html");
  });

  it("prefers environment authentication over saved configuration", () => {
    expect(resolveConfiguration({ HTMLPUB_TOKEN: "htmlpub_env", HTMLPUB_API_URL: "https://env.example.com" }, { token: "htmlpub_saved", endpoint: "https://saved.example.com" })).toEqual({ token: "htmlpub_env", endpoint: "https://env.example.com", tokenSource: "env", endpointSource: "env" });
  });

  it("distinguishes the built-in endpoint from a saved endpoint", async () => {
    const directory = await mkdtemp(join(tmpdir(), "htmlpub-config-test-")); temporaryDirectories.push(directory);
    const saved = await loadConfig({ HTMLPUB_CONFIG_DIR: directory });
    expect(resolveConfiguration({}, saved)).toEqual({ token: undefined, endpoint: "http://localhost:3000", tokenSource: "missing", endpointSource: "default" });
  });

  it("maps agent artifact types to stable collection names", () => {
    expect(resolveCollection("summary", undefined)).toBe("Summaries");
    expect(resolveCollection("plan", undefined)).toBe("Plans");
    expect(resolveCollection("review", undefined)).toBe("Reviews");
    expect(resolveCollection("report", undefined)).toBe("Reports");
    expect(resolveCollection(undefined, " Custom ")).toBe("Custom");
  });

  it("rejects ambiguous or unknown artifact collection input", () => {
    expect(() => resolveCollection("plan", "Planning")).toThrow("either --type or --collection");
    expect(() => resolveCollection("memo", undefined)).toThrow("Unknown artifact type");
  });

  it("validates bounded pagination and version integers", () => {
    expect(parseBoundedInteger("1", "limit", { minimum: 1, maximum: 100 })).toBe(1);
    expect(parseBoundedInteger("100", "limit", { minimum: 1, maximum: 100 })).toBe(100);
    expect(() => parseBoundedInteger("101", "limit", { minimum: 1, maximum: 100 })).toThrow("between 1 and 100");
    expect(() => parseBoundedInteger("1.5", "version", { minimum: 1 })).toThrow("integer");
  });
});
