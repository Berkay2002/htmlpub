import { notFound } from "next/navigation";
import { Code2, ExternalLink, FileCode2 } from "lucide-react";
import { getRepository } from "@/lib/repository";
import { renderUrl } from "@/lib/render";
import { appOrigin } from "@/lib/env";
import { ReaderFrame } from "@/components/reader-frame";
import { ShareMarkdownActions } from "@/components/share-markdown-actions";
import { Alert, AlertDescription } from "@htmlpub/ui/components/alert";
import { Badge } from "@htmlpub/ui/components/badge";
import { buttonVariants } from "@htmlpub/ui/lib/button-variants";
import { Card } from "@htmlpub/ui/components/card";
import { createShareUrls } from "@htmlpub/core";

type Props = { params: Promise<{ token: string }> };

export default async function SharePage({ params }: Props) {
  const { token } = await params;
  const shared = await getRepository().resolveShare(token);
  if (!shared?.currentVersionId) notFound();
  const source = renderUrl(shared.currentVersionId, "reader");
  const shareUrls = createShareUrls(appOrigin(), token);
  const { contentUrl: rawSource, markdownUrl } = shareUrls;
  return (
    <main className="flex min-h-screen flex-col bg-muted/40">
      <header className="flex min-h-16 items-center justify-between gap-4 border-b border-border/80 bg-background px-4 sm:px-6 lg:px-8"><div className="flex min-w-0 items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileCode2 /></span><div className="typeset typeset-ui min-w-0"><strong className="block truncate text-sm font-semibold">{shared.title}</strong><span className="mono-meta mt-1 block truncate text-muted-foreground">Latest version · updated {new Date(shared.updatedAt).toLocaleDateString()}</span></div><Badge variant="secondary" className="hidden rounded-lg font-normal sm:inline-flex">Public link</Badge></div><div className="flex flex-wrap items-center justify-end gap-2"><ShareMarkdownActions title={shared.title} markdownUrl={markdownUrl} rawUrl={rawSource} /><a href={rawSource} target="_blank" rel="noreferrer" type="text/html" data-htmlpub-content-url className={`${buttonVariants({ variant: "outline", size: "sm" })} rounded-xl max-md:hidden`}><Code2 data-icon="inline-start" />Raw HTML</a><a href={source} target="_blank" rel="noreferrer" className={`${buttonVariants({ variant: "outline", size: "sm" })} rounded-xl max-lg:hidden`}><ExternalLink data-icon="inline-start" />Fullscreen</a></div></header>
      <div className="px-4 pt-3 sm:px-6 lg:px-8"><Alert className="rounded-xl border-border/70 bg-background/80 py-2"><AlertDescription className="text-xs">Interactive artifact: external resources may contact third-party services.</AlertDescription></Alert></div>
      <div className="flex min-h-0 flex-1 p-4 sm:p-6 lg:p-8"><Card className="min-h-0 flex-1 rounded-2xl border-border/80 shadow-xl"><ReaderFrame title={shared.title} src={source} rawSrc={rawSource} className="document-preview min-h-0 flex-1 rounded-2xl border-0 shadow-none" /></Card></div>
    </main>
  );
}
