import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ArrowUpRight, Braces, Check, FileCode2, Globe2, LockKeyhole } from "lucide-react";
import { Badge } from "@htmlpub/ui/components/badge";
import { Button } from "@htmlpub/ui/components/button";
import { Card, CardContent, CardHeader } from "@htmlpub/ui/components/card";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-sidebar text-sidebar-foreground">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-2"><Braces className="text-sidebar-primary" /><span className="app-mark text-xl font-semibold">htmlpub</span><span className="mono-meta text-sidebar-primary">/</span></Link>
        <nav className="flex items-center gap-2" aria-label="Account">
          <Show when="signed-out"><SignInButton><Button variant="ghost" className="rounded-xl text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground">Sign in</Button></SignInButton><SignUpButton><Button className="rounded-xl">Create account</Button></SignUpButton></Show>
          <Show when="signed-in"><Link href="/dashboard"><Button className="rounded-xl">Open workspace<ArrowUpRight data-icon="inline-end" /></Button></Link><UserButton /></Show>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-16 sm:px-8 md:pb-24 md:pt-24 lg:grid-cols-[minmax(0,0.9fr)_minmax(480px,1.1fr)] lg:px-10 lg:pt-28">
        <div className="typeset typeset-ui max-w-2xl">
          <Badge variant="outline" className="mb-5 rounded-lg border-sidebar-border bg-sidebar-accent/60 text-sidebar-foreground">Private HTML publishing</Badge>
          <h1 className="max-w-xl text-5xl font-semibold leading-[0.98] tracking-[-0.065em] text-sidebar-foreground sm:text-7xl">Publish once. Keep the whole story.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-sidebar-foreground/70 sm:text-lg">Ship self-contained HTML, preserve every version, and share interactive work through links you can rotate or revoke.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Show when="signed-out"><SignUpButton><Button size="lg" className="rounded-xl">Create owner account<ArrowUpRight data-icon="inline-end" /></Button></SignUpButton></Show><Show when="signed-in"><Link href="/dashboard"><Button size="lg" className="rounded-xl">Open workspace<ArrowUpRight data-icon="inline-end" /></Button></Link></Show><Link href="/sign-in"><Button size="lg" variant="outline" className="rounded-xl border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground">See the workspace</Button></Link></div>
        </div>

        <Card className="rounded-3xl border-sidebar-border bg-sidebar-accent/45 p-2 text-sidebar-foreground shadow-2xl shadow-black/20">
          <CardHeader className="flex flex-row items-center justify-between gap-4 rounded-2xl border border-sidebar-border bg-sidebar px-4 py-3"><div className="flex items-center gap-2"><span className="size-2 rounded-full bg-emerald-400" /><span className="text-xs font-medium text-sidebar-foreground/70">htmlpub / workspace</span></div><Badge variant="outline" className="rounded-lg border-sidebar-border bg-sidebar-accent/50 text-[10px] text-sidebar-foreground/70">Live</Badge></CardHeader>
          <CardContent className="grid gap-3 p-3 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-sidebar-border bg-sidebar p-4"><FileCode2 className="text-sidebar-primary" /><p className="mt-6 text-sm font-semibold">Versioned</p><p className="mt-1 text-xs text-sidebar-foreground/60">Every publish is kept</p></div><div className="rounded-2xl border border-sidebar-border bg-sidebar p-4"><Globe2 className="text-emerald-400" /><p className="mt-6 text-sm font-semibold">Shareable</p><p className="mt-1 text-xs text-sidebar-foreground/60">Latest version links</p></div><div className="rounded-2xl border border-sidebar-border bg-sidebar p-4"><LockKeyhole className="text-amber-300" /><p className="mt-6 text-sm font-semibold">Private</p><p className="mt-1 text-xs text-sidebar-foreground/60">Access stays revocable</p></div></div>
            <div className="overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar"><div className="grid grid-cols-[minmax(0,1fr)_90px_72px] gap-4 border-b border-sidebar-border px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-sidebar-foreground/45"><span>Document</span><span>Version</span><span>Status</span></div>{["Portfolio review", "Launch plan", "Architecture notes"].map((title, index) => <div key={title} className="grid grid-cols-[minmax(0,1fr)_90px_72px] items-center gap-4 border-b border-sidebar-border/70 px-4 py-4 last:border-0"><span className="flex min-w-0 items-center gap-2 text-sm font-medium"><span className="flex size-7 items-center justify-center rounded-lg bg-sidebar-accent"><FileCode2 /></span><span className="truncate">{title}</span></span><span className="mono-meta text-sidebar-foreground/60">v{12 - index}</span><span className="flex items-center gap-1 text-[11px] text-emerald-300"><Check />Live</span></div>)}</div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
