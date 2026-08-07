"use client";

import { Copy, KeyRound, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { readApi } from "@/lib/client-api";
import { Alert, AlertDescription, AlertTitle } from "@htmlpub/ui/components/alert";
import { Badge } from "@htmlpub/ui/components/badge";
import { Button } from "@htmlpub/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@htmlpub/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@htmlpub/ui/components/empty";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@htmlpub/ui/components/field";
import { Input } from "@htmlpub/ui/components/input";
import { Spinner } from "@htmlpub/ui/components/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@htmlpub/ui/components/table";

type TokenRecord = { id: string; name: string; displayPrefix: string; scopes: string[]; lastUsedAt: string | Date | null; revokedAt: string | Date | null; createdAt: string | Date; expiresAt?: string | Date | null };

export function TokenManager({ initial }: { initial: TokenRecord[] }) {
  const [tokens, setTokens] = useState(initial);
  const [name, setName] = useState("My laptop");
  const [revealed, setRevealed] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("create");
    try {
      const created = await readApi<TokenRecord & { token: string }>(await fetch("/api/v1/tokens", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) }));
      setTokens((current) => [{ ...created, lastUsedAt: null, revokedAt: null }, ...current]);
      setRevealed(created.token);
      toast.success("API token created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Token creation failed");
    } finally {
      setBusy(null);
    }
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  }

  async function revoke(id: string) {
    setBusy(id);
    try {
      await readApi(await fetch(`/api/v1/tokens/${id}`, { method: "DELETE" }));
      setTokens((current) => current.map((token) => token.id === id ? { ...token, revokedAt: new Date().toISOString() } : token));
      toast.success("API token revoked");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Token revocation failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid max-w-4xl gap-6">
      <Card className="rounded-2xl border-border/80 bg-card/95 shadow-sm">
        <CardHeader className="border-b border-border/70 px-5 py-4"><CardTitle className="text-sm">Create an API token</CardTitle><CardDescription className="mt-1 text-xs">Use a named, revocable token with the <code className="rounded-md bg-muted px-1.5 py-0.5">htmlpub</code> CLI.</CardDescription></CardHeader>
        <CardContent className="px-5 py-5">
          <form onSubmit={(event) => void create(event)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="token-name">Token name</FieldLabel>
                <div className="flex flex-col gap-2 sm:flex-row"><Input id="token-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="My laptop" /><Button type="submit" isDisabled={!name.trim() || busy !== null} className="rounded-xl sm:shrink-0">{busy === "create" ? <><Spinner data-icon="inline-start" />Creating</> : <><KeyRound data-icon="inline-start" />Create token</>}</Button></div>
                <FieldDescription>Give the token a name you will recognize and revoke later.</FieldDescription>
              </Field>
            </FieldGroup>
          </form>
          {revealed ? <Alert className="mt-5 rounded-xl border-primary/30 bg-primary/5"><ShieldCheck data-icon="inline-start" /><div><AlertTitle>Copy this token now</AlertTitle><AlertDescription className="mt-1">It cannot be shown again after you leave this page.</AlertDescription><div className="mt-3 flex flex-col gap-2 sm:flex-row"><code className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-border/80 bg-background px-3 py-2 text-xs">{revealed}</code><Button variant="outline" size="sm" className="rounded-xl" onPress={() => void copy(revealed)}><Copy data-icon="inline-start" />Copy</Button></div></div></Alert> : null}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/80 bg-card/95 shadow-sm">
        <CardHeader className="border-b border-border/70 px-5 py-4"><CardTitle className="text-sm">Active tokens</CardTitle><CardDescription className="mt-1 text-xs">Tokens are shown by prefix only after creation.</CardDescription></CardHeader>
        <CardContent className="p-0">
          {tokens.length === 0 ? <Empty className="min-h-64 rounded-none border-0"><EmptyHeader><EmptyMedia variant="icon"><KeyRound /></EmptyMedia><EmptyTitle>No API tokens</EmptyTitle><EmptyDescription>Create one above to connect the CLI.</EmptyDescription></EmptyHeader></Empty> : (
            <Table aria-label="API tokens">
              <TableHeader><TableRow className="border-border/70 bg-muted/35 hover:bg-muted/35"><TableHead className="px-5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Name</TableHead><TableHead className="hidden text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:table-cell">Status</TableHead><TableHead className="hidden text-[11px] uppercase tracking-[0.14em] text-muted-foreground md:table-cell">Created</TableHead><TableHead className="px-5 text-right text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Action</TableHead></TableRow></TableHeader>
              <TableBody>{tokens.map((token) => { const revoked = Boolean(token.revokedAt); return <TableRow key={token.id} className="border-border/60"><TableCell className="px-5"><div className="min-w-0"><p className="truncate text-sm font-semibold">{token.name}</p><p className="mono-meta mt-1 text-muted-foreground">{token.displayPrefix}…</p></div></TableCell><TableCell className="hidden sm:table-cell"><Badge variant={revoked ? "outline" : "secondary"} className="rounded-lg font-normal">{revoked ? "Revoked" : "Active"}</Badge></TableCell><TableCell className="hidden text-xs text-muted-foreground md:table-cell">{new Date(token.createdAt).toLocaleDateString()}</TableCell><TableCell className="px-5 text-right">{revoked ? <span className="text-xs text-muted-foreground">Unavailable</span> : <Button variant="ghost" size="sm" className="rounded-xl text-destructive hover:text-destructive" isDisabled={busy === token.id} onPress={() => void revoke(token.id)}>{busy === token.id ? <Spinner data-icon="inline-start" /> : <Trash2 data-icon="inline-start" />}<span className="hidden sm:inline">Revoke</span></Button>}</TableCell></TableRow>; })}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
