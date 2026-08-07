const READER_MARKER = 'data-htmlpub-reader="true"';

const READER_BRIDGE_STYLES = `
:root {
  color-scheme: light dark;
}

body.htmlpub-reader-body {
  min-width: 0;
  margin: 0;
  background: var(--reader-bg);
  color: var(--reader-ink);
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.htmlpub-reader-shell {
  --reader-bg: #ffffff;
  --reader-panel: #f8fafc;
  --reader-border: #e2e8f0;
  --reader-ink: #0f172a;
  --reader-muted: #64748b;
  --reader-accent: #2563eb;
  position: relative;
  max-width: 100rem;
  margin-inline: auto;
  padding: clamp(0.75rem, 2vw, 1.5rem);
  color-scheme: light;
}

.htmlpub-reader-shell[data-reader-theme="dark"] {
  --reader-bg: #0b1220;
  --reader-panel: #111827;
  --reader-border: #334155;
  --reader-ink: #e5e7eb;
  --reader-muted: #94a3b8;
  --reader-accent: #93c5fd;
  color-scheme: dark;
}

@media (prefers-color-scheme: dark) {
  .htmlpub-reader-shell[data-reader-theme="system"] {
    --reader-bg: #0b1220;
    --reader-panel: #111827;
    --reader-border: #334155;
    --reader-ink: #e5e7eb;
    --reader-muted: #94a3b8;
    --reader-accent: #93c5fd;
    color-scheme: dark;
  }
}

.htmlpub-reader-shell,
.htmlpub-reader-shell * {
  box-sizing: border-box;
}

.htmlpub-reader-shell .typeset-docs {
  --typeset-font-body: var(--font-jetbrains-mono, "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);
  --typeset-font-heading: var(--font-jetbrains-mono, "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);
  --typeset-font-mono: var(--font-jetbrains-mono, "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);
  --typeset-size: 16px;
  --typeset-leading: 1.75;
  --typeset-flow: 1.25em;
  --color-foreground: var(--reader-ink);
  --color-border: var(--reader-border);
  --color-muted-foreground: var(--reader-muted);
  --color-muted: var(--reader-panel);
  --color-primary: var(--reader-accent);
  --color-ring: var(--reader-accent);
  width: 100%;
  max-width: 72rem;
  margin-inline: auto;
}

.htmlpub-reader-shell[data-reader-scale="sm"] .typeset-docs {
  --typeset-size: 14px;
}

.htmlpub-reader-shell[data-reader-scale="lg"] .typeset-docs {
  --typeset-size: 18px;
}

.htmlpub-reader-shell[data-reader-width="narrow"] .typeset-docs {
  max-width: 42rem;
}

.htmlpub-reader-shell[data-reader-width="wide"] .typeset-docs {
  max-width: none;
}

.htmlpub-reader-skip {
  position: fixed;
  z-index: 10;
  top: 0.75rem;
  left: 0.75rem;
  transform: translateY(-180%);
  border-radius: 0.5rem;
  background: var(--reader-ink);
  color: var(--reader-bg);
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  transition: transform 120ms ease;
}

.htmlpub-reader-skip:focus {
  transform: translateY(0);
}

.htmlpub-reader-toolbar {
  position: static;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: min(100%, 76rem);
  margin-inline: auto;
  margin-block-end: 1rem;
  border: 1px solid var(--reader-border);
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--reader-bg) 92%, transparent);
  padding: 0.5rem;
  box-shadow: 0 0.75rem 2rem color-mix(in srgb, var(--reader-ink) 8%, transparent);
  backdrop-filter: blur(0.75rem);
}

.htmlpub-reader-toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 0;
}

.htmlpub-reader-toolbar-label {
  overflow: hidden;
  color: var(--reader-muted);
  font-size: 0.75rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.htmlpub-reader-control {
  min-height: 2rem;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--reader-ink);
  padding: 0.35rem 0.55rem;
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
}

.htmlpub-reader-control:hover,
.htmlpub-reader-control:focus-visible {
  border-color: var(--reader-border);
  background: var(--reader-panel);
}

.htmlpub-reader-control:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.htmlpub-reader-control-primary {
  border-color: color-mix(in srgb, var(--reader-accent) 35%, var(--reader-border));
  color: var(--reader-accent);
}

.htmlpub-reader-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
}

.htmlpub-reader-layout[data-reader-toc-open="true"] {
  grid-template-columns: minmax(12rem, 16rem) minmax(0, 1fr);
}

.htmlpub-reader-toc {
  position: sticky;
  top: 4.75rem;
  max-height: calc(100vh - 6rem);
  overflow: auto;
  border: 1px solid var(--reader-border);
  border-radius: 0.75rem;
  background: var(--reader-panel);
  padding: 0.75rem;
}

.htmlpub-reader-toc[hidden] {
  display: none;
}

.htmlpub-reader-toc-title {
  margin-block-end: 0.5rem;
  color: var(--reader-muted);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.htmlpub-reader-toc-list {
  display: grid;
  gap: 0.15rem;
}

.htmlpub-reader-toc-list a {
  display: block;
  border-radius: 0.4rem;
  color: var(--reader-muted);
  padding: 0.35rem 0.45rem;
  font-size: 0.75rem;
  line-height: 1.35;
  text-decoration: none;
}

.htmlpub-reader-toc-list a[data-level="2"] {
  padding-inline-start: 0.9rem;
}

.htmlpub-reader-toc-list a[data-level="3"] {
  padding-inline-start: 1.35rem;
}

.htmlpub-reader-toc-list a:hover,
.htmlpub-reader-toc-list a[aria-current="true"] {
  background: var(--reader-bg);
  color: var(--reader-ink);
}

.htmlpub-reader-progress {
  position: fixed;
  z-index: 20;
  top: 0;
  right: 0;
  left: 0;
  height: 0.18rem;
  transform: scaleX(0);
  transform-origin: left center;
  background: var(--reader-accent);
  pointer-events: none;
}

.htmlpub-reader-backtop {
  position: static;
  z-index: 6;
  display: block;
  margin-inline-start: auto;
  margin-block-start: 1rem;
  border: 1px solid var(--reader-border);
  border-radius: 999px;
  background: var(--reader-bg);
  color: var(--reader-ink);
  padding: 0.5rem 0.75rem;
  font: inherit;
  font-size: 0.75rem;
  box-shadow: 0 0.75rem 2rem color-mix(in srgb, var(--reader-ink) 12%, transparent);
  cursor: pointer;
}

.htmlpub-reader-backtop[hidden] {
  display: none;
}

.htmlpub-reader-image-dialog {
  max-width: min(92vw, 70rem);
  max-height: 90vh;
  border: 1px solid var(--reader-border);
  border-radius: 0.75rem;
  background: var(--reader-bg);
  padding: 0.5rem;
  color: var(--reader-ink);
}

.htmlpub-reader-image-dialog::backdrop {
  background: color-mix(in srgb, #000 72%, transparent);
}

.htmlpub-reader-image-dialog img {
  display: block;
  max-width: 88vw;
  max-height: 82vh;
  object-fit: contain;
}

.htmlpub-reader-image-dialog button {
  display: block;
  margin-inline-start: auto;
  border: 0;
  background: transparent;
  color: inherit;
  padding: 0.35rem 0.5rem;
  cursor: pointer;
}

.typeset-docs img {
  cursor: zoom-in;
}

.typeset-docs .not-typeset img,
.typeset-docs [data-not-typeset] img {
  cursor: default;
}

.typeset-docs a[data-reader-external]::after {
  content: " ↗";
  color: var(--reader-muted);
  font-size: 0.8em;
}

@media (max-width: 52rem) {
  .htmlpub-reader-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .htmlpub-reader-toolbar-group:last-child {
    width: 100%;
    overflow-x: auto;
  }

  .htmlpub-reader-layout[data-reader-toc-open="true"] {
    grid-template-columns: minmax(0, 1fr);
  }

  .htmlpub-reader-toc {
    position: static;
    max-height: none;
  }
}

@media print {
  .htmlpub-reader-shell {
    max-width: none;
    padding: 0;
  }

  .htmlpub-reader-toolbar,
  .htmlpub-reader-toc,
  .htmlpub-reader-progress,
  .htmlpub-reader-backtop {
    display: none !important;
  }

  .htmlpub-reader-shell .typeset-docs,
  .htmlpub-reader-shell[data-reader-width="narrow"] .typeset-docs,
  .htmlpub-reader-shell[data-reader-width="wide"] .typeset-docs {
    max-width: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .htmlpub-reader-skip {
    transition: none;
  }
}
`;

const READER_RUNTIME_SCRIPT = `
(function () {
  var shell = document.querySelector("[data-htmlpub-reader-shell]");
  var content = document.getElementById("htmlpub-reader-content");
  if (!shell || !content) return;

  document.body.classList.add("htmlpub-reader-body");

  var toc = document.getElementById("htmlpub-reader-toc");
  var tocList = document.querySelector("[data-reader-toc-list]");
  var progress = document.querySelector("[data-reader-progress]");
  var backTop = document.querySelector("[data-reader-backtop]");
  var imageDialog = document.querySelector("[data-reader-image-dialog]");
  var imagePreview = document.querySelector("[data-reader-image-preview]");
  var inFrame = window.parent !== window;
  var defaults = { scale: "md", width: "comfortable", theme: "system" };
  var preferences = readLocalPreferences() || defaults;

  function validPreference(value, allowed, fallback) {
    return allowed.indexOf(value) >= 0 ? value : fallback;
  }

  function normalizePreferences(value) {
    value = value || {};
    return {
      scale: validPreference(value.scale, ["sm", "md", "lg"], defaults.scale),
      width: validPreference(value.width, ["narrow", "comfortable", "wide"], defaults.width),
      theme: validPreference(value.theme, ["system", "light", "dark"], defaults.theme)
    };
  }

  function readLocalPreferences() {
    try {
      return normalizePreferences(JSON.parse(localStorage.getItem("htmlpub-reader-preferences") || "null"));
    } catch (_error) {
      return null;
    }
  }

  function saveLocalPreferences(value) {
    try {
      localStorage.setItem("htmlpub-reader-preferences", JSON.stringify(value));
    } catch (_error) {
      return;
    }
  }

  function sendToParent(message) {
    if (inFrame) window.parent.postMessage(message, "*");
  }

  function updateControlLabels() {
    var widthButton = document.querySelector('[data-reader-action="width"]');
    var themeButton = document.querySelector('[data-reader-action="theme"]');
    var widthLabels = { narrow: "Width: Narrow", comfortable: "Width: Comfortable", wide: "Width: Wide" };
    var themeLabels = { system: "Theme: System", light: "Theme: Light", dark: "Theme: Dark" };
    if (widthButton) widthButton.textContent = widthLabels[preferences.width];
    if (themeButton) themeButton.textContent = themeLabels[preferences.theme];
  }

  function applyPreferences(next, notify) {
    preferences = normalizePreferences(next);
    shell.dataset.readerScale = preferences.scale;
    shell.dataset.readerWidth = preferences.width;
    shell.dataset.readerTheme = preferences.theme;
    updateControlLabels();
    if (notify) {
      saveLocalPreferences(preferences);
      sendToParent({ type: "htmlpub-reader-preferences", preferences: preferences });
    }
  }

  function cyclePreference(name, values) {
    var index = values.indexOf(preferences[name]);
    var next = values[(index + 1) % values.length];
    var updated = { scale: preferences.scale, width: preferences.width, theme: preferences.theme };
    updated[name] = next;
    applyPreferences(updated, true);
  }

  function showCopyState(button, label) {
    if (!button) return;
    var original = button.textContent;
    button.textContent = label;
    window.setTimeout(function () { button.textContent = original; }, 1400);
  }

  function fallbackCopy(text) {
    var input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    try { document.execCommand("copy"); } catch (_error) { /* best effort */ }
    input.remove();
  }

  function copyLink(button) {
    var text = window.location.href;
    if (inFrame) {
      sendToParent({ type: "htmlpub-reader-copy", text: text });
      showCopyState(button, "Copy requested");
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { showCopyState(button, "Copied"); }).catch(function () { fallbackCopy(text); showCopyState(button, "Copied"); });
    } else {
      fallbackCopy(text);
      showCopyState(button, "Copied");
    }
  }

  function slugify(value) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "section";
  }

  function buildTableOfContents() {
    if (!tocList) return [];
    var headings = Array.prototype.slice.call(content.querySelectorAll("h1, h2, h3"));
    var used = {};
    tocList.textContent = "";
    headings.forEach(function (heading, index) {
      var base = heading.id || slugify(heading.textContent || "section");
      var id = base;
      var suffix = 2;
      while (used[id] || (document.getElementById(id) && document.getElementById(id) !== heading)) {
        id = base + "-" + suffix;
        suffix += 1;
      }
      heading.id = id;
      used[id] = true;

      var link = document.createElement("a");
      link.href = "#" + id;
      link.textContent = heading.textContent || "Section " + (index + 1);
      link.dataset.level = heading.tagName.slice(1);
      link.addEventListener("click", function () {
        if (window.innerWidth <= 832) {
          toc.hidden = true;
          document.querySelector("[data-reader-layout]").dataset.readerTocOpen = "false";
          document.querySelector('[data-reader-action="toc"]').setAttribute("aria-expanded", "false");
        }
      });
      tocList.appendChild(link);
    });

    var tocButton = document.querySelector('[data-reader-action="toc"]');
    if (tocButton) tocButton.disabled = headings.length === 0;
    return headings;
  }

  function enhanceContent() {
    content.querySelectorAll("table").forEach(function (table) {
      if (table.closest(".typeset-scroll, .not-typeset, [data-not-typeset]")) return;
      var wrapper = document.createElement("div");
      wrapper.className = "typeset-scroll";
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });

    content.querySelectorAll("a[href]").forEach(function (link) {
      try {
        var url = new URL(link.href, window.location.href);
        if (url.protocol === "http:" || url.protocol === "https:") {
          link.dataset.readerExternal = "true";
          link.target = "_blank";
          link.rel = "noreferrer noopener";
        }
      } catch (_error) {
        return;
      }
    });
  }

  function setupImageZoom() {
    if (!imageDialog || !imagePreview) return;
    content.addEventListener("click", function (event) {
      var image = event.target.closest && event.target.closest("img");
      if (!image || image.closest(".not-typeset, [data-not-typeset]")) return;
      imagePreview.src = image.currentSrc || image.src;
      imagePreview.alt = image.alt || "Expanded image";
      if (imageDialog.showModal) imageDialog.showModal();
    });
  }

  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (progress) {
      progress.style.transform = "scaleX(" + ratio + ")";
      progress.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
    }
    if (backTop) backTop.hidden = window.scrollY < 480;
  }

  function setupActiveHeading(headings) {
    if (!window.IntersectionObserver) return;
    var links = Array.prototype.slice.call(document.querySelectorAll("[data-reader-toc-list] a"));
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) { link.setAttribute("aria-current", link.getAttribute("href") === "#" + entry.target.id ? "true" : "false"); });
      });
    }, { rootMargin: "-15% 0px -70% 0px" });
    headings.forEach(function (heading) { observer.observe(heading); });
  }

  document.addEventListener("click", function (event) {
    var target = event.target.closest && event.target.closest("[data-reader-action]");
    if (!target) return;
    var action = target.dataset.readerAction;
    if (action === "toc") {
      var layout = document.querySelector("[data-reader-layout]");
      var open = target.getAttribute("aria-expanded") !== "true";
      toc.hidden = !open;
      layout.dataset.readerTocOpen = String(open);
      target.setAttribute("aria-expanded", String(open));
    } else if (action === "font-decrease") {
      cyclePreference("scale", ["lg", "md", "sm"]);
    } else if (action === "font-increase") {
      cyclePreference("scale", ["sm", "md", "lg"]);
    } else if (action === "width") {
      cyclePreference("width", ["narrow", "comfortable", "wide"]);
    } else if (action === "theme") {
      cyclePreference("theme", ["system", "light", "dark"]);
    } else if (action === "copy") {
      copyLink(target);
    } else if (action === "backtop") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (action === "close-image" && imageDialog) {
      imageDialog.close();
    }
  });

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  window.addEventListener("message", function (event) {
    if (event.source !== window.parent || !event.data) return;
    if (event.data.type === "htmlpub-reader-preferences") applyPreferences(event.data.preferences, false);
  });

  applyPreferences(preferences, false);
  var headings = buildTableOfContents();
  enhanceContent();
  setupImageZoom();
  setupActiveHeading(headings);
  updateProgress();
  sendToParent({ type: "htmlpub-reader-ready" });
})();
`;

function escapeAttribute(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

function injectReaderAssets(html: string, stylesheetHref: string): string {
  const assets = `<link rel="stylesheet" href="${escapeAttribute(stylesheetHref)}" data-htmlpub-typeset="true">\n<style data-htmlpub-reader-style>${READER_BRIDGE_STYLES}</style>`;
  const head = /<head\b[^>]*>/i.exec(html);
  if (head) {
    const insertAt = head.index + head[0].length;
    return `${html.slice(0, insertAt)}${assets}${html.slice(insertAt)}`;
  }

  const body = /<body\b[^>]*>/i.exec(html);
  if (body) {
    return `${html.slice(0, body.index)}${assets}${html.slice(body.index)}`;
  }

  return `${assets}${html}`;
}

function wrapBody(html: string, rawHref: string): string {
  const body = /<body\b[^>]*>/i.exec(html);
  if (!body) return html;

  const bodyStart = body.index + body[0].length;
  const closingBodyOffset = html.slice(bodyStart).search(/<\/body\s*>/i);
  if (closingBodyOffset < 0) return html;

  const bodyEnd = bodyStart + closingBodyOffset;
  const content = html.slice(bodyStart, bodyEnd);
  const wrapper = `<div class="htmlpub-reader-shell" ${READER_MARKER} data-htmlpub-reader-shell data-reader-scale="md" data-reader-width="comfortable" data-reader-theme="system">
  <a class="htmlpub-reader-skip" href="#htmlpub-reader-content">Skip to content</a>
  <div class="htmlpub-reader-progress" data-reader-progress role="progressbar" aria-label="Reading progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>
  <header class="htmlpub-reader-toolbar" aria-label="Reader controls">
    <div class="htmlpub-reader-toolbar-group">
      <button class="htmlpub-reader-control htmlpub-reader-control-primary" type="button" data-reader-action="toc" aria-expanded="false">Contents</button>
      <span class="htmlpub-reader-toolbar-label">Reader mode</span>
    </div>
    <div class="htmlpub-reader-toolbar-group">
      <button class="htmlpub-reader-control" type="button" data-reader-action="font-decrease" aria-label="Decrease text size">A−</button>
      <button class="htmlpub-reader-control" type="button" data-reader-action="font-increase" aria-label="Increase text size">A+</button>
      <button class="htmlpub-reader-control" type="button" data-reader-action="width">Width: Comfortable</button>
      <button class="htmlpub-reader-control" type="button" data-reader-action="theme">Theme: System</button>
      <button class="htmlpub-reader-control" type="button" data-reader-action="copy">Copy link</button>
      <a class="htmlpub-reader-control" href="${escapeAttribute(rawHref)}" target="_blank" rel="noreferrer noopener">Original</a>
    </div>
  </header>
  <div class="htmlpub-reader-layout" data-reader-layout data-reader-toc-open="false">
    <aside class="htmlpub-reader-toc" id="htmlpub-reader-toc" hidden>
      <div class="htmlpub-reader-toc-title">Contents</div>
      <nav class="htmlpub-reader-toc-list" data-reader-toc-list aria-label="Table of contents"></nav>
    </aside>
    <article class="typeset typeset-docs max-w-[42em]" id="htmlpub-reader-content" tabindex="-1">${content}</article>
  </div>
  <button class="htmlpub-reader-backtop" type="button" data-reader-action="backtop" data-reader-backtop hidden>Back to top</button>
  <dialog class="htmlpub-reader-image-dialog" data-reader-image-dialog>
    <button type="button" data-reader-action="close-image" aria-label="Close image">Close</button>
    <img data-reader-image-preview alt="" />
  </dialog>
</div>
<script data-htmlpub-reader-script>${READER_RUNTIME_SCRIPT}</script>`;
  return `${html.slice(0, bodyStart)}${wrapper}${html.slice(bodyEnd)}`;
}

export function applyReaderMode(html: string, stylesheetHref = "/typeset.css", rawHref = "?mode=raw"): string {
  if (html.includes(READER_MARKER)) return html;
  return wrapBody(injectReaderAssets(html, stylesheetHref), rawHref);
}
