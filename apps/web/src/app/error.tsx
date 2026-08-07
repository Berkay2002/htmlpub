"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@htmlpub/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@htmlpub/ui/components/card";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-app-grid p-5"><Card className="w-full max-w-md rounded-3xl border-border/80 bg-card/95 shadow-xl"><CardHeader className="items-center text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"><AlertTriangle /></span><CardTitle className="mt-2 text-xl">Something went wrong</CardTitle><CardDescription>Nothing was changed. Try the request again or return to the library.</CardDescription></CardHeader><CardContent className="flex flex-col gap-2 sm:flex-row"><Button className="rounded-xl sm:flex-1" onPress={reset}><RotateCcw data-icon="inline-start" />Try again</Button><Link href="/dashboard" className="sm:flex-1"><Button variant="outline" className="w-full rounded-xl">Back to library</Button></Link></CardContent></Card></main>;
}
