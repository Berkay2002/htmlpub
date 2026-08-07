import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";
import { requireOwnerPage } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { Badge } from "@htmlpub/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@htmlpub/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@htmlpub/ui/components/empty";
import { buttonVariants } from "@htmlpub/ui/components/button";

export default async function CollectionsPage() {
  const ownerId = await requireOwnerPage();
  const rows = await getRepository().listCollections(ownerId);

  return (
    <section className="flex flex-1 flex-col gap-7 px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <header className="typeset typeset-ui max-w-2xl">
        <p className="mono-meta mb-2 uppercase tracking-[0.16em] text-primary">Workspace structure</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Collections</h1>
        <p className="mt-2 text-sm text-muted-foreground">Collections are created automatically when you publish, so your library stays organized as it grows.</p>
      </header>

      <Card className="max-w-3xl rounded-2xl border-border/80 bg-card/95 shadow-sm">
        <CardHeader className="border-b border-border/70 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div><CardTitle className="text-sm">Your collections</CardTitle><CardDescription className="mt-1 text-xs">{rows.length} active {rows.length === 1 ? "collection" : "collections"}</CardDescription></div>
            <Badge variant="outline" className="rounded-lg font-normal">Auto-managed</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <Empty className="min-h-72 rounded-none border-0">
              <EmptyHeader><EmptyMedia variant="icon"><FolderKanban /></EmptyMedia><EmptyTitle>No collections yet</EmptyTitle><EmptyDescription>Publish your first HTML artifact with a collection name to create one.</EmptyDescription></EmptyHeader>
            </Empty>
          ) : (
            <div className="divide-y divide-border/70">
              {rows.map((collection) => (
                <Link key={collection.id} href={`/dashboard?collection=${collection.slug}`} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/50">
                  <span className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><FolderKanban /></span><span className="min-w-0"><span className="block truncate text-sm font-semibold">{collection.name}</span><span className="mono-meta mt-1 block truncate text-muted-foreground">/{collection.slug}</span></span></span>
                  <span className="flex shrink-0 items-center gap-2 text-xs font-medium text-muted-foreground"><span className="hidden sm:inline">View documents</span><ArrowRight /></span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Link href="/dashboard" className={`${buttonVariants({ variant: "outline", size: "sm" })} w-fit rounded-xl`}>Back to library</Link>
    </section>
  );
}
