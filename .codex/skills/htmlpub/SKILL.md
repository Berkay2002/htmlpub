---
name: htmlpub
description: Publish, list, open, and share self-contained HTML reports through the installed htmlpub CLI.
---

# htmlpub workflow

Verify the command and configuration first:

```bash
htmlpub --help
htmlpub --json doctor
```

Authentication comes from `HTMLPUB_TOKEN` or `htmlpub auth login`. Never print the token.

For a normal publish:

```bash
htmlpub publish ./report.html --dry-run --json
htmlpub publish ./report.html --collection Planning --json
htmlpub open report
```

Discover documents before changing sharing:

```bash
htmlpub --json list --limit 20
htmlpub share report --json
htmlpub unshare report --json
```

Rules:

- Prefer `--json` when analyzing output.
- A publish is a live write and an existing slug receives a new version.
- `share` rotates any existing link. Do not run it unless the user requested sharing or rotation.
- `unshare` revokes external access. Do not run it without explicit approval.
- Use `request GET` only when a high-level read command is missing. Raw writes are intentionally unavailable.
