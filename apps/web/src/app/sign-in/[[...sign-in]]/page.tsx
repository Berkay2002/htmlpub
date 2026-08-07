import Link from "next/link";
import { Braces, LockKeyhole } from "lucide-react";
import { SignIn } from "@clerk/nextjs";
import { Card, CardDescription, CardHeader, CardTitle } from "@htmlpub/ui/components/card";

export default function SignInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <main className="grid min-h-screen place-items-center bg-sidebar p-5"><Card className="w-full max-w-md rounded-3xl border-sidebar-border bg-sidebar-accent text-sidebar-foreground shadow-2xl"><CardHeader className="p-7"><Link href="/" className="flex items-center gap-2 text-sidebar-foreground"><Braces className="text-sidebar-primary" /><span className="app-mark text-xl font-semibold">htmlpub</span></Link><CardTitle className="mt-8 text-2xl text-sidebar-foreground">Connect Clerk to sign in</CardTitle><CardDescription className="text-sidebar-foreground/65">Set the Clerk variables from <code className="rounded bg-sidebar px-1.5 py-0.5">.env.example</code> to enable owner sign-in.</CardDescription></CardHeader></Card> </main>;
  }
  return <main className="flex min-h-screen items-center justify-center bg-sidebar p-5"><div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2"><div className="typeset typeset-ui hidden text-sidebar-foreground lg:block"><Link href="/" className="flex items-center gap-2"><Braces className="text-sidebar-primary" /><span className="app-mark text-xl font-semibold">htmlpub</span></Link><h1 className="mt-20 max-w-md text-5xl font-semibold leading-none tracking-tight">Your publishing workspace, ready when you are.</h1><p className="mt-5 max-w-md text-base text-sidebar-foreground/65">Version, preview, and securely share your interactive HTML.</p></div><div className="flex flex-col items-center gap-4"><div className="flex items-center gap-2 text-sidebar-foreground lg:hidden"><Braces className="text-sidebar-primary" /><span className="app-mark text-xl font-semibold">htmlpub</span></div><div className="flex items-center gap-2 text-xs text-sidebar-foreground/55"><LockKeyhole /><span>Private workspace access</span></div><SignIn /></div></div></main>;
}
