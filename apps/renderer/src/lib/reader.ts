const READER_MARKER = 'data-htmlpub-reader="true"';

const READER_BRIDGE_STYLES = `
.typeset-docs {
  --typeset-font-body: var(--font-jetbrains-mono, "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);
  --typeset-font-heading: var(--font-jetbrains-mono, "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);
  --typeset-font-mono: var(--font-jetbrains-mono, "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);
  --typeset-size: 16px;
  --typeset-leading: 1.75;
  --typeset-flow: 1.25em;
  max-width: 42em;
  margin-inline: auto;
}
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

function wrapBody(html: string): string {
  const body = /<body\b[^>]*>/i.exec(html);
  if (!body) return html;

  const bodyStart = body.index + body[0].length;
  const closingBodyOffset = html.slice(bodyStart).search(/<\/body\s*>/i);
  if (closingBodyOffset < 0) return html;

  const bodyEnd = bodyStart + closingBodyOffset;
  const content = html.slice(bodyStart, bodyEnd);
  const wrapper = `<div class="typeset typeset-docs max-w-[42em]" ${READER_MARKER}>${content}</div>`;
  return `${html.slice(0, bodyStart)}${wrapper}${html.slice(bodyEnd)}`;
}

export function applyReaderMode(html: string, stylesheetHref = "/typeset.css"): string {
  if (html.includes(READER_MARKER)) return html;
  return wrapBody(injectReaderAssets(html, stylesheetHref));
}
