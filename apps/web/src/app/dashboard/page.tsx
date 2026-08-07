import { getRepository } from "@/lib/repository";
import { requireOwnerPage } from "@/lib/auth";
import { DetailPanel, LibraryTable } from "@/components/library";
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
  return (
    <div className={selected ? "library-layout has-detail" : "library-layout"}>
      <section className="library-content"><header className="page-header typeset typeset-ui"><h1>Library</h1></header>
        <form className="filters" method="get"><label className="search-field"><span className="sr-only">Search documents</span><Input name="search" defaultValue={query.search} placeholder="Search documents" /></label><NativeSelect name="collection" defaultValue={query.collection ?? ""} aria-label="Collection"><NativeSelectOption value="">All collections</NativeSelectOption>{collections.map((collection) => <NativeSelectOption key={collection.id} value={collection.slug}>{collection.name}</NativeSelectOption>)}</NativeSelect><Button type="submit" variant="outline">Filter</Button></form>
        <LibraryTable documents={documents} {...(selected ? { selectedSlug: selected.slug } : {})} /><p className="document-count">{documents.length} {documents.length === 1 ? "document" : "documents"}</p>
      </section>{selected ? <DetailPanel document={selected} /> : null}
    </div>
  );
}
