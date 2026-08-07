"use client";

import { MAX_HTML_BYTES, normalizeSlug, type PublishResult, type StartUploadResult } from "@htmlpub/core";
import { Check, FileCode2, Share2, UploadCloud, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readApi } from "@/lib/client-api";
import { Alert, AlertDescription } from "@htmlpub/ui/components/alert";
import { Button, buttonVariants } from "@htmlpub/ui/components/button";
import { Dialog, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@htmlpub/ui/components/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@htmlpub/ui/components/empty";
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
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PublishResult | null>(null);
  const busy = progress > 0 && progress < 100;

  async function choose(next: File | null) {
    setError(null); setResult(null);
    if (!next) return setFile(null);
    if (!next.name.toLowerCase().endsWith(".html")) return setError("Choose a file with the .html extension.");
    if (next.size <= 0 || next.size > MAX_HTML_BYTES) return setError("HTML files must be between 1 byte and 10 MB.");
    try {
      const text = new TextDecoder("utf-8", { fatal: true }).decode(await next.arrayBuffer());
      setFile(next);
      const parsedTitle = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim();
      setTitle(parsedTitle || next.name.replace(/\.html$/i, "")); setSlug(normalizeSlug(next.name));
    } catch { setError("The selected file is not valid UTF-8 HTML."); }
  }

  async function publish() {
    if (!file) return setError("Choose an HTML file first.");
    setError(null); setProgress(12);
    try {
      const bytes = await file.arrayBuffer(); const hash = await sha256Hex(bytes);
      const started = await readApi<StartUploadResult>(await fetch("/api/v1/uploads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug: normalizeSlug(slug), title, ...(collection.trim() ? { collection: collection.trim() } : {}), byteSize: file.size, sha256: hash, filename: file.name }) }));
      if (started.status === "duplicate") {
        setResult(started.result); setProgress(100); router.refresh(); return;
      }
      setProgress(42);
      const uploadResponse = await fetch(started.uploadUrl, { method: "PUT", headers: { "content-type": "text/html" }, body: bytes });
      if (!uploadResponse.ok) throw new Error("Blob upload failed. The document was not published.");
      setProgress(82);
      const completed = await readApi<PublishResult>(await fetch(`/api/v1/uploads/${started.uploadId}/complete`, { method: "POST" }));
      setResult(completed); setProgress(100); router.refresh();
    } catch (cause) { setProgress(0); setError(cause instanceof Error ? cause.message : "Publishing failed"); }
  }

  return (
    <Dialog isOpen isDismissable={!busy} onOpenChange={(open) => { if (!open && !busy) onClose(); }} showCloseButton={false} className="max-w-xl rounded-2xl border-border/80 bg-card p-0 shadow-2xl">
      <DialogHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/70 px-6 py-5"><div><DialogTitle className="text-base font-semibold">Publish HTML</DialogTitle><DialogDescription className="mt-1 text-xs">Upload a self-contained artifact to your private workspace.</DialogDescription></div><DialogClose className="rounded-xl" variant="ghost" size="icon-sm" aria-label="Close" isDisabled={busy}><X /></DialogClose></DialogHeader>
      {result ? (
        <div className="px-6 py-8"><Empty className="min-h-72 border-0"><EmptyHeader><EmptyMedia variant="icon" className="bg-emerald-500/10 text-emerald-600"><Check /></EmptyMedia><EmptyTitle>{result.duplicate ? "Already up to date" : `Published version ${result.version}`}</EmptyTitle><EmptyDescription>{result.shareUrl ? "A stable share link was enabled automatically." : "Any existing share link now follows this version."}</EmptyDescription></EmptyHeader><div className="flex flex-col gap-2 sm:flex-row"><a className={`${buttonVariants({ size: "sm" })} rounded-xl`} href={result.dashboardUrl}>Open document</a>{result.shareUrl ? <a className={`${buttonVariants({ variant: "outline", size: "sm" })} rounded-xl`} href={result.shareUrl} target="_blank" rel="noreferrer">Open reader link</a> : null}{result.shareContentUrl ? <a className={`${buttonVariants({ variant: "outline", size: "sm" })} rounded-xl`} href={result.shareContentUrl} target="_blank" rel="noreferrer">Open raw HTML</a> : null}</div></Empty></div>
      ) : (
        <>
          <div className="px-6 py-5">
            <label className="group flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/[0.03] px-6 text-center transition-colors hover:border-primary hover:bg-primary/[0.06]" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void choose(event.dataTransfer.files[0] ?? null); }}>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-105"><UploadCloud /></span><strong className="text-sm font-semibold">Drop an .html file here</strong><span className="text-xs text-primary">or choose a file</span><input className="sr-only" type="file" accept=".html,text/html" onChange={(event) => void choose(event.target.files?.[0] ?? null)} />
            </label>
            {file ? <div className="relative mt-3 flex items-center gap-3 rounded-xl border border-border/80 bg-muted/30 p-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-primary"><FileCode2 /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{file.name}</p><p className="mono-meta mt-1 text-muted-foreground">{Math.ceil(file.size / 1024)} KB</p></div><Button variant="ghost" size="sm" className="rounded-xl" onPress={() => void choose(null)} isDisabled={busy}>Remove</Button>{progress > 0 ? <Progress value={progress} aria-label="Upload progress" className="absolute right-3 bottom-1 left-3 h-1" /> : null}</div> : null}
            <p className="mt-3 text-xs text-muted-foreground">UTF-8 HTML, up to 10 MB.</p>
            <FieldGroup className="mt-5">
              <Field><FieldLabel htmlFor="publish-title">Title</FieldLabel><Input id="publish-title" value={title} onChange={(event) => setTitle(event.target.value)} /></Field>
              <Field><FieldLabel htmlFor="publish-slug">Slug</FieldLabel><Input id="publish-slug" value={slug} onChange={(event) => setSlug(event.target.value)} /><FieldDescription>Used in the stable document URL.</FieldDescription></Field>
              <Field><FieldLabel htmlFor="publish-collection">Collection</FieldLabel><Input id="publish-collection" value={collection} onChange={(event) => setCollection(event.target.value)} placeholder="Optional" /></Field>
            </FieldGroup>
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-3"><Share2 className="mt-0.5 size-4 shrink-0 text-primary" /><span><strong className="block text-sm font-medium">Sharing is automatic</strong><small className="mt-1 block text-xs text-muted-foreground">Each published document gets one stable latest-version link. Revoke or rotate it from the document when needed.</small></span></div>
            {error ? <Alert variant="destructive" className="mt-4 rounded-xl"><AlertDescription>{error}</AlertDescription></Alert> : null}
          </div>
          <DialogFooter className="border-t border-border/70 bg-muted/20 px-6 py-4"><Button variant="outline" className="rounded-xl" onPress={onClose} isDisabled={busy}>Cancel</Button><Button className="rounded-xl" onPress={() => void publish()} isDisabled={!file || !title.trim() || !slug.trim() || busy}>{busy ? <><Spinner data-icon="inline-start" />Uploading {progress}%</> : "Publish"}</Button></DialogFooter>
        </>
      )}
    </Dialog>
  );
}
