"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "#components/alert";
import { Button, LinkButton } from "#components/button";
import { Spinner } from "#components/spinner";
import { cn } from "#lib/utils";

type ReaderPreferences = {
  scale: "sm" | "md" | "lg";
  width: "narrow" | "comfortable" | "wide";
  theme: "system" | "light" | "dark";
};

export type ReaderSelection = {
  exact: string;
  prefix: string;
  suffix: string;
  start: number;
  end: number;
  heading: string | null;
};

const DEFAULT_PREFERENCES: ReaderPreferences = { scale: "md", width: "comfortable", theme: "system" };
const PREFERENCES_KEY = "htmlpub-reader-preferences";

function readPreferences(): ReaderPreferences {
  try {
    const value = JSON.parse(window.localStorage.getItem(PREFERENCES_KEY) ?? "null") as Partial<ReaderPreferences> | null;
    return {
      scale: value?.scale === "sm" || value?.scale === "lg" ? value.scale : DEFAULT_PREFERENCES.scale,
      width: value?.width === "narrow" || value?.width === "wide" ? value.width : DEFAULT_PREFERENCES.width,
      theme: value?.theme === "light" || value?.theme === "dark" ? value.theme : DEFAULT_PREFERENCES.theme,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function isReaderPreferences(value: unknown): value is ReaderPreferences {
  if (!value || typeof value !== "object") return false;
  const preferences = value as Partial<ReaderPreferences>;
  return (preferences.scale === "sm" || preferences.scale === "md" || preferences.scale === "lg") &&
    (preferences.width === "narrow" || preferences.width === "comfortable" || preferences.width === "wide") &&
    (preferences.theme === "system" || preferences.theme === "light" || preferences.theme === "dark");
}

function isReaderSelection(value: unknown): value is ReaderSelection {
  if (!value || typeof value !== "object") return false;
  const selection = value as Partial<ReaderSelection>;
  return typeof selection.exact === "string" && selection.exact.trim().length > 0 &&
    typeof selection.prefix === "string" && typeof selection.suffix === "string" &&
    typeof selection.start === "number" && Number.isInteger(selection.start) && selection.start >= 0 &&
    typeof selection.end === "number" && Number.isInteger(selection.end) && selection.end >= selection.start &&
    (selection.heading === null || typeof selection.heading === "string");
}

async function copyText(value: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value);
    return;
  } catch {
    const input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
}

export function ReaderFrame({ src, rawSrc, title, className, onSelection }: { src: string; rawSrc?: string; title: string; className?: string; onSelection?: (selection: ReaderSelection | null) => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [preferences, setPreferences] = useState<ReaderPreferences>(() => (typeof window === "undefined" ? DEFAULT_PREFERENCES : readPreferences()));
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const frame = iframeRef.current;
    function sendPreferences() {
      frame?.contentWindow?.postMessage({ type: "htmlpub-reader-preferences", preferences }, "*");
    }
    function handleMessage(event: MessageEvent<{ type?: string; preferences?: unknown; text?: string; selection?: unknown }>) {
      if (event.source !== frame?.contentWindow || !event.data) return;
      if (event.data.type === "htmlpub-reader-ready") sendPreferences();
      if (event.data.type === "htmlpub-reader-preferences" && isReaderPreferences(event.data.preferences)) {
        setPreferences(event.data.preferences);
        try { window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(event.data.preferences)); } catch { /* storage is optional */ }
      }
      if (event.data.type === "htmlpub-reader-copy" && event.data.text) void copyText(event.data.text);
      if (event.data.type === "htmlpub-reader-selection" && onSelection) onSelection(isReaderSelection(event.data.selection) ? event.data.selection : null);
    }
    window.addEventListener("message", handleMessage);
    sendPreferences();
    return () => window.removeEventListener("message", handleMessage);
  }, [preferences, reloadKey, onSelection]);

  return (
    <div className={cn("relative", className)} aria-busy={loading && !failed}>
      {loading && !failed ? <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-background/80 backdrop-blur-sm"><div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs text-muted-foreground shadow-lg"><Spinner />Loading reader</div></div> : null}
      <iframe
        key={reloadKey}
        ref={iframeRef}
        title={title}
        src={src}
        className="block h-full min-h-0 w-full border-0 bg-background"
        sandbox="allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox"
        referrerPolicy="no-referrer"
        onLoad={() => { setLoading(false); setFailed(false); }}
        onError={() => { setLoading(false); setFailed(true); }}
      />
      {failed ? <div className="absolute inset-0 z-20 grid place-items-center bg-background/95 p-6"><Alert variant="destructive" className="max-w-md"><AlertTitle>Reader unavailable</AlertTitle><AlertDescription className="mt-1">The document could not be loaded. Try again or open the original artifact.</AlertDescription><div className="mt-3 flex flex-wrap gap-2"><Button size="sm" onPress={() => { setFailed(false); setLoading(true); setReloadKey((value) => value + 1); }}>Try again</Button>{rawSrc ? <LinkButton variant="outline" size="sm" href={rawSrc} target="_blank" rel="noreferrer">Open original</LinkButton> : null}</div></Alert></div> : null}
    </div>
  );
}
