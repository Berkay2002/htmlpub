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

  it("converts the document patterns that previously produced broken Markdown", () => {
    const markdown = htmlToMarkdown(`
      <!doctype html>
      <html>
        <head><title>Orbit Launch Plan</title></head>
        <body>
          <p>Product launch brief · v2.0</p>
          <h1>Orbit launch plan</h1>
          <div class="meta">
            <span class="pill">Owner: Product &amp; Platform</span>
            <span class="pill">Window: Aug–Oct 2026</span>
          </div>
          <nav aria-label="Plan contents">
            <strong>Contents</strong>
            <a href="#outcomes">Outcomes</a>
            <a href="#risks">Risks</a>
          </nav>
          <div class="metric"><small>Activation</small><b>42%</b><small>Create and share in 24h</small></div>
          <div class="callout"><div class="icon">◎</div><div><strong>Launch gate</strong><p>Proceed when ready.</p></div></div>
          <div class="diagram" role="img" aria-label="Launch dependency flow diagram"><svg><text>Research</text><text>Launch</text></svg></div>
          <details>
            <summary>View equivalent Mermaid source</summary>
            <pre>flowchart LR
  R[Research<br>Jobs + evidence] --> L[Launch]</pre>
          </details>
          <div class="timeline" aria-label="12 week roadmap"><div>W1</div><div>W2</div><span class="bar"></span></div>
          <div class="risk-grid" aria-label="Impact and likelihood matrix">
            <div class="axis">Impact</div><div class="axis">Low likelihood</div><div class="axis">Medium</div><div class="axis">High</div>
            <div class="axis">High</div><div>R1</div><div>R2</div><div>R3</div>
            <div class="axis">Medium</div><div>R4</div><div>R5</div><div>R6</div>
            <div class="axis">Low</div><div>R7</div><div>R8</div><div>R9</div>
          </div>
          <details><summary>Example release command</summary><pre># Preview
orbit publish --preview
# Promote
orbit publish --production</pre></details>
        </body>
      </html>
    `);

    expect(markdown).not.toMatch(/^Orbit Launch Plan/m);
    expect(markdown).toContain("# Orbit launch plan");
    expect(markdown).toContain("- Owner: Product & Platform\n- Window: Aug–Oct 2026");
    expect(markdown).toContain("**Contents**\n\n- [Outcomes](#outcomes)\n- [Risks](#risks)");
    expect(markdown).toContain("- **Activation: 42%**: Create and share in 24h");
    expect(markdown).not.toContain("◎");
    expect(markdown).toContain("[Diagram: Launch dependency flow diagram]");
    expect(markdown).not.toContain("Research; Launch");
    expect(markdown).toContain("```mermaid\nflowchart LR\n  R[Research<br>Jobs + evidence] --> L[Launch]\n```");
    expect(markdown).not.toContain("View equivalent Mermaid source");
    expect(markdown).toContain("[Visualization: 12 week roadmap]");
    expect(markdown).not.toContain("W1W2");
    expect(markdown).toContain("**Impact and likelihood matrix**\n\n| Impact | Low likelihood | Medium | High |");
    expect(markdown).toContain("| High | R1 | R2 | R3 |");
    expect(markdown).toContain("Example release command\n\n```\n# Preview\norbit publish --preview\n# Promote\norbit publish --production\n```");
  });
});
