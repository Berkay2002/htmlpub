"use client";

import { Archive, Check, Copy, RotateCcw, Share2, Unlink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readApi } from "@/lib/client-api";

export function DocumentActions({ slug, shared }: { slug: string; shared: boolean }) {
  const router = useRouter();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function rotate() {
    try {
      const result = await readApi<{ url: string }>(await fetch(`/api/v1/documents/${encodeURIComponent(slug)}/share`, { method: "POST" }));
      setShareUrl(result.url); setMessage("A new share link was created. The previous link no longer works."); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Sharing failed"); }
  }

  async function revoke() {
    try {
      await readApi(await fetch(`/api/v1/documents/${encodeURIComponent(slug)}/share`, { method: "DELETE" }));
      setShareUrl(null); setMessage("Share access revoked."); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Revocation failed"); }
  }

  async function archive() {
    if (!window.confirm("Archive this document and revoke its active share link?")) return;
    try {
      await readApi(await fetch(`/api/v1/documents/${encodeURIComponent(slug)}`, { method: "DELETE" }));
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Archiving failed");
    }
  }

  return (
    <section className="sharing-section" id="sharing">
      <div><h2>Sharing</h2><p>Share links always open the latest version and remain valid until revoked or rotated.</p></div>
      <div className="sharing-controls">
        <button className="button primary" onClick={() => void rotate()}><Share2 size={16} />{shared ? "Rotate link" : "Create link"}</button>
        {shared ? <button className="button danger" onClick={() => void revoke()}><Unlink size={16} />Revoke</button> : null}
        <button className="button danger" onClick={() => void archive()}><Archive size={16} />Archive</button>
      </div>
      {shareUrl ? <div className="share-result"><code>{shareUrl}</code><button className="button" onClick={() => void navigator.clipboard.writeText(shareUrl)}><Copy size={15} />Copy</button></div> : null}
      {message ? <p className="action-message"><Check size={15} />{message}</p> : null}
    </section>
  );
}

export function RestoreButton({ slug, version }: { slug: string; version: number }) {
  const router = useRouter(); const [busy, setBusy] = useState(false);
  async function restore() { setBusy(true); try { await readApi(await fetch(`/api/v1/documents/${encodeURIComponent(slug)}/versions/${version}/restore`, { method: "POST" })); router.refresh(); } finally { setBusy(false); } }
  return <button className="text-button" disabled={busy} onClick={() => void restore()}><RotateCcw size={14} />{busy ? "Restoring" : "Restore"}</button>;
}
