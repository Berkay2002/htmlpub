export function agentPrompt({ title, slug, rawUrl }: { title: string; slug: string; rawUrl: string }) {
  return [
    "Fetch this htmlpub artifact and use it as the source of truth.",
    "",
    `Artifact: ${title}`,
    `Raw HTML: ${rawUrl}`,
    "",
    "If web retrieval is blocked and an authenticated htmlpub CLI is available:",
    `htmlpub documents content ${slug} --format markdown`,
    `For exact HTML instead: htmlpub documents content ${slug} --format html`,
    "",
    "Identify whether it is a plan, summary, review, report, or another useful artifact. Then produce the most useful next step from its contents, using embedded scripts, SVG, tables, and Mermaid when relevant."
  ].join("\n");
}
