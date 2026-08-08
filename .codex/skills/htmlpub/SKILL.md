---
name: htmlpub
description: Route htmlpub CLI work to the repository's plugin skills. Use when an agent needs to publish a self-contained HTML artifact and wait through owner review, or inspect, share, retrieve, or version an existing htmlpub document.
---

# htmlpub workflow

Use the canonical plugin instructions carried by this repository:

- Read `skills/publish-html-artifacts/SKILL.md` for the required publish, dashboard review link, blocking wait, revision, and acceptance loop.
- Read `skills/manage-html-library/SKILL.md` for discovery, version history, public sharing, Markdown or raw HTML retrieval, revocation, and restoration.

Verify the command and configuration first:

```bash
htmlpub --help
htmlpub --json doctor
```

Authentication comes from `HTMLPUB_TOKEN` or `htmlpub auth login`. Never print the token.

For a normal publish:

```bash
htmlpub --json publish ./report.html --type report --dry-run
htmlpub --json publish ./report.html --type report
htmlpub --json documents get report
htmlpub --json review wait report
```

Run the workflow yourself and apply the completion criterion in `publish-html-artifacts`; an open review round is still active work.

Discover documents before changing sharing:

```bash
htmlpub --json documents list --limit 20
htmlpub --json share report --dry-run
htmlpub --json share report
htmlpub --json unshare report
```

Rules:

- Prefer `--json` when analyzing output.
- A publish is a live write and an existing slug receives a new version.
- `share` returns a public reader `url`, agent-friendly `markdownUrl`, and raw HTML `contentUrl`, and rotates any existing links. Give agents `markdownUrl` by default. Do not run it unless the user requested sharing or rotation.
- `unshare` revokes external access. Do not run it without explicit approval.
- Use `request GET` only when a high-level read command is missing. Raw writes are intentionally unavailable.
