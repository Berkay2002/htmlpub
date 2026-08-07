import { notFound } from "next/navigation";
import { requireOwnerPage } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { renderUrl } from "@/lib/render";
import { DocumentActions, RestoreButton } from "@/components/document-actions";
import Link from "next/link";
import { buttonVariants } from "@htmlpub/ui/components/button";

type Props = { params: Promise<{ slug: string }> };
const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

export default async function DocumentPage({ params }: Props) {
  const [ownerId, { slug }] = await Promise.all([requireOwnerPage(), params]);
  const document = await getRepository().getDocument(ownerId, slug);
  if (!document?.currentVersionId) notFound();
  const previewUrl = renderUrl(document.currentVersionId);
  return <div className="document-page"><header className="document-page-header"><div className="typeset typeset-ui"><Link href="/dashboard" className="back-link">Library</Link><h1>{document.title}</h1><p>{document.collection ?? "Unfiled"} · v{document.versionCount} · updated {dateFormatter.format(new Date(document.updatedAt))}</p></div><a className={buttonVariants()} href={previewUrl} target="_blank" rel="noreferrer">Open fullscreen</a></header><div className="preview-frame"><iframe title={document.title} src={previewUrl} sandbox="allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" /></div><DocumentActions slug={document.slug} shared={document.shared} /><section className="versions-section"><h2>Version history</h2><div className="version-list">{document.versions.map((version, index) => <div className="version-row" key={version.id}><div><strong>v{version.versionNumber}{index === 0 ? <em>Current</em> : null}</strong><span>{version.sourceFilename} · {Math.ceil(version.byteSize / 1024)} KB</span></div><time>{dateFormatter.format(new Date(version.createdAt))}</time>{index > 0 ? <RestoreButton slug={document.slug} version={version.versionNumber} /> : <span />}</div>)}</div></section></div>;
}
