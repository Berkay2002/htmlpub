import { getRepository } from "@/lib/repository";
import { renderUrl } from "@/lib/render";
import { publicContentNotFound, publicRawContent } from "@/lib/public-share";

type Context = { params: Promise<{ token: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { token } = await params;
  const shared = await getRepository().resolveShare(token);
  if (!shared?.currentVersionId) return publicContentNotFound();
  const rendered = await fetch(renderUrl(shared.currentVersionId, "raw"), { cache: "no-store" });
  return publicRawContent(rendered, shared.slug);
}
