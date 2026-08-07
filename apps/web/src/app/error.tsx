"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="setup-page"><div className="setup-panel"><span className="brand">htmlpub</span><h1>Something went wrong</h1><p>The request could not be completed. No document data was changed.</p><button className="button primary" onClick={reset}>Try again</button></div></main>;
}
