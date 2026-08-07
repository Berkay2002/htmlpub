"use client";

import { MAX_HTML_BYTES, normalizeSlug, type ApiEnvelope, type PublishResult, type StartUploadResult } from "@htmlpub/core";
import { Check, FileCode2, UploadCloud, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Props = { onClose: () => void };

async function sha256Hex(bytes: ArrayBuffer) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}

async function readApi<T>(response: Response): Promise<T> {
  const envelope = await response.json() as ApiEnvelope<T>;
  if (!envelope.ok) throw new Error(envelope.error.message);
  return envelope.data;
}

export function PublishModal({ onClose }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [collection, setCollection] = useState("");
  const [share, setShare] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PublishResult | null>(null);
  const busy = progress > 0 && progress < 100;

  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape" && !busy) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  async function choose(next: File | null) {
    setError(null);
    setResult(null);
    if (!next) return setFile(null);
    if (!next.name.toLowerCase().endsWith(".html")) return setError("Choose a file with the .html extension.");
    if (next.size <= 0 || next.size > MAX_HTML_BYTES) return setError("HTML files must be between 1 byte and 10 MB.");
    try {
      const text = new TextDecoder("utf-8", { fatal: true }).decode(await next.arrayBuffer());
      setFile(next);
      const parsedTitle = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim();
      setTitle(parsedTitle || next.name.replace(/\.html$/i, ""));
      setSlug(normalizeSlug(next.name));
    } catch {
      setError("The selected file is not valid UTF-8 HTML.");
    }
  }

  async function publish() {
    if (!file) return setError("Choose an HTML file first.");
    setError(null);
    setProgress(12);
    try {
      const bytes = await file.arrayBuffer();
      const hash = await sha256Hex(bytes);
      const started = await readApi<StartUploadResult>(await fetch("/api/v1/uploads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: normalizeSlug(slug), title, ...(collection.trim() ? { collection: collection.trim() } : {}), byteSize: file.size, sha256: hash, filename: file.name })
      }));
      if (started.status === "duplicate") {
        setResult(started.result); setProgress(100); return;
      }
      setProgress(42);
      const uploadResponse = await fetch(started.uploadUrl, { method: "PUT", headers: { "content-type": "text/html" }, body: bytes });
      if (!uploadResponse.ok) throw new Error("Blob upload failed. The document was not published.");
      setProgress(82);
      const completed = await readApi<PublishResult>(await fetch(`/api/v1/uploads/${started.uploadId}/complete`, { method: "POST" }));
      let shareUrl: string | null = null;
      if (share) {
        const shared = await readApi<{ url: string }>(await fetch(`/api/v1/documents/${encodeURIComponent(completed.slug)}/share`, { method: "POST" }));
        shareUrl = shared.url;
      }
      setResult({ ...completed, shareUrl });
      setProgress(100);
      router.refresh();
    } catch (cause) {
      setProgress(0);
      setError(cause instanceof Error ? cause.message : "Publishing failed");
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
      <div className="publish-modal" role="dialog" aria-modal="true" aria-labelledby="publish-title" tabIndex={-1} ref={dialogRef}>
        <div className="modal-heading"><div><h2 id="publish-title">Publish HTML</h2><p>Upload a self-contained HTML file.</p></div><button className="icon-button" aria-label="Close" onClick={onClose} disabled={busy}><X size={20} /></button></div>
        {result ? (
          <div className="publish-success"><span className="success-icon"><Check size={22} /></span><h3>{result.duplicate ? "Already up to date" : `Published version ${result.version}`}</h3><p>The stable document URL is ready.</p><div className="success-actions"><a className="button primary" href={result.dashboardUrl}>Open document</a>{result.shareUrl ? <a className="button" href={result.shareUrl} target="_blank" rel="noreferrer">Open share link</a> : null}</div></div>
        ) : (
          <>
            <label className="drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void choose(event.dataTransfer.files[0] ?? null); }}>
              <UploadCloud size={30} strokeWidth={1.5} /><strong>Drop an .html file here</strong><span>or choose a file</span><input type="file" accept=".html,text/html" onChange={(event) => void choose(event.target.files?.[0] ?? null)} />
            </label>
            {file ? <div className="selected-file"><FileCode2 size={21} /><div><strong>{file.name}</strong><span>{Math.ceil(file.size / 1024)} KB</span></div><button className="text-button" onClick={() => void choose(null)} disabled={busy}>Remove</button>{progress > 0 ? <div className="progress"><span style={{ width: `${progress}%` }} /></div> : null}</div> : null}
            <p className="constraint">UTF-8 HTML, up to 10 MB</p>
            <div className="field-grid"><label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} /></label><label>Slug<input value={slug} onChange={(event) => setSlug(event.target.value)} /><small>Used in the stable document URL.</small></label><label>Collection<input value={collection} onChange={(event) => setCollection(event.target.value)} placeholder="Optional" /></label></div>
            <label className="checkbox-row"><input type="checkbox" checked={share} onChange={(event) => setShare(event.target.checked)} /><span><strong>Create a share link</strong><small>Anyone with the link can view the latest version.</small></span></label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <div className="modal-actions"><button className="button" onClick={onClose} disabled={busy}>Cancel</button><button className="button primary" onClick={() => void publish()} disabled={!file || !title.trim() || !slug.trim() || busy}>{busy ? `Uploading ${progress}%` : "Publish"}</button></div>
          </>
        )}
      </div>
    </div>
  );
}
