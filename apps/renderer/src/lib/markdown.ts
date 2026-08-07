import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const MERMAID_START = /^(?:---[\s\S]*?---\s*)?(?:architecture-beta|block-beta|classDiagram|erDiagram|flowchart|gantt|gitGraph|graph|journey|mindmap|packet-beta|pie|quadrantChart|requirementDiagram|sankey-beta|sequenceDiagram|stateDiagram(?:-v2)?|timeline|xychart-beta|zenuml)\b/i;

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
  const kind = node.nodeName.toUpperCase() === "SVG" || node.querySelector("svg") ? "Diagram" : "Visualization";
  return `\n\n[${kind}: ${description}]\n\n`;
}

function isMermaid(node: HTMLElement): boolean {
  if (node.classList.contains("mermaid") || node.matches('script[type="text/mermaid"]')) return true;
  return node.nodeName.toUpperCase() === "PRE" && MERMAID_START.test(node.textContent?.trim() ?? "");
}

function preformattedSource(node: HTMLElement): string {
  if (node.nodeName.toUpperCase() !== "PRE") return node.textContent?.trim() ?? "";
  return Array.from(node.childNodes, (child) => child.nodeName.toUpperCase() === "BR" ? "<br>" : child.textContent ?? "").join("").trim();
}

function markdownCell(value: string): string {
  return value.replace(/\s+/g, " ").trim().replaceAll("|", "\\|");
}

function gridTable(node: HTMLElement): string {
  const cells = Array.from(node.children, (child) => markdownCell(child.textContent ?? ""));
  const columns = Math.sqrt(cells.length);
  if (!Number.isInteger(columns) || columns < 2) return visualReplacement(node);

  const width = Number(columns);
  const rows = Array.from({ length: width }, (_, index) => cells.slice(index * width, (index + 1) * width));
  const firstRow = cells.slice(0, width);
  const label = node.getAttribute("aria-label")?.trim();
  const title = label ? `**${label}**\n\n` : "";
  const header = `| ${firstRow.join(" | ")} |`;
  const divider = `| ${firstRow.map(() => "---").join(" | ")} |`;
  const body = rows.slice(1).map((row) => `| ${row.join(" | ")} |`).join("\n");
  return `\n\n${title}${header}\n${divider}\n${body}\n\n`;
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
  service.remove(["head", "title", "script", "style", "noscript", "template"]);
  service.remove((node) => Array.from(node.classList).some((name) => name.startsWith("htmlpub-reader-")));
  service.addRule("embeddedImage", {
    filter: (node) => node.nodeName === "IMG" && (node.getAttribute("src") ?? "").trim().toLowerCase().startsWith("data:"),
    replacement: (_content, node) => {
      const alt = node.getAttribute("alt")?.trim();
      return alt ? `[Image: ${alt}]` : "";
    }
  });
  service.addRule("barePreformattedBlock", {
    filter: (node) => node.nodeName.toUpperCase() === "PRE" && !isMermaid(node),
    replacement: (_content, node) => {
      const source = preformattedSource(node);
      if (!source) return "";
      const language = Array.from(node.classList).find((name) => name.startsWith("language-"))?.slice("language-".length) ?? "";
      return fencedBlock(language, source);
    }
  });
  service.addRule("mermaid", {
    filter: (node) => isMermaid(node),
    replacement: (_content, node) => {
      const source = preformattedSource(node);
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
  service.addRule("describedDiagram", {
    filter: (node) => node.classList.contains("diagram") && Boolean(node.querySelector("svg")),
    replacement: (_content, node) => visualReplacement(node)
  });
  service.addRule("visualTimeline", {
    filter: (node) => node.classList.contains("timeline") && Boolean(node.getAttribute("aria-label")),
    replacement: (_content, node) => visualReplacement(node)
  });
  service.addRule("riskGrid", {
    filter: (node) => node.classList.contains("risk-grid"),
    replacement: (_content, node) => gridTable(node)
  });
  service.addRule("metadataPills", {
    filter: (node) => {
      const children = Array.from(node.children);
      return node.classList.contains("meta") && children.length > 0 && children.every((child) => child.classList.contains("pill"));
    },
    replacement: (_content, node) => {
      const items = Array.from(node.children, (child) => markdownCell(child.textContent ?? "")).filter(Boolean);
      return items.length ? `\n\n${items.map((item) => `- ${item}`).join("\n")}\n\n` : "";
    }
  });
  service.addRule("metricCard", {
    filter: (node) => node.classList.contains("metric"),
    replacement: (_content, node) => {
      const parts = Array.from(node.children, (child) => markdownCell(child.textContent ?? "")).filter(Boolean);
      if (parts.length < 2) return parts[0] ?? "";
      const description = parts.slice(2).join(" ");
      return `\n- **${parts[0]}: ${parts[1]}**${description ? `: ${description}` : ""}`;
    }
  });
  service.addRule("contentsNavigation", {
    filter: (node) => node.nodeName.toUpperCase() === "NAV" && Boolean(node.getAttribute("aria-label")) && Array.from(node.children).some((child) => child.nodeName.toUpperCase() === "A"),
    replacement: (_content, node) => {
      const children = Array.from(node.children);
      const title = children.find((child) => child.nodeName.toUpperCase() === "STRONG")?.textContent?.trim() || node.getAttribute("aria-label")?.trim() || "Contents";
      const links = children.filter((child) => child.nodeName.toUpperCase() === "A").map((anchor) => {
        const label = markdownCell(anchor.textContent ?? "");
        const href = anchor.getAttribute("href") ?? "";
        return label && href ? `- [${label}](${href})` : "";
      }).filter(Boolean);
      return links.length ? `\n\n**${title}**\n\n${links.join("\n")}\n\n` : "";
    }
  });
  service.addRule("decorativeCalloutIcon", {
    filter: (node) => node.classList.contains("icon") && node.parentElement?.classList.contains("callout") === true,
    replacement: () => ""
  });
  service.addRule("mermaidDetails", {
    filter: (node) => node.nodeName.toUpperCase() === "DETAILS" && Array.from(node.querySelectorAll("pre, script"), (child) => child as HTMLElement).some(isMermaid),
    replacement: (_content, node) => {
      const sourceNode = Array.from(node.querySelectorAll("pre, script"), (child) => child as HTMLElement).find(isMermaid);
      const source = sourceNode ? preformattedSource(sourceNode) : "";
      return source ? fencedBlock("mermaid", source) : "";
    }
  });

  const markdown = service.turndown(html).trim();
  return markdown ? `${markdown}\n` : "";
}
