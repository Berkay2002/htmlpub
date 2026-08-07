---
name: manage-html-library
description: Discover, inspect, open, publicly share, unshare, and restore documents in an htmlpub workspace with the htmlpub CLI. Use when Codex needs to list collections or documents, inspect immutable version history, create reader and raw-content bearer links, retrieve shared HTML, or restore an earlier version.
---

# Manage the HTML Library

Run `htmlpub --json doctor` first. Use JSON for reads and retain stable document slugs between commands.

## Discover and inspect

```powershell
htmlpub --json collections list
htmlpub --json documents list --search "launch" --limit 20
htmlpub --json documents get launch-plan
htmlpub --json documents versions launch-plan
```

Use `nextOffset` for bounded pagination. Use `htmlpub open <slug> --print` when only the authenticated dashboard URL is needed.

## Share and retrieve HTML

Sharing returns two public bearer URLs:

- `url` is the human reader page.
- `contentUrl` retrieves the latest raw HTML without htmlpub authentication. HTTP clients must follow its temporary redirect to the isolated renderer.

Both stable URLs remain valid until the share token is revoked or rotated. Anyone holding either link can access the document. Preview first and require an explicit user request before the live write:

```powershell
htmlpub --json share launch-plan --dry-run
htmlpub --json share launch-plan
htmlpub --json unshare launch-plan
```

Give another agent `contentUrl` when it needs to retrieve and analyze the HTML itself. Give a person `url` for the reader interface. Do not paste either bearer URL into public or unrelated contexts.

## Restore a version

Restoring creates a new immutable current version. Inspect history, preview, and require an explicit user request:

```powershell
htmlpub --json documents versions launch-plan
htmlpub --json documents restore launch-plan --version 2 --dry-run
htmlpub --json documents restore launch-plan --version 2
```

## Rules

- Prefer exact slug reads over repeated broad searches.
- Keep list requests bounded to 100 documents or fewer.
- Use `htmlpub --json request GET <path>` only as a read-only escape hatch.
- Never restore, share, or unshare merely to test connectivity.
