import { TokenManager } from "@/components/token-manager";
import { requireOwnerPage } from "@/lib/auth";
import { getRepository } from "@/lib/repository";

export default async function TokensPage() {
  const ownerId = await requireOwnerPage();
  const tokens = await getRepository().listApiTokens(ownerId);
  return <section className="simple-page"><header className="page-header typeset typeset-ui"><h1>API tokens</h1><p>Authenticate terminals without exposing your Clerk session.</p></header><TokenManager initial={tokens} /></section>;
}
