# htmlpub

htmlpub is a private publishing and review workspace for self-contained interactive HTML reports. It provides an authenticated Next.js dashboard, immutable version history, text-anchored owner comments, blocking agent review waits, revocable latest-version share links, an isolated renderer, and an installable Node CLI.

![Library dashboard design reference](docs/design/library-dashboard.png)

## Repository layout

- `apps/web`: Clerk-authenticated dashboard, versioned HTTP interface, share pages, and cleanup cron.
- `apps/renderer`: cookie-free HTML streaming origin with signed 30-day render tickets and restrictive sandbox headers.
- `packages/core`: validation, security primitives, render tickets, and the two-phase publishing module.
- `packages/db`: Drizzle schema, Neon adapter, and generated SQL migrations.
- `packages/cli`: the `htmlpub` npm command.

## Local development

Requirements: Node 20.9 or later and pnpm 10.

```bash
pnpm install
copy .env.example .env.local
copy apps\web\.env.example apps\web\.env.local
copy apps\renderer\.env.example apps\renderer\.env.local
pnpm db:migrate
pnpm dev
```

The web app runs at `http://localhost:3000`; the renderer runs at `http://localhost:3001`.

Set the web variables in `apps/web/.env.local`, the renderer variables in `apps/renderer/.env.local`, and `DATABASE_URL` in the root `.env.local` used by migrations. Do not put Clerk variables in the renderer file. When the projects are already linked, `vercel env pull .env.local --cwd apps/web` and `vercel env pull .env.local --cwd apps/renderer` are the least error-prone setup path.

Local development uses the same Clerk, Neon, and private Blob resources as deployment. No mock data or alternate publishing path is included.

## Production setup

1. Create a Neon Postgres integration and a private Vercel Blob store from the Vercel Marketplace.
2. Create two Vercel projects from this repository. Set their root directories to `apps/web` and `apps/renderer`.
3. Connect the same Neon database and private Blob store to both projects.
4. Configure Clerk only on the web project. Disable public signups and set `OWNER_CLERK_USER_ID` to the single allowed user.
5. Set a shared, random `RENDER_TICKET_SECRET` on both projects. Set `NEXT_PUBLIC_RENDERER_ORIGIN` on web and `APP_ORIGIN` on renderer to the deployed origins.
6. Set `CRON_SECRET` on web. Vercel invokes `/api/cron/cleanup-uploads` daily at 03:17 UTC.
7. Run `pnpm db:migrate` with the production `DATABASE_URL`, then deploy the renderer and web projects.

Use a different registered origin for the renderer. It must not receive Clerk configuration or application cookies.

## Publishing interface

```text
POST /api/v1/uploads
PUT  <short-lived private Blob URL>
POST /api/v1/uploads/{uploadId}/complete
```

Upload initiation validates a UTF-8 `.html` file declaration, creates an expiring session, and returns a ten-minute Blob URL restricted to one immutable pathname, `text/html`, and the declared size. Completion inspects Blob metadata before transactionally allocating the next version number. Repeating completion is idempotent.

Share tokens are 256-bit bearer secrets stored only as SHA-256 hashes. Publishing automatically creates one active share link when a document has none; later versions keep that same link and resolve the current version. Creating a new link manually revokes the previous link because the original secret cannot be recovered. A share page and its stable `/markdown` and `/raw` content URLs resolve the current version and send only a 30-day render ticket to the isolated renderer.

Each published version also opens an authenticated review round. The owner can highlight rendered text, leave anchored comments, and accept, request revision, or cancel. `htmlpub review wait` blocks until that decision so an agent can publish a version, hand over the dashboard link, and continue in the same task without requiring the owner to return and say the review is complete.

## CLI

```bash
pnpm --filter @htmlpub/cli build
cd packages/cli
npm link
htmlpub --json doctor
htmlpub auth login --endpoint https://your-web-project.vercel.app
htmlpub --json publish ./summary.html --type summary --dry-run
htmlpub --json publish ./summary.html --type summary
htmlpub --json documents get summary
htmlpub --json review wait summary
htmlpub share report
```

See [`packages/cli/README.md`](packages/cli/README.md) for the command and JSON contracts.

## Codex plugin

This repository is the plugin root. Its manifest is in `.codex-plugin/plugin.json`, its agent workflows are under `skills/`, and `.agents/plugins/marketplace.json` points Codex at this GitHub repository. The plugin exposes separate skills for publishing artifacts and managing the HTML library.

Share creation returns a human reader `url`, an agent-friendly `markdownUrl`, and a raw HTML `contentUrl`. Give agents the Markdown link by default for compact GFM text, tables, code fences, and preserved Mermaid source blocks. Use the raw link when an agent needs the authoritative HTML, interactive code, or structure that Markdown cannot represent. The public reader also provides a Share to agent action that copies a ready-to-paste prompt with the raw HTML link and artifact context. All three are bearer links and remain valid until revoked or rotated.

After these files are available on the selected Git ref, add and install the GitHub-backed marketplace:

```bash
codex plugin marketplace add Berkay2002/htmlpub --ref main
codex plugin add htmlpub@htmlpub
```

Restart the ChatGPT desktop app and test the plugin in a new task so the installed skills are loaded.

## Claude Code plugin

This repository is also a Claude Code plugin. From the repository root, load it for a local
session with:

```bash
claude --plugin-dir .
```

The plugin exposes these namespaced skills:

```text
/htmlpub:htmlpub
/htmlpub:publish-html-artifacts
/htmlpub:manage-html-library
```

Validate the plugin before distributing it:

```bash
claude plugin validate . --strict
```

## Verification

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm --filter @htmlpub/cli pack:check
```

`pnpm db:generate` verifies the Drizzle schema and regenerates migrations after intentional schema changes. Applying a migration requires a real database and is deliberately separate from the default test suite.

## Security properties

- Uploaded HTML never runs in the authenticated app origin.
- Private Blob URLs and permanent share tokens are never exposed to artifacts.
- The renderer has no Clerk dependency, emits no application cookies, uses `Referrer-Policy: no-referrer`, and limits `frame-ancestors` to the app origin.
- The iframe and response CSP allow scripts, downloads, and user-initiated links but omit same-origin, forms, storage access, and top navigation.
- External HTTPS assets are allowed. They can observe viewer network metadata, which is disclosed in the UI.
- API tokens are named, scoped, hashed, shown once, and revocable.
