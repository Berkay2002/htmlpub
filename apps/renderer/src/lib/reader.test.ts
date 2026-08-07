import { describe, expect, it } from "vitest";
import { applyReaderMode } from "./reader";

describe("the artifact reader mode", () => {
  it("loads typeset and wraps body content in the docs surface", () => {
    const html = "<!doctype html><html><head><title>Report</title></head><body><h1>Report</h1><p>Content</p></body></html>";

    const readerHtml = applyReaderMode(html, "/typeset.css", "/render/ticket");

    expect(readerHtml).toContain('<link rel="stylesheet" href="/typeset.css" data-htmlpub-typeset="true">');
    expect(readerHtml).toContain('<style data-htmlpub-reader-style>');
    expect(readerHtml).toContain('<div class="htmlpub-reader-shell" data-htmlpub-reader="true"');
    expect(readerHtml).toContain('<article class="typeset typeset-docs max-w-[42em]"');
    expect(readerHtml).toContain('data-reader-action="toc"');
    expect(readerHtml).toContain('data-reader-action="copy"');
    expect(readerHtml).toContain('href="/render/ticket"');
    expect(readerHtml).toContain("<h1>Report</h1>");
    expect(readerHtml).toContain("</article>");
    expect(readerHtml).toContain("data-htmlpub-reader-script");
  });

  it("does not wrap a reader document twice", () => {
    const html = '<html><body><div class="typeset typeset-docs" data-htmlpub-reader="true">Already styled</div></body></html>';

    expect(applyReaderMode(html)).toBe(html);
  });
});
