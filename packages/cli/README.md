# htmlpub CLI

Publish self-contained UTF-8 HTML files to an htmlpub workspace from any directory.

## Install and authenticate

```bash
pnpm --filter @htmlpub/cli build
pnpm --filter @htmlpub/cli link --global
htmlpub --help
htmlpub --json doctor
htmlpub auth login --endpoint https://your-htmlpub-app.vercel.app
```

`HTMLPUB_TOKEN` overrides the saved token. `HTMLPUB_API_URL` overrides the saved endpoint. The normal config file is `~/.htmlpub/config.json`; set `HTMLPUB_CONFIG_DIR` to relocate it.

## Common jobs

```bash
htmlpub publish ./plan.html --collection Planning
htmlpub publish ./plan.html --slug launch-plan --dry-run
htmlpub --json list --limit 20
htmlpub open launch-plan
htmlpub share launch-plan
htmlpub unshare launch-plan
```

Publishing to an existing owner-scoped slug creates the next version. Identical content returns the existing version without uploading bytes. `share` creates a new token and revokes any previous share link because share secrets are never stored in recoverable form.

## JSON policy

With `--json`, stdout contains exactly one stable envelope. Progress goes to stderr.

```json
{"ok":true,"data":{"slug":"launch-plan","version":3}}
```

```json
{"ok":false,"error":{"code":"invalid_token","message":"The API token is invalid or revoked"}}
```

`request GET <path>` is a read-only escape hatch. It uses configured authentication and refuses cross-origin URLs or write methods.
