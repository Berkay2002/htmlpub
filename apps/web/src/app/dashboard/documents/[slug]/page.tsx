import { notFound } from "next/navigation";
import { ExternalLink, FileCode2 } from "lucide-react";
import { requireOwnerPage } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { renderUrl } from "@/lib/render";
import { DocumentActions, RestoreButton } from "@/components/document-actions";
import { DocumentReview } from "@/components/document-review";
import { CopyMarkdownButton } from "@/components/share-markdown-actions";
import { Badge } from "@htmlpub/ui/components/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@htmlpub/ui/components/breadcrumb";
import { buttonVariants } from "@htmlpub/ui/lib/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@htmlpub/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@htmlpub/ui/components/table";

type Props = { params: Promise<{ slug: string }> };
const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

export default async function DocumentPage({ params }: Props) {
  const [ownerId, { slug }] = await Promise.all([requireOwnerPage(), params]);
  const document = await getRepository().getDocument(ownerId, slug);
  if (!document?.currentVersionId) notFound();
  const review = await getRepository().getReviewStatus(ownerId, document.slug);
  const previewUrl = renderUrl(document.currentVersionId, "reader");
  const rawPreviewUrl = renderUrl(document.currentVersionId, "raw");
  const markdownUrl = `/api/v1/documents/${encodeURIComponent(document.slug)}/markdown`;

  return (
    <section className="flex flex-1 flex-col gap-6 px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Breadcrumb className="mb-4"><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/dashboard">Library</BreadcrumbLink></BreadcrumbItem><BreadcrumbItem><BreadcrumbPage>{document.title}</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
          <div className="flex items-start gap-3"><span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileCode2 /></span><div className="min-w-0"><h1 className="truncate text-3xl font-semibold tracking-tight sm:text-4xl">{document.title}</h1><p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><Badge variant="outline" className="rounded-lg font-normal">{document.collection ?? "Unfiled"}</Badge><span>•</span><span>current v{document.currentVersion}</span><span>•</span><span>updated {dateFormatter.format(new Date(document.updatedAt))}</span></p></div></div>
        </div>
        <div className="flex flex-wrap items-center gap-2"><CopyMarkdownButton markdownUrl={markdownUrl} /><a className={`${buttonVariants({ variant: "outline", size: "sm" })} rounded-xl`} href={previewUrl} target="_blank" rel="noreferrer"><ExternalLink data-icon="inline-start" />Open fullscreen</a></div>
      </header>

      <DocumentReview slug={document.slug} title={document.title} src={previewUrl} rawSrc={rawPreviewUrl} initialReview={review} />
      <DocumentActions slug={document.slug} shared={document.shared} />

      <Card className="rounded-2xl border-border/80 bg-card/95 shadow-sm">
        <CardHeader className="border-b border-border/70 px-5 py-4"><CardTitle className="text-sm">Version history</CardTitle><CardDescription className="mt-1 text-xs">Every publish creates an immutable version. Restore switches an existing version to current without creating a new one.</CardDescription></CardHeader>
        <CardContent className="p-0">
          <Table aria-label="Version history"><TableHeader className="border-border/70 bg-muted/35"><TableHead className="px-5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Version</TableHead><TableHead className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Source file</TableHead><TableHead className="hidden text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:table-cell">Published</TableHead><TableHead className="px-5 text-right text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Action</TableHead></TableHeader><TableBody>{document.versions.map((version) => { const current = version.id === document.currentVersionId; return <TableRow key={version.id} className="border-border/60"><TableCell className="px-5"><div className="flex items-center gap-2"><span className="font-semibold">v{version.versionNumber}</span>{current ? <Badge variant="secondary" className="rounded-lg text-[10px]">Current</Badge> : null}</div></TableCell><TableCell><span className="mono-meta text-muted-foreground">{version.sourceFilename}</span><span className="mt-1 block text-xs text-muted-foreground">{Math.ceil(version.byteSize / 1024)} KB</span></TableCell><TableCell className="hidden text-xs text-muted-foreground sm:table-cell">{dateFormatter.format(new Date(version.createdAt))}</TableCell><TableCell className="px-5 text-right">{current ? <span className="text-xs text-muted-foreground">Current</span> : <RestoreButton slug={document.slug} version={version.versionNumber} />}</TableCell></TableRow>; })}</TableBody></Table>
        </CardContent>
      </Card>
    </section>
  );
}
