"use client";

import { MAX_HTML_BYTES, normalizeSlug, type PublishResult, type StartUploadResult } from "@htmlpub/core";
import { Check, FileCode2, UploadCloud, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readApi } from "@/lib/client-api";
import { Alert, AlertDescription } from "@htmlpub/ui/components/alert";
import { Button, buttonVariants } from "@htmlpub/ui/components/button";
import { Checkbox } from "@htmlpub/ui/components/checkbox";
import { Dialog, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@htmlpub/ui/components/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@htmlpub/ui/components/field";
import { Input } from "@htmlpub/ui/components/input";
import { Progress } from "@htmlpub/ui/components/progress";
import { Spinner } from "@htmlpub/ui/components/spinner";

type Props = { onClose: () => void };

async function sha256Hex(bytes: ArrayBuffer) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}

export function PublishModal({ onClose }: Props) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [collection, setCollection] = useState("");
  const [share, setShare] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PublishResult | null>(null);
  const busy = progress > 0 && progress < 100;

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
        let shareUrl: string | null = null;
        if (share) {
          const shared = await readApi<{ url: string }>(await fetch(`/api/v1/documents/${encodeURIComponent(started.result.slug)}/share`, { method: "POST" }));
          shareUrl = shared.url;
        }
        setResult({ ...started.result, shareUrl });
        setProgress(100);
        router.refresh();
        return;
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
    <Dialog isOpen isDismissable={!busy} onOpenChange={(open) => { if (!open && !busy) onClose(); }} showCloseButton={false} className="publish-modal">
        <DialogHeader className="modal-heading"><div><DialogTitle>Publish HTML</DialogTitle><DialogDescription>Upload a self-contained HTML file.</DialogDescription></div><DialogClose className="icon-button" aria-label="Close" isDisabled={busy}><X /></DialogClose></DialogHeader>
        {result ? (
          <div className="publish-success"><span className="success-icon"><Check /></span><h3>{result.duplicate ? "Already up to date" : `Published version ${result.version}`}</h3><p>The stable document URL is ready.</p><div className="success-actions"><a className={buttonVariants()} href={result.dashboardUrl}>Open document</a>{result.shareUrl ? <a className={buttonVariants({ variant: "outline" })} href={result.shareUrl} target="_blank" rel="noreferrer">Open share link</a> : null}</div></div>
        ) : (
          <>
            <label className="drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void choose(event.dataTransfer.files[0] ?? null); }}>
              <UploadCloud aria-hidden="true" /><strong>Drop an .html file here</strong><span>or choose a file</span><input type="file" accept=".html,text/html" onChange={(event) => void choose(event.target.files?.[0] ?? null)} />
            </label>
            {file ? <div className="selected-file"><FileCode2 aria-hidden="true" /><div><strong>{file.name}</strong><span>{Math.ceil(file.size / 1024)} KB</span></div><Button className="text-button" variant="ghost" size="sm" onPress={() => void choose(null)} isDisabled={busy}>Remove</Button>{progress > 0 ? <Progress value={progress} aria-label="Upload progress" className="upload-progress" /> : null}</div> : null}
            <p className="constraint">UTF-8 HTML, up to 10 MB</p>
            <FieldGroup className="field-grid"><Field><FieldLabel htmlFor="publish-title">Title</FieldLabel><Input id="publish-title" value={title} onChange={(event) => setTitle(event.target.value)} /></Field><Field><FieldLabel htmlFor="publish-slug">Slug</FieldLabel><Input id="publish-slug" value={slug} onChange={(event) => setSlug(event.target.value)} /><FieldDescription>Used in the stable document URL.</FieldDescription></Field><Field><FieldLabel htmlFor="publish-collection">Collection</FieldLabel><Input id="publish-collection" value={collection} onChange={(event) => setCollection(event.target.value)} placeholder="Optional" /></Field></FieldGroup>
            <Checkbox className="checkbox-row" isSelected={share} onChange={setShare}><span><strong>Create a share link</strong><small>Anyone with the link can view the latest version.</small></span></Checkbox>
            {error ? <Alert variant="destructive" className="form-error"><AlertDescription>{error}</AlertDescription></Alert> : null}
            <DialogFooter className="modal-actions"><Button variant="outline" onPress={onClose} isDisabled={busy}>Cancel</Button><Button onPress={() => void publish()} isDisabled={!file || !title.trim() || !slug.trim() || busy}>{busy ? <><Spinner data-icon="inline-start" />Uploading {progress}%</> : "Publish"}</Button></DialogFooter>
          </>
        )}
    </Dialog>
  );
}
