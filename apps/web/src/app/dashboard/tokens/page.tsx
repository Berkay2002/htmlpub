import { KeyRound, TerminalSquare } from "lucide-react";
import { TokenManager } from "@/components/token-manager";
import { requireOwnerPage } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { Card, CardContent, CardHeader, CardTitle } from "@htmlpub/ui/components/card";
import { Badge } from "@htmlpub/ui/components/badge";

export default async function TokensPage() {
  const ownerId = await requireOwnerPage();
  const tokens = await getRepository().listApiTokens(ownerId);
  return (
    <section className="flex flex-1 flex-col gap-7 px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <header className="typeset typeset-ui max-w-2xl">
        <p className="mono-meta mb-2 uppercase tracking-[0.16em] text-primary">Developer access</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">API tokens</h1>
        <p className="mt-2 text-sm text-muted-foreground">Connect the htmlpub CLI without exposing your Clerk session. Tokens are scoped to this private workspace.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl border-border/80 bg-card/95 shadow-sm"><CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0"><CardTitle className="text-sm">CLI authentication</CardTitle><TerminalSquare className="text-primary" /></CardHeader><CardContent className="text-xs text-muted-foreground">Use the token as a bearer credential when publishing from a terminal.</CardContent></Card>
        <Card className="rounded-2xl border-border/80 bg-card/95 shadow-sm"><CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0"><CardTitle className="text-sm">Token inventory</CardTitle><KeyRound className="text-muted-foreground" /></CardHeader><CardContent className="flex items-center gap-2 text-xs text-muted-foreground"><Badge variant="secondary" className="rounded-lg">{tokens.length}</Badge>{tokens.length === 1 ? "token configured" : "tokens configured"}</CardContent></Card>
      </div>
      <TokenManager initial={tokens} />
    </section>
  );
}
