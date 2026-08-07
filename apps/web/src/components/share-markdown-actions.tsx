"use client";

import { Check, Copy, FileText, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@htmlpub/ui/components/button";
import { buttonVariants } from "@htmlpub/ui/lib/button-variants";

type CopyState = "idle" | "copying" | "copied" | "failed";

async function copyText(value: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value);
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

export function ShareMarkdownActions({ markdownUrl }: { markdownUrl: string }) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  async function copyMarkdown() {
    setCopyState("copying");
    try {
      const response = await fetch(markdownUrl, { cache: "no-store" });
      if (!response.ok) throw new Error("Markdown request failed");
      await copyText(await response.text());
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("failed");
    }
  }

  const label = copyState === "copying" ? "Copying" : copyState === "copied" ? "Copied" : copyState === "failed" ? "Try again" : "Copy Markdown";
  const Icon = copyState === "copying" ? LoaderCircle : copyState === "copied" ? Check : Copy;

  return (
    <>
      <Button variant="outline" size="sm" className="rounded-xl" onPress={() => void copyMarkdown()} isDisabled={copyState === "copying"}>
        <Icon data-icon="inline-start" className={copyState === "copying" ? "animate-spin" : undefined} />
        {label}
      </Button>
      <a href={markdownUrl} target="_blank" rel="noreferrer" type="text/markdown" className={`${buttonVariants({ variant: "outline", size: "sm" })} rounded-xl max-sm:hidden`}>
        <FileText data-icon="inline-start" />Markdown
      </a>
    </>
  );
}
