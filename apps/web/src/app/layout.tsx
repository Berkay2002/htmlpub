import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "htmlpub", template: "%s · htmlpub" },
  description: "Publish, version, and securely share interactive HTML reports."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? <ClerkProvider>{children}</ClerkProvider> : children}</body>
    </html>
  );
}
