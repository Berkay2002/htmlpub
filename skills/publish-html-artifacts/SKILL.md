---
name: publish-html-artifacts
description: Validate and publish self-contained HTML summaries, plans, reviews, and reports with the htmlpub CLI. Use when Codex needs to upload a generated .html artifact, create a new immutable version under a stable slug, assign an artifact collection, or verify a completed htmlpub publication.
---

# Publish HTML Artifacts

Use the installed `htmlpub` command from any working directory. Keep source files on disk and use JSON output for decisions.

## Publish workflow

1. Run `Get-Command htmlpub` and `htmlpub --json doctor`.
2. Confirm the deliverable is one valid UTF-8 `.html` file. Do not upload Markdown, directories, companion assets, credentials, private source data, or local file references.
3. Use `--type summary`, `plan`, `review`, or `report`. Use `--collection <name>` only outside these presets. Never combine both flags.
4. Use a stable `--slug` when later runs should version the same document.
5. Preview the upload:

   ```powershell
   htmlpub --json publish C:\path\summary.html --type summary --slug weekly-summary --dry-run
   ```

6. Publish only when the user asked to upload or publish:

   ```powershell
   htmlpub --json publish C:\path\summary.html --type summary --slug weekly-summary
   ```

7. Verify the returned slug and version:

   ```powershell
   htmlpub --json documents get weekly-summary
   ```

Return the dashboard URL, slug, version, and local source path. Do not create public links unless the user explicitly asks.

## Rules

- If auth is missing, ask the user to set `HTMLPUB_TOKEN` or run `htmlpub auth login --endpoint <url>`. Never print a token.
- Treat `--json` stdout as the machine interface. An error has `ok: false` and a nonzero exit code.
- Use `htmlpub --json request GET <path>` only when a read command is missing. Never use raw writes.
- Do not retry a publish blindly after an ambiguous transport failure. Read the stable slug first because completion is idempotent.
