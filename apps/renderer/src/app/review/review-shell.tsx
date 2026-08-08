"use client";

import { useEffect, useState } from "react";
import type { ApiEnvelope, ReviewWorkspaceAccess } from "@htmlpub/core";
import { Alert, AlertDescription, AlertTitle } from "@htmlpub/ui/components/alert";
import { ReviewWorkspace } from "@htmlpub/ui/components/review-workspace";
import { Spinner } from "@htmlpub/ui/components/spinner";

type State = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; access: ReviewWorkspaceAccess; ticket: string };

async function loadReview(ticket: string): Promise<ReviewWorkspaceAccess> {
  const response = await fetch("/api/review", { headers: { authorization: `Bearer ${ticket}` }, cache: "no-store" });
  const envelope = await response.json() as ApiEnvelope<ReviewWorkspaceAccess>;
  if (!envelope.ok) throw new Error(envelope.error.message);
  return envelope.data;
}

export function ReviewShell() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const ticket = window.location.hash.slice(1);
    let cancelled = false;
    if (!ticket) {
      queueMicrotask(() => { if (!cancelled) setState({ status: "error", message: "This review link is missing its access capability." }); });
      return () => { cancelled = true; };
    }
    void loadReview(ticket).then(
      (access) => { if (!cancelled) setState({ status: "ready", access, ticket }); },
      (error: unknown) => { if (!cancelled) setState({ status: "error", message: error instanceof Error ? error.message : "The review could not be loaded." }); }
    );
    return () => { cancelled = true; };
  }, []);

  if (state.status === "loading") return <main className="grid min-h-svh place-items-center bg-background"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner />Loading review</div></main>;
  if (state.status === "error") return <main className="grid min-h-svh place-items-center bg-background p-6"><Alert variant="destructive" className="max-w-md"><AlertTitle>Review unavailable</AlertTitle><AlertDescription className="mt-1">{state.message}</AlertDescription></Alert></main>;

  return <ReviewWorkspace
    title={state.access.title}
    src={state.access.readerUrl}
    rawSrc={state.access.rawUrl}
    initialReview={state.access.review}
    reviewPath="/api/review"
    requestHeaders={{ authorization: `Bearer ${state.ticket}` }}
    dashboardHref={state.access.dashboardUrl}
    variant="fullscreen"
  />;
}
