import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { getRepository } from "@/lib/repository";
import { requireOwnerPage } from "@/lib/auth";
import { DetailPanel, LibraryTable } from "@/components/library";
import { WorkspaceOverview } from "@/components/workspace-overview";
import { Button } from "@htmlpub/ui/components/button";
import { Input } from "@htmlpub/ui/components/input";
import { NativeSelect, NativeSelectOption } from "@htmlpub/ui/components/native-select";

type Props = { searchParams: Promise<{ search?: string; collection?: string; document?: string }> };

export default async function LibraryPage({ searchParams }: Props) {
  const [ownerId, query] = await Promise.all([requireOwnerPage(), searchParams]);
  const repository = getRepository();
  const [documents, collections, selected] = await Promise.all([
    repository.listDocuments(ownerId, { ...(query.search ? { search: query.search } : {}), ...(query.collection ? { collection: query.collection } : {}) }),
    repository.listCollections(ownerId),
    query.document ? repository.getDocument(ownerId, query.document) : Promise.resolve(null)
  ]);
  const [overviewDocuments, tokens] = await Promise.all([repository.listDocuments(ownerId), repository.listApiTokens(ownerId)]);
  const today = new Date();
  const activity = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - 5 + index, 1);
    const count = overviewDocuments.filter((document) => {
      const updated = new Date(document.updatedAt);
      return updated.getFullYear() === date.getFullYear() && updated.getMonth() === date.getMonth();
    }).length;
    return { month: date.toLocaleDateString("en", { month: "short" }), documents: count };
  });

  return (
    <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_0px] data-[has-detail=true]:lg:grid-cols-[minmax(0,1fr)_370px]" data-has-detail={selected ? "true" : "false"}>
      <section className="min-w-0 px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        <header className="typeset typeset-ui mb-7 max-w-2xl">
          <p className="mono-meta mb-2 uppercase tracking-[0.16em] text-primary">Document workspace</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Library</h1>
          <p className="mt-2 text-sm text-muted-foreground">Publish self-contained HTML, preserve every version, and share the latest artifact when it is ready.</p>
        </header>

        <WorkspaceOverview documents={overviewDocuments} collections={collections.length} tokens={tokens.length} activity={activity} />

        <div className="mt-8 mb-5 flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/90 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <form className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row" method="get">
            <label className="relative min-w-0 flex-1 sm:max-w-sm">
              <span className="sr-only">Search documents</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input className="h-9 rounded-xl pl-9" name="search" defaultValue={query.search} placeholder="Search documents or slugs" />
            </label>
            <NativeSelect className="w-full sm:w-44" name="collection" defaultValue={query.collection ?? ""} aria-label="Collection" size="sm">
              <NativeSelectOption value="">All collections</NativeSelectOption>
              {collections.map((collection) => <NativeSelectOption key={collection.id} value={collection.slug}>{collection.name}</NativeSelectOption>)}
            </NativeSelect>
            <Button type="submit" size="sm" variant="outline" className="rounded-xl"><SlidersHorizontal data-icon="inline-start" />Filter</Button>
            {query.search || query.collection ? <Link className="inline-flex h-9 items-center justify-center rounded-xl px-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground" href="/dashboard">Clear</Link> : null}
          </form>
          <p className="mono-meta px-1 text-muted-foreground">{documents.length} {documents.length === 1 ? "document" : "documents"}</p>
        </div>

        <LibraryTable documents={documents} {...(selected ? { selectedSlug: selected.slug } : {})} />
      </section>
      {selected ? <DetailPanel document={selected} /> : null}
    </div>
  );
}
