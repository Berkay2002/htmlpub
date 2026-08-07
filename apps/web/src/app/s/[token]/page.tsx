import { notFound } from "next/navigation";
import { getRepository } from "@/lib/repository";
import { renderUrl } from "@/lib/render";
import { buttonVariants } from "@htmlpub/ui/components/button";

type Props = { params: Promise<{ token: string }> };

export default async function SharePage({ params }: Props) {
  const { token } = await params;
  const shared = await getRepository().resolveShare(token);
  if (!shared?.currentVersionId) notFound();
  const source = renderUrl(shared.currentVersionId);
  return <main className="share-page"><header><span className="brand">htmlpub</span><div className="typeset typeset-ui"><strong>{shared.title}</strong><span>Latest version · updated {new Date(shared.updatedAt).toLocaleDateString()}</span></div><a href={source} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline" })}>Open fullscreen</a></header><p className="artifact-notice">Interactive artifact: external resources may contact third-party services.</p><iframe title={shared.title} src={source} sandbox="allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" /></main>;
}
