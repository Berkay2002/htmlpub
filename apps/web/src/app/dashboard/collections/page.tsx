import { requireOwnerPage } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import Link from "next/link";

export default async function CollectionsPage() {
  const ownerId = await requireOwnerPage();
  const rows = await getRepository().listCollections(ownerId);
  return <section className="simple-page"><header className="page-header"><h1>Collections</h1><p>Collections are created automatically when you publish.</p></header><div className="collection-list">{rows.map((collection) => <Link key={collection.id} href={`/dashboard?collection=${collection.slug}`}><strong>{collection.name}</strong><span>View documents</span></Link>)}</div></section>;
}
