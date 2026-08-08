import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("the htmlpub review-wait skill contract", () => {
  const readSkill = (path: string) =>
    readFileSync(fileURLToPath(new URL(`../../../../${path}`, import.meta.url)), "utf8");
  const publishingSkill = readSkill("skills/publish-html-artifacts/SKILL.md");
  const managementSkill = readSkill("skills/manage-html-library/SKILL.md");
  const routerSkills = [
    readSkill("skills/htmlpub/SKILL.md"),
    readSkill(".codex/skills/htmlpub/SKILL.md"),
  ];

  it("requires accepted or cancelled current-round CLI evidence before final output", () => {
    expect(publishingSkill).toContain("Completion requires the current-round `accepted` or `cancelled` result from `review wait`");
    expect(publishingSkill).toContain("## Terminal evidence gate");
    expect(publishingSkill).toContain("`ok: true`, `timedOut: false`");
    expect(publishingSkill).toContain("`status: accepted` or `status: cancelled` for the current round");
    expect(publishingSkill).toContain("Emit a final response only after the terminal evidence gate passes");
  });

  it("keeps every non-completion state in the review loop", () => {
    expect(publishingSkill).toContain("`status: open`, `timedOut: true`, a tool timeout, and a progress update all return to the wait step");
    expect(publishingSkill).toContain("`revision_requested` and `superseded` end one round but do not complete the review loop");
    expect(publishingSkill).toMatch(/`revision_requested`: this does not pass the evidence gate\./);
    expect(publishingSkill).toMatch(/`superseded`: this does not pass the evidence gate\./);
  });

  it("uses one untimed blocking wait and never replaces it with status polling", () => {
    expect(publishingSkill).toContain("keep waiting on that same handle");
    expect(publishingSkill).toContain("Do not add a CLI timeout flag or wrap the process in a shell or tool deadline");
    expect(publishingSkill).not.toContain("--timeout");
    expect(publishingSkill).toContain("A failed wait returns to the same wait command after a bounded retry");
    expect(publishingSkill).toContain("cannot replace the subscription");
    expect(managementSkill).toContain("Let the command block without a CLI timeout or shell/tool deadline");
    expect(managementSkill).not.toContain("--timeout");
    expect(managementSkill).toContain("retry the same blocking wait after a bounded delay instead of replacing it with status polling");
    for (const routerSkill of routerSkills) {
      expect(routerSkill).toContain("only a current-round `accepted` or `cancelled` result from `review wait` completes the review loop");
      expect(routerSkill).toContain("without a CLI timeout or shell/tool deadline");
      expect(routerSkill).not.toContain("--timeout");
      expect(routerSkill).toContain("retry the same blocking wait after a bounded delay");
      expect(routerSkill).toContain("Status polling is diagnostic and never replaces the wait");
    }
  });
});
