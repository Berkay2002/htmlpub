import { getRepository } from "@/lib/repository";
import { requireOwnerPage } from "@/lib/auth";
import { DetailPanel, LibraryTable } from "@/components/library";

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
      <section className="library-content"><header className="page-header"><h1>Library</h1></header>
        <form className="filters" method="get"><label className="search-field"><span className="sr-only">Search documents</span><input name="search" defaultValue={query.search} placeholder="Search documents" /></label><select name="collection" defaultValue={query.collection ?? ""} aria-label="Collection"><option value="">All collections</option>{collections.map((collection) => <option key={collection.id} value={collection.slug}>{collection.name}</option>)}</select><button className="button" type="submit">Filter</button></form>
        <LibraryTable documents={documents} {...(selected ? { selectedSlug: selected.slug } : {})} /><p className="document-count">{documents.length} {documents.length === 1 ? "document" : "documents"}</p>
      </section>{selected ? <DetailPanel document={selected} /> : null}
    </div>
  );
}
