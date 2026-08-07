import Link from "next/link";
import { Braces, FileQuestion } from "lucide-react";
import { Button } from "@htmlpub/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@htmlpub/ui/components/card";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-app-grid p-5"><Card className="w-full max-w-md rounded-3xl border-border/80 bg-card/95 shadow-xl"><CardHeader className="items-center text-center"><Link href="/" className="flex items-center gap-2 text-lg font-semibold"><Braces className="text-primary" /><span className="app-mark">htmlpub</span></Link><span className="mt-8 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><FileQuestion /></span><CardTitle className="mt-2 text-xl">Document not found</CardTitle><CardDescription>The document or share link is unavailable.</CardDescription></CardHeader><CardContent><Link href="/dashboard"><Button className="w-full rounded-xl">Back to library</Button></Link></CardContent></Card></main>;
}
