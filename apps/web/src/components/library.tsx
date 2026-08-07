import type { DocumentSummary } from "@htmlpub/core";
import { FileCode2, Globe2, LockKeyhole, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "@htmlpub/ui/components/badge";
import { buttonVariants } from "@htmlpub/ui/lib/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@htmlpub/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@htmlpub/ui/components/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@htmlpub/ui/components/table";
import { cn } from "@htmlpub/ui/lib/utils";
import { LibraryDocumentActions } from "@/components/document-actions";

const dateFormatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

export function LibraryTable({ documents, selectedSlug }: { documents: DocumentSummary[]; selectedSlug?: string }) {
  return (
    <Card className="overflow-hidden border-border/80 bg-card/95 shadow-sm">
      <CardHeader className="border-b border-border/70 px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-semibold">Published documents</CardTitle>
            <CardDescription className="mt-1 text-xs">Every upload keeps its history and its current share state.</CardDescription>
          </div>
          <span className="mono-meta text-muted-foreground">{documents.length.toString().padStart(2, "0")} items</span>
        </div>
      </CardHeader>
      {documents.length === 0 ? (
        <CardContent className="p-0">
          <Empty className="min-h-72 rounded-none border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon"><FileCode2 /></EmptyMedia>
              <EmptyTitle>No documents in this view</EmptyTitle>
              <EmptyDescription>Publish an HTML file or adjust your search and collection filters.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      ) : (
        <Table aria-label="Published documents">
          <TableHeader className="border-border/70 bg-muted/35">
            <TableHead isRowHeader className="px-4 text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:px-5">Document</TableHead>
            <TableHead className="hidden text-[11px] uppercase tracking-[0.14em] text-muted-foreground md:table-cell">Collection</TableHead>
            <TableHead className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Current</TableHead>
            <TableHead className="hidden text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:table-cell">Updated</TableHead>
            <TableHead className="px-4 text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:px-5">Sharing</TableHead>
            <TableHead className="px-4 text-right text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:px-5">Actions</TableHead>
          </TableHeader>
          <TableBody>
            {documents.map((document) => {
              const href = `/dashboard?document=${encodeURIComponent(document.slug)}`;
              const selected = document.slug === selectedSlug;
              return (
                <TableRow key={document.id} className={cn("border-border/60", selected && "bg-primary/5 hover:bg-primary/5") }>
                  <TableCell className="p-0">
                    <Link href={href} className="flex min-w-52 items-center gap-3 px-4 py-4 sm:px-5">
                      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground", selected && "border-primary/40 bg-primary/10 text-primary")}>
                        <FileCode2 data-icon="inline-start" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">{document.title}</span>
                        <span className="mono-meta mt-1 block truncate text-muted-foreground">/{document.slug}</span>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell"><Badge variant="outline" className="font-normal">{document.collection ?? "Unfiled"}</Badge></TableCell>
                  <TableCell className="mono-meta text-muted-foreground">v{document.currentVersion}</TableCell>
                  <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground sm:table-cell">{dateFormatter.format(new Date(document.updatedAt))}</TableCell>
                  <TableCell className="px-4 sm:px-5">
                    <Badge variant={document.shared ? "secondary" : "outline"} className="gap-1.5 font-normal">
                      {document.shared ? <Globe2 data-icon="inline-start" /> : <LockKeyhole data-icon="inline-start" />}
                      <span className="hidden sm:inline">{document.shared ? "Public" : "Private"}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 sm:px-5">
                    <LibraryDocumentActions slug={document.slug} title={document.title} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

type Detail = {
  slug: string;
  title: string;
  collection: string | null;
  currentVersion: number;
  currentVersionId: string | null;
  versionCount: number;
  updatedAt: string;
  shared: boolean;
  versions: Array<{ id: string; versionNumber: number; sourceFilename: string; byteSize: number; createdAt: string; restoredFromVersionId: string | null }>;
};

export function DetailPanel({ document }: { document: Detail }) {
  return (
    <aside className="border-t border-border/80 bg-background/95 p-5 lg:sticky lg:top-16 lg:h-[calc(100vh-7.95rem)] lg:overflow-y-auto lg:border-l lg:border-t-0 lg:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-primary"><FileCode2 /></span>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold tracking-tight">{document.title}</h2>
            <p className="mono-meta mt-1 truncate text-muted-foreground">/{document.slug}</p>
          </div>
        </div>
        <Link className={buttonVariants({ variant: "ghost", size: "icon-sm" })} href="/dashboard" aria-label="Close details"><X /></Link>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">{document.collection ?? "Unfiled"}</Badge>
        <span>•</span>
        <Badge variant={document.shared ? "secondary" : "outline"}>{document.shared ? "Public link" : "Private"}</Badge>
      </div>

      <Card className="border-border/70 bg-muted/25 shadow-none">
        <CardHeader className="px-4 pb-3 pt-4">
            <CardTitle className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Current version</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-2xl font-semibold tracking-tight text-primary">v{document.currentVersion}</span>
              <span className="ml-2 text-xs text-muted-foreground">{document.versionCount} total</span>
            </div>
            <span className="text-right text-xs text-muted-foreground">{dateFormatter.format(new Date(document.updatedAt))}</span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link className={buttonVariants({ size: "sm" })} href={`/dashboard/documents/${encodeURIComponent(document.slug)}`}>Open document</Link>
        <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={`/dashboard/documents/${encodeURIComponent(document.slug)}#sharing`}>{document.shared ? "Manage share" : "Share"}</Link>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Version history</h3>
        <Link className="text-xs font-medium text-primary hover:underline" href={`/dashboard/documents/${encodeURIComponent(document.slug)}`}>View all</Link>
      </div>
      <ol className="version-rail mt-4 grid gap-0">
        {document.versions.slice(0, 5).map((version) => {
          const current = version.id === document.currentVersionId;
          return (
          <li key={version.id} className="relative flex gap-3 pb-5 last:pb-0">
            <span className="version-dot mt-1" data-current={current ? "true" : "false"} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">v{version.versionNumber}</span>
                {current ? <Badge variant="secondary" className="text-[10px]">Current</Badge> : null}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{dateFormatter.format(new Date(version.createdAt))}</p>
              <p className="mono-meta mt-1 truncate text-muted-foreground">{version.sourceFilename}</p>
            </div>
          </li>
          );
        })}
      </ol>
    </aside>
  );
}
