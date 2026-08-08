import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("React Aria table accessibility", () => {
  it("marks at least one row-header column in every application table", async () => {
    const sourceRoot = join(process.cwd(), "apps", "web", "src");
    const files = (await readdir(sourceRoot, { recursive: true })).filter((file) => file.endsWith(".tsx"));
    const violations: string[] = [];

    for (const file of files) {
      const source = await readFile(join(sourceRoot, file), "utf8");
      const tableCount = source.match(/<Table(?=\s)/g)?.length ?? 0;
      const rowHeaderCount = source.match(/<TableHead\b[^>]*\bisRowHeader\b/g)?.length ?? 0;
      if (rowHeaderCount < tableCount) violations.push(file);
    }

    expect(violations).toEqual([]);
  });
});
