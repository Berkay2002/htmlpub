"use client";

import { Archive, ArrowRight, Copy, RotateCcw, Share2, Trash2, Unlink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { readApi } from "@/lib/client-api";
import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@htmlpub/ui/components/alert-dialog";
import { Alert, AlertDescription } from "@htmlpub/ui/components/alert";
import { Button } from "@htmlpub/ui/components/button";
import { buttonVariants } from "@htmlpub/ui/lib/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@htmlpub/ui/components/card";
import { Spinner } from "@htmlpub/ui/components/spinner";
import type { ShareResult } from "@htmlpub/core";

export function LibraryDocumentActions({ slug, title }: { slug: string; title: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function deleteDocument() {
    setDeleting(true);
    try {
      await readApi(await fetch(`/api/v1/documents/${encodeURIComponent(slug)}`, { method: "DELETE" }));
      toast.success("Document deleted");
      setConfirming(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Deleting failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={`/dashboard/documents/${encodeURIComponent(slug)}`}>
          Open
          <ArrowRight data-icon="inline-end" />
        </Link>
        <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" onPress={() => setConfirming(true)} aria-label={`Delete ${title}`}>
          <Trash2 />
        </Button>
      </div>

      <AlertDialogContent isOpen={confirming} onOpenChange={setConfirming} size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia><Trash2 /></AlertDialogMedia>
          <AlertDialogTitle>Delete this document?</AlertDialogTitle>
          <AlertDialogDescription>{title} will be removed from the library and any active share link will stop working. This cannot be undone from the workspace.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
          <AlertDialogAction className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90" onPress={() => void deleteDocument()} isDisabled={deleting}>
            {deleting ? <Spinner data-icon="inline-start" /> : null}
            {deleting ? "Deleting" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </>
  );
}

export function DocumentActions({ slug, shared }: { slug: string; shared: boolean }) {
  const router = useRouter();
  const [shareResult, setShareResult] = useState<ShareResult | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);

  async function rotate() {
    setBusy("share");
    try {
      const result = await readApi<ShareResult>(await fetch(`/api/v1/documents/${encodeURIComponent(slug)}/share`, { method: "POST" }));
      setShareResult(result); toast.success(shared ? "Share link rotated" : "Share link created"); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Sharing failed"); }
    finally { setBusy(null); }
  }

  async function revoke() {
    setBusy("revoke");
    try {
      await readApi(await fetch(`/api/v1/documents/${encodeURIComponent(slug)}/share`, { method: "DELETE" }));
      setShareResult(null); toast.success("Share access revoked"); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Revocation failed"); }
    finally { setBusy(null); }
  }

  async function archive() {
    setBusy("archive");
    try {
      await readApi(await fetch(`/api/v1/documents/${encodeURIComponent(slug)}`, { method: "DELETE" }));
      toast.success("Document archived"); router.push("/dashboard"); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Archiving failed"); }
    finally { setBusy(null); setArchiving(false); }
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    toast.success("Link copied");
  }

  return (
    <>
      <Card className="mt-6 rounded-2xl border-border/80 bg-card/95 shadow-sm" id="sharing">
        <CardHeader className="border-b border-border/70 px-5 py-4"><CardTitle className="text-sm">Sharing</CardTitle><CardDescription className="mt-1 text-xs">Reader and raw HTML links always resolve the latest version and remain valid until revoked or rotated.</CardDescription></CardHeader>
        <CardContent className="grid gap-4 px-5 py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center"><Button onPress={() => void rotate()} isDisabled={busy !== null} className="rounded-xl">{busy === "share" ? <Spinner data-icon="inline-start" /> : <Share2 data-icon="inline-start" />}{shared ? "Rotate link" : "Create link"}</Button>{shared ? <Button variant="outline" onPress={() => void revoke()} isDisabled={busy !== null} className="rounded-xl text-destructive hover:text-destructive"><Unlink data-icon="inline-start" />Revoke</Button> : null}<Button variant="ghost" onPress={() => setArchiving(true)} isDisabled={busy !== null} className="rounded-xl text-destructive hover:text-destructive sm:ml-auto"><Archive data-icon="inline-start" />Archive</Button></div>
          {shareResult ? <Alert className="rounded-xl border-primary/30 bg-primary/5"><Share2 data-icon="inline-start" /><div className="grid min-w-0 flex-1 gap-3"><AlertDescription>Anyone with either bearer link can access the latest version.</AlertDescription>{([['Reader', shareResult.url], ['Raw HTML', shareResult.contentUrl]] as const).map(([label, value]) => <div key={label} className="flex flex-col gap-2 sm:flex-row sm:items-center"><span className="w-20 shrink-0 text-xs font-medium">{label}</span><code className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-border/80 bg-background px-3 py-2 text-xs">{value}</code><Button variant="outline" size="sm" className="rounded-xl" onPress={() => void copy(value)}><Copy data-icon="inline-start" />Copy</Button></div>)}</div></Alert> : null}
        </CardContent>
      </Card>

      <AlertDialogContent isOpen={archiving} onOpenChange={setArchiving} size="sm">
        <AlertDialogHeader><AlertDialogMedia><Archive /></AlertDialogMedia><AlertDialogTitle>Archive this document?</AlertDialogTitle><AlertDialogDescription>Archiving removes it from the library and revokes any active share link. This cannot be undone from the workspace.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel><AlertDialogAction className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90" onPress={() => void archive()} isDisabled={busy !== null}>Archive</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </>
  );
}

export function RestoreButton({ slug, version }: { slug: string; version: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function restore() {
    setBusy(true);
    try { await readApi(await fetch(`/api/v1/documents/${encodeURIComponent(slug)}/versions/${version}/restore`, { method: "POST" })); toast.success(`Version ${version} restored`); router.refresh(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Restore failed"); }
    finally { setBusy(false); }
  }
  return <Button variant="ghost" size="sm" className="rounded-xl" isDisabled={busy} onPress={() => void restore()}>{busy ? <Spinner data-icon="inline-start" /> : <RotateCcw data-icon="inline-start" />}{busy ? "Restoring" : "Restore"}</Button>;
}
