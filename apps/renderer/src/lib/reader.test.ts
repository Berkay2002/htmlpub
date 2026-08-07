import { describe, expect, it } from "vitest";
import { applyReaderMode } from "./reader";

describe("the artifact reader mode", () => {
  it("loads typeset and wraps body content in the docs surface", () => {
    const html = "<!doctype html><html><head><title>Report</title></head><body><h1>Report</h1><p>Content</p></body></html>";

    const readerHtml = applyReaderMode(html, "/typeset.css", "/render/ticket");

    expect(readerHtml).toContain('<link rel="stylesheet" href="/typeset.css" data-htmlpub-typeset="true">');
    expect(readerHtml).toContain('<meta name="viewport" content="width=device-width, initial-scale=1" data-htmlpub-reader-viewport="true">');
    expect(readerHtml).toContain('<style data-htmlpub-reader-style>');
    expect(readerHtml).toContain('<div class="htmlpub-reader-shell" data-htmlpub-reader="true"');
    expect(readerHtml).toContain('<article class="typeset typeset-docs max-w-[42em]"');
    expect(readerHtml).toContain('data-reader-action="toc"');
    expect(readerHtml).toContain('data-reader-action="copy"');
    expect(readerHtml).toContain('href="/render/ticket"');
    expect(readerHtml).toContain("max-width: 72rem");
    expect(readerHtml).toContain("max-width: none");
    expect(readerHtml).toContain("min-width: 0 !important");
    expect(readerHtml).toContain("white-space: normal !important");
    expect(readerHtml).toContain("margin-inline-start: auto");
    expect(readerHtml).toContain("<h1>Report</h1>");
    expect(readerHtml).toContain("</article>");
    expect(readerHtml).toContain("data-htmlpub-reader-script");
  });

  it("does not wrap a reader document twice", () => {
    const html = '<html><body><div class="typeset typeset-docs" data-htmlpub-reader="true">Already styled</div></body></html>';

    expect(applyReaderMode(html)).toBe(html);
  });

  it("normalizes an existing viewport for narrow reader surfaces", () => {
    const html = '<html><head><meta name="viewport" content="width=1200"></head><body><p>Content</p></body></html>';
    const readerHtml = applyReaderMode(html);

    expect(readerHtml).toContain('<meta name="viewport" content="width=device-width, initial-scale=1" data-htmlpub-reader-viewport="true">');
    expect(readerHtml).not.toContain('content="width=1200"');
    expect(readerHtml.match(/data-htmlpub-reader-viewport/g)).toHaveLength(1);
  });
});
