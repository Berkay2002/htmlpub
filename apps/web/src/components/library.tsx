import type { DocumentSummary } from "@htmlpub/core";
import { FileCode2, LockKeyhole, Share2, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "@htmlpub/ui/components/badge";
import { buttonVariants } from "@htmlpub/ui/components/button";

const dateFormatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

export function LibraryTable({ documents, selectedSlug }: { documents: DocumentSummary[]; selectedSlug?: string }) {
  return (
    <div className="document-table" role="table" aria-label="Documents">
      <div className="document-row table-header" role="row"><span>Document</span><span>Collection</span><span>Versions</span><span>Updated</span><span>Sharing</span></div>
      {documents.length === 0 ? <div className="empty-row">No documents match this view.</div> : documents.map((document) => (
        <Link role="row" key={document.id} href={`/dashboard?document=${encodeURIComponent(document.slug)}`} className={document.slug === selectedSlug ? "document-row selected" : "document-row"}>
          <span className="document-name"><FileCode2 size={20} strokeWidth={1.5} /><span><strong>{document.title}</strong><small>{document.latestFilename}</small></span></span>
          <span>{document.collection ?? "Unfiled"}</span><span>{document.versionCount}</span><span>{dateFormatter.format(new Date(document.updatedAt))}</span><span className="sharing-state">{document.shared ? <><Share2 aria-hidden="true" /> <Badge variant="secondary">Shared</Badge></> : <><LockKeyhole aria-hidden="true" /> <Badge variant="outline">Private</Badge></>}</span>
        </Link>
      ))}
    </div>
  );
}

type Detail = {
  slug: string;
  title: string;
  collection: string | null;
  versionCount: number;
  updatedAt: string;
  shared: boolean;
  versions: Array<{ id: string; versionNumber: number; sourceFilename: string; byteSize: number; createdAt: string; restoredFromVersionId: string | null }>;
};

export function DetailPanel({ document }: { document: Detail }) {
  return (
    <aside className="detail-panel" aria-label={`${document.title} details`}>
      <Link className={`${buttonVariants({ variant: "ghost", size: "icon-sm" })} close-panel`} href="/dashboard" aria-label="Close details"><X /></Link>
      <h2>{document.title}</h2><p className="detail-meta">{document.collection ?? "Unfiled"} · {document.shared ? "Shared" : "Private"}</p>
      <div className="latest-block"><strong>Latest version</strong><span>v{document.versionCount} · {dateFormatter.format(new Date(document.updatedAt))}</span></div>
      <div className="detail-actions"><Link className={buttonVariants({ variant: "default" })} href={`/dashboard/documents/${encodeURIComponent(document.slug)}`}>Open</Link><ShareControls slug={document.slug} shared={document.shared} /></div>
      <div className="version-heading"><h3>Version history</h3><Link href={`/dashboard/documents/${encodeURIComponent(document.slug)}`}>View all</Link></div>
      <ol className="timeline">{document.versions.slice(0, 5).map((version, index) => <li key={version.id} className={index === 0 ? "current" : ""}><span className="timeline-dot" /><div><strong>v{version.versionNumber}{index === 0 ? <em>Current</em> : null}</strong><time>{dateFormatter.format(new Date(version.createdAt))}</time><small>{version.sourceFilename}</small></div></li>)}</ol>
    </aside>
  );
}

function ShareControls({ slug, shared }: { slug: string; shared: boolean }) {
  return <Link className={buttonVariants({ variant: "outline" })} href={`/dashboard/documents/${encodeURIComponent(slug)}#sharing`}>{shared ? "Manage share" : "Share"}</Link>;
}
