import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

function fencedBlock(language: string, source: string): string {
  const longestRun = Math.max(0, ...Array.from(source.matchAll(/`+/g), (match) => match[0].length));
  const fence = "`".repeat(Math.max(3, longestRun + 1));
  return `\n\n${fence}${language}\n${source.trim()}\n${fence}\n\n`;
}

function visualDescription(node: HTMLElement): string | null {
  const label = node.getAttribute("aria-label")?.trim();
  if (label) return label;

  const text = Array.from(node.querySelectorAll("title, desc, text"), (child) => child.textContent?.trim())
    .filter((value): value is string => Boolean(value));
  return [...new Set(text)].join("; ") || null;
}

function visualReplacement(node: HTMLElement): string {
  const description = visualDescription(node);
  if (!description) return "";
  const kind = node.nodeName.toUpperCase() === "SVG" ? "Diagram" : "Visualization";
  return `\n\n[${kind}: ${description}]\n\n`;
}

export function htmlToMarkdown(html: string): string {
  const service = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**",
    blankReplacement: (_content, node) => ["SVG", "CANVAS"].includes(node.nodeName.toUpperCase()) ? visualReplacement(node) : ""
  });

  service.use(gfm);
  service.remove(["script", "style", "noscript", "template"]);
  service.addRule("embeddedImage", {
    filter: (node) => node.nodeName === "IMG" && (node.getAttribute("src") ?? "").trim().toLowerCase().startsWith("data:"),
    replacement: (_content, node) => {
      const alt = node.getAttribute("alt")?.trim();
      return alt ? `[Image: ${alt}]` : "";
    }
  });
  service.addRule("mermaid", {
    filter: (node) => node.classList.contains("mermaid") || node.matches('script[type="text/mermaid"]'),
    replacement: (_content, node) => {
      const source = node.textContent?.trim();
      return source ? fencedBlock("mermaid", source) : "";
    }
  });
  service.addRule("describedSvg", {
    filter: (node) => node.nodeName.toUpperCase() === "SVG",
    replacement: (_content, node) => visualReplacement(node)
  });
  service.addRule("describedCanvas", {
    filter: "canvas",
    replacement: (_content, node) => visualReplacement(node)
  });

  const markdown = service.turndown(html).trim();
  return markdown ? `${markdown}\n` : "";
}
