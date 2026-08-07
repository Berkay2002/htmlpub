import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(rootDir, "packages/ui/src/styles/typeset.css");
const targetPath = resolve(rootDir, "apps/renderer/public/typeset.css");

mkdirSync(dirname(targetPath), { recursive: true });
copyFileSync(sourcePath, targetPath);
