import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <main className="home-page">
      <header><span className="brand">htmlpub</span><nav aria-label="Account">
        <Show when="signed-out"><SignInButton /><SignUpButton><button className="button primary">Create owner account</button></SignUpButton></Show>
        <Show when="signed-in"><Link className="button primary" href="/dashboard">Open workspace</Link><UserButton /></Show>
      </nav></header>
      <section><span className="eyebrow">Private HTML publishing</span><h1>Your reports, available wherever you are.</h1><p>Publish self-contained HTML, keep every version, and share interactive work through revocable links.</p>
        <Show when="signed-out"><SignUpButton><button className="button primary home-cta">Create owner account</button></SignUpButton></Show>
        <Show when="signed-in"><Link className="button primary home-cta" href="/dashboard">Open workspace</Link></Show>
      </section>
    </main>
  );
}
