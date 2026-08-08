"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, MessageSquarePlus, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import type { ReviewDecision, ReviewStatus } from "@htmlpub/core";
import { Badge } from "@htmlpub/ui/components/badge";
import { Button } from "@htmlpub/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@htmlpub/ui/components/card";
import { Spinner } from "@htmlpub/ui/components/spinner";
import { Textarea } from "@htmlpub/ui/components/textarea";
import { readApi } from "@/lib/client-api";
import { ReaderFrame, type ReaderSelection } from "@/components/reader-frame";

const statusLabels: Record<ReviewStatus["status"], string> = {
  open: "Awaiting review",
  accepted: "Accepted",
  revision_requested: "Revision requested",
  cancelled: "Cancelled",
  superseded: "Superseded"
};

export function DocumentReview({ slug, title, src, rawSrc, initialReview }: { slug: string; title: string; src: string; rawSrc: string; initialReview: ReviewStatus }) {
  const router = useRouter();
  const [review, setReview] = useState(initialReview);
  const [selection, setSelection] = useState<ReaderSelection | null>(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState<"comment" | ReviewDecision | null>(null);
  const reviewPath = `/api/v1/documents/${encodeURIComponent(slug)}/review`;
  const reviewOpen = review.status === "open";
  const receiveSelection = useCallback((next: ReaderSelection | null) => setSelection(next), []);

  async function addComment() {
    if (!selection || !body.trim()) return;
    setBusy("comment");
    try {
      const updated = await readApi<ReviewStatus>(await fetch(`${reviewPath}/comments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body, selection })
      }));
      setReview(updated);
      setBody("");
      setSelection(null);
      toast.success("Review comment added");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Comment could not be added");
    } finally {
      setBusy(null);
    }
  }

  async function decide(decision: ReviewDecision) {
    setBusy(decision);
    try {
      const updated = await readApi<ReviewStatus>(await fetch(reviewPath, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ decision })
      }));
      setReview(updated);
      toast.success(decision === "accept" ? "Version accepted" : decision === "request_revision" ? "Revision requested" : "Review cancelled");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Review decision failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid min-h-0 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <ReaderFrame title={title} src={src} rawSrc={rawSrc} className="document-preview" onSelection={reviewOpen ? receiveSelection : undefined} />

      <Card className="h-fit rounded-2xl border-border/80 bg-card/95 shadow-sm xl:sticky xl:top-6">
        <CardHeader className="border-b border-border/70 px-5 py-4">
          <div className="flex items-center justify-between gap-3"><CardTitle className="text-sm">Review v{review.version}</CardTitle><Badge variant={reviewOpen ? "secondary" : "outline"} className="rounded-lg text-[10px]">{statusLabels[review.status]}</Badge></div>
          <CardDescription className="mt-1 text-xs">Highlight text in the reader to leave an anchored comment.</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 px-5 py-5">
          {reviewOpen && selection ? <div className="grid gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3">
            <div><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Selected text</span><blockquote className="mt-1 line-clamp-4 border-l-2 border-primary/40 pl-3 text-xs leading-relaxed">{selection.exact}</blockquote>{selection.heading ? <span className="mt-2 block text-[11px] text-muted-foreground">Under “{selection.heading}”</span> : null}</div>
            <Textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="What should change?" aria-label="Review comment" />
            <div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onPress={() => { setSelection(null); setBody(""); }} isDisabled={busy !== null}>Discard</Button><Button size="sm" onPress={() => void addComment()} isDisabled={!body.trim() || busy !== null}>{busy === "comment" ? <Spinner data-icon="inline-start" /> : <MessageSquarePlus data-icon="inline-start" />}{busy === "comment" ? "Adding" : "Add comment"}</Button></div>
          </div> : reviewOpen ? <p className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">Select a word, sentence, heading, or paragraph in the reader.</p> : null}

          <div className="grid gap-3">
            <div className="flex items-center justify-between"><h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Comments</h2><span className="text-xs text-muted-foreground">{review.comments.length}</span></div>
            {review.comments.length ? review.comments.map((comment) => <article key={comment.id} className="rounded-xl border border-border/70 bg-muted/20 p-3">
              {comment.selection.heading ? <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{comment.selection.heading}</span> : null}
              <blockquote className="mt-1 line-clamp-3 border-l-2 border-border pl-2 text-xs text-muted-foreground">{comment.selection.exact}</blockquote>
              <p className="mt-2 text-sm leading-relaxed">{comment.body}</p>
            </article>) : <p className="text-xs text-muted-foreground">No comments yet.</p>}
          </div>
        </CardContent>

        {reviewOpen ? <CardFooter className="flex flex-wrap gap-2 px-5 py-4">
          <Button size="sm" onPress={() => void decide("accept")} isDisabled={busy !== null}>{busy === "accept" ? <Spinner data-icon="inline-start" /> : <Check data-icon="inline-start" />}Accept</Button>
          <Button variant="outline" size="sm" onPress={() => void decide("request_revision")} isDisabled={busy !== null}>{busy === "request_revision" ? <Spinner data-icon="inline-start" /> : <RefreshCw data-icon="inline-start" />}Request revision</Button>
          <Button variant="ghost" size="sm" className="ml-auto text-destructive hover:text-destructive" onPress={() => void decide("cancel")} isDisabled={busy !== null}>{busy === "cancel" ? <Spinner data-icon="inline-start" /> : <XCircle data-icon="inline-start" />}Cancel</Button>
        </CardFooter> : null}
      </Card>
    </div>
  );
}
