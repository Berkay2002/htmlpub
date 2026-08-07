# htmlpub design system

The production UI follows `library-dashboard.png` and `publish-modal.png` in this folder.

## Visual contract

- True white main canvas (`#ffffff`) with a cool-gray sidebar (`#f7f8fa`).
- Near-black text (`#111318`), muted text (`#667085`), hairline borders (`#dde2ea`).
- Cobalt accent (`#155eef`) used for selection, focus, links, and the primary action.
- Table-first library with open whitespace. Cards are limited to the contextual panel and modal.
- System grotesk typography, slightly condensed display headings, and deliberately sized 13-14px controls.
- Functional radii are 8-12px. Shadows appear only on overlays and the contextual panel.
- Icons use a consistent 1.5px outline. Motion is limited to modal entry, upload progress, and hover/focus state.

## Primary composition

The desktop shell has a 244px sidebar, a flexible document table, and an optional 390px contextual panel. The sidebar becomes a compact top bar below 860px. The contextual panel becomes a full-width section below the table. The publish workflow is a centered modal on desktop and a full-height sheet on small screens.

## Visible-copy lock

Above the fold: `htmlpub`, `Library`, `Collections`, `API tokens`, `Publish HTML`, `Search documents`, `All collections`, `Document`, `Collection`, `Versions`, `Updated`, `Sharing`, and `Interactive artifacts may contact third-party services.`
