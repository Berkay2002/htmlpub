import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export type SavedConfig = { endpoint?: string; token?: string };
export type ResolvedConfiguration = {
  endpoint: string;
  token: string | undefined;
  endpointSource: "env" | "config" | "default";
  tokenSource: "env" | "config" | "missing";
};

export function configPath(environment: Record<string, string | undefined> = process.env): string {
  return join(environment.HTMLPUB_CONFIG_DIR ?? join(homedir(), ".htmlpub"), "config.json");
}

export async function loadConfig(environment: Record<string, string | undefined> = process.env): Promise<SavedConfig> {
  try {
    return JSON.parse(await readFile(configPath(environment), "utf8")) as SavedConfig;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return {};
    throw error;
  }
}

export async function saveConfig(config: SavedConfig, environment: Record<string, string | undefined> = process.env): Promise<void> {
  const path = configPath(environment);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(config, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
}

export function resolveConfiguration(environment: Record<string, string | undefined>, saved: SavedConfig): ResolvedConfiguration {
  const endpoint = (environment.HTMLPUB_API_URL || saved.endpoint || "http://localhost:3000").replace(/\/+$/, "");
  const token = environment.HTMLPUB_TOKEN || saved.token;
  return {
    endpoint,
    token,
    endpointSource: environment.HTMLPUB_API_URL ? "env" : saved.endpoint ? "config" : "default",
    tokenSource: environment.HTMLPUB_TOKEN ? "env" : saved.token ? "config" : "missing"
  };
}

export async function promptSecret(label: string): Promise<string> {
  if (!process.stdin.isTTY) {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks).toString("utf8").trim();
  }
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    let value = "";
    process.stderr.write(label);
    stdin.setRawMode?.(true);
    stdin.resume();
    const cleanup = () => { stdin.off("data", onData); stdin.setRawMode?.(Boolean(wasRaw)); stdin.pause(); };
    const onData = (chunk: Buffer) => {
      const text = chunk.toString("utf8");
      if (text === "\u0003") { cleanup(); process.stderr.write("\n"); reject(new Error("Cancelled")); return; }
      if (text === "\r" || text === "\n") { cleanup(); process.stderr.write("\n"); resolve(value.trim()); return; }
      if (text === "\u007f" || text === "\b") { value = value.slice(0, -1); return; }
      value += text;
    };
    stdin.on("data", onData);
  });
}
