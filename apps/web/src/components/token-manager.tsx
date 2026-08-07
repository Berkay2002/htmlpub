"use client";

import { Copy, KeyRound, Trash2 } from "lucide-react";
import { useState } from "react";
import { readApi } from "@/lib/client-api";
import { Button } from "@htmlpub/ui/components/button";
import { Input } from "@htmlpub/ui/components/input";

type TokenRecord = { id: string; name: string; displayPrefix: string; scopes: string[]; lastUsedAt: string | Date | null; revokedAt: string | Date | null; createdAt: string | Date };

export function TokenManager({ initial }: { initial: TokenRecord[] }) {
  const [tokens, setTokens] = useState(initial);
  const [name, setName] = useState("My laptop");
  const [revealed, setRevealed] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function create() {
    setMessage(null);
    try {
      const created = await readApi<TokenRecord & { token: string }>(await fetch("/api/v1/tokens", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) }));
      setTokens((current) => [{ ...created, lastUsedAt: null, revokedAt: null }, ...current]); setRevealed(created.token); setMessage("Copy this token now. It cannot be shown again.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Token creation failed"); }
  }

  async function revoke(id: string) {
    await readApi(await fetch(`/api/v1/tokens/${id}`, { method: "DELETE" }));
    setTokens((current) => current.map((token) => token.id === id ? { ...token, revokedAt: new Date().toISOString() } : token));
  }

  return <div className="token-manager"><section className="token-create"><div><h2>Create API token</h2><p>Use a named, revocable token with the <code>htmlpub</code> CLI.</p></div><div className="token-form"><Input value={name} onChange={(event) => setName(event.target.value)} aria-label="Token name" /><Button onPress={() => void create()} isDisabled={!name.trim()}><KeyRound data-icon="inline-start" />Create token</Button></div>{revealed ? <div className="token-reveal"><code>{revealed}</code><Button variant="outline" onPress={() => void navigator.clipboard.writeText(revealed)}><Copy data-icon="inline-start" />Copy</Button></div> : null}{message ? <p className="action-message">{message}</p> : null}</section><section className="versions-section"><h2>Tokens</h2><div className="version-list">{tokens.length === 0 ? <p className="empty-row">No API tokens yet.</p> : tokens.map((token) => <div className="version-row" key={token.id}><div><strong>{token.name}</strong><span>{token.displayPrefix}… · {token.revokedAt ? "Revoked" : token.lastUsedAt ? `Last used ${new Date(token.lastUsedAt).toLocaleDateString()}` : "Never used"}</span></div><time>{new Date(token.createdAt).toLocaleDateString()}</time>{token.revokedAt ? <span /> : <Button className="text-button danger-text" variant="ghost" size="sm" onPress={() => void revoke(token.id)}><Trash2 data-icon="inline-start" />Revoke</Button>}</div>)}</div></section></div>;
}
