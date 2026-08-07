import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main className="setup-page">
        <div className="setup-panel">
          <span className="brand">htmlpub</span>
          <h1>Connect Clerk to sign in</h1>
          <p>Set the Clerk variables from <code>.env.example</code> to enable owner sign-in.</p>
        </div>
      </main>
    );
  }
  return <main className="auth-page"><SignIn /></main>;
}
