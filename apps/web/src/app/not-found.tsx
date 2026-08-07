import Link from "next/link";

export default function NotFound() {
  return <main className="setup-page"><div className="setup-panel"><span className="brand">htmlpub</span><h1>Not found</h1><p>The document or share link is unavailable.</p><Link className="button primary" href="/dashboard">Back to Library</Link></div></main>;
}
