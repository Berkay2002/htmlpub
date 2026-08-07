---
name: htmlpub
description: Route htmlpub CLI work to this plugin's focused workflows. Use when an agent needs to publish self-contained HTML artifacts, inspect the htmlpub library, create public reader, Markdown, and raw-content links, retrieve shared content, or manage document versions.
---

# htmlpub workflow

Use the canonical plugin instructions carried by this repository:

- Read `skills/publish-html-artifacts/SKILL.md` for validation, dry-run, upload, and publish verification.
- Read `skills/manage-html-library/SKILL.md` for discovery, version history, public sharing, Markdown or raw HTML retrieval, revocation, and restoration.

Verify the command and configuration first:

```powershell
Get-Command htmlpub
htmlpub --json doctor
```

Authentication comes from `HTMLPUB_TOKEN` or `htmlpub auth login`. Never print the token.

For a normal publish:

```powershell
htmlpub --json publish .\report.html --type report --dry-run
htmlpub --json publish .\report.html --type report
htmlpub --json documents get report
```

Discover documents before changing sharing:

```powershell
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
