# htmlpub CLI

Publish self-contained UTF-8 HTML files to an htmlpub workspace from any directory.

## Install and authenticate

```bash
pnpm --filter @htmlpub/cli build
cd packages/cli
npm link
htmlpub --help
htmlpub --json doctor
htmlpub auth login --endpoint https://your-htmlpub-app.vercel.app
```

`HTMLPUB_TOKEN` overrides the saved token. `HTMLPUB_API_URL` overrides the saved endpoint. The normal config file is `~/.htmlpub/config.json`; set `HTMLPUB_CONFIG_DIR` to relocate it.

## Common jobs

```bash
htmlpub --json publish ./summary.html --type summary --dry-run
htmlpub --json publish ./summary.html --type summary
htmlpub --json publish ./plan.html --type plan --slug launch-plan
htmlpub --json collections list
htmlpub --json documents list --limit 20
htmlpub --json documents get launch-plan
htmlpub --json documents versions launch-plan
htmlpub open launch-plan
htmlpub --json share launch-plan --dry-run
htmlpub share launch-plan
htmlpub unshare launch-plan
```

`--type summary`, `plan`, `review`, or `report` assigns the matching stable collection. Use `--collection` for any other collection name. The two flags are intentionally mutually exclusive.

Publishing to an existing owner-scoped slug creates the next version. Identical content returns the existing version without uploading bytes. Use a stable `--slug` when successive agent runs should update the same artifact. Publishing automatically creates one active share link when the document has none, and later versions keep that link pointed at the latest version. `share` is the explicit rotate operation: it creates a new token and revokes any previous share link because share secrets are never stored in recoverable form.

The JSON share result contains three public bearer links:

```json
{"ok":true,"data":{"slug":"launch-plan","url":"https://htmlpub.example/s/token","markdownUrl":"https://htmlpub.example/s/token/markdown","contentUrl":"https://htmlpub.example/s/token/raw","rotated":true}}
```

Give `url` to a person for the reader page. Give `markdownUrl` to an agent by default for compact GFM text. Give `contentUrl` to an agent or HTTP client that needs the authoritative HTML bytes, scripts, or interactive structure. Both content URLs follow a temporary redirect to the isolated renderer and require no htmlpub API token. The reader page's Share to agent action copies a ready-to-paste prompt with the raw HTML link and artifact context. Revoking or rotating sharing invalidates all three stable URLs.

Restore an earlier immutable version by first inspecting history, then previewing the write:

```bash
htmlpub --json documents versions launch-plan
htmlpub --json documents restore launch-plan --version 2 --dry-run
htmlpub --json documents restore launch-plan --version 2
```

The final restore command is a live write. It switches the document's current pointer to the selected existing version. No new version is created, and history is not mutated or deleted.

## JSON policy

With `--json`, stdout contains exactly one stable envelope. Progress goes to stderr.

```json
{"ok":true,"data":{"slug":"launch-plan","version":3}}
```

```json
{"ok":false,"error":{"code":"invalid_token","message":"The API token is invalid or revoked"}}
```

`request GET <path>` is a read-only escape hatch. It uses configured authentication and refuses cross-origin URLs or write methods.

Command families use the same envelope:

```json
{"ok":true,"data":{"collections":[{"id":"...","name":"Plans","slug":"plans","createdAt":"2026-08-07T10:00:00.000Z"}]}}
```

```json
{"ok":true,"data":{"action":"publish","file":"C:\\reports\\plan.html","slug":"launch-plan","collection":"Plans","byteSize":2048,"sha256":"...","filename":"plan.html"}}
```

```json
{"ok":true,"data":{"slug":"launch-plan","currentVersion":3,"versions":[]}}
```

The API payload is passed through inside `data` for reads and completed writes. CLI-only previews also use `data` and include an `action` field. Errors use a stable `error.code` and redacted `error.message`; credentials are never included.
