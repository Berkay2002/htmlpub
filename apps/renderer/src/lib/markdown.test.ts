import { describe, expect, it } from "vitest";
import { htmlToMarkdown } from "./markdown";

describe("HTML to Markdown conversion", () => {
  it("keeps document structure and GFM tables while removing executable content", () => {
    const markdown = htmlToMarkdown(`
      <!doctype html>
      <html>
        <head><style>body { color: red; }</style></head>
        <body>
          <h1>Release plan</h1>
          <p>Read the <a href="https://example.com/details">details</a>.</p>
          <img src="https://example.com/chart.png" alt="Quarterly revenue chart">
          <img src="data:image/png;base64,very-large-payload" alt="Embedded sparkline">
          <table>
            <thead><tr><th>Owner</th><th>Status</th></tr></thead>
            <tbody><tr><td>Ada</td><td>Ready</td></tr></tbody>
          </table>
          <script>window.secret = "do not copy";</script>
        </body>
      </html>
    `);

    expect(markdown).toContain("# Release plan");
    expect(markdown).toContain("[details](https://example.com/details)");
    expect(markdown).toContain("![Quarterly revenue chart](https://example.com/chart.png)");
    expect(markdown).toContain("[Image: Embedded sparkline]");
    expect(markdown).not.toContain("very-large-payload");
    expect(markdown).toContain("| Owner | Status |");
    expect(markdown).toContain("| Ada | Ready |");
    expect(markdown).not.toContain("color: red");
    expect(markdown).not.toContain("window.secret");
  });

  it("preserves Mermaid source and accessible descriptions for rendered visuals", () => {
    const markdown = htmlToMarkdown(`
      <main>
        <pre class="mermaid">flowchart LR\n  A --> B</pre>
        <svg role="img" aria-label="Revenue rose from 10 to 14"></svg>
        <canvas aria-label="Latency distribution"></canvas>
      </main>
    `);

    expect(markdown).toContain("```mermaid\nflowchart LR\n  A --> B\n```");
    expect(markdown).toContain("[Diagram: Revenue rose from 10 to 14]");
    expect(markdown).toContain("[Visualization: Latency distribution]");
  });
});
