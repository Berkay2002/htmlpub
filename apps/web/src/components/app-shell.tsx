"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";
import { Folder, KeyRound, Library, UploadCloud } from "lucide-react";
import { useCallback, useState } from "react";
import { Button, buttonVariants } from "@htmlpub/ui/components/button";
import { PublishModal } from "./publish-modal";

const items = [
  { href: "/dashboard", label: "Library", icon: Library },
  { href: "/dashboard/collections", label: "Collections", icon: Folder },
  { href: "/dashboard/tokens", label: "API tokens", icon: KeyRound }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [publishing, setPublishing] = useState(false);
  const closePublishing = useCallback(() => setPublishing(false), []);
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="brand">htmlpub</Link>
        <nav aria-label="Workspace">
          {items.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`${buttonVariants({ variant: pathname === href ? "secondary" : "ghost", size: "lg" })} nav-link${pathname === href ? " active" : ""}`}>
              <Icon aria-hidden="true" data-icon="inline-start" />{label}
            </Link>
          ))}
        </nav>
        <Button className="publish-button" size="lg" onPress={() => setPublishing(true)}><UploadCloud data-icon="inline-start" /> <span>Publish HTML</span></Button>
        <div className="owner-row"><Show when="signed-in"><UserButton /></Show><span>Workspace owner</span></div>
      </aside>
      <div className="workspace">
        <main>{children}</main>
        <footer>Interactive artifacts may contact third-party services.</footer>
      </div>
      {publishing ? <PublishModal onClose={closePublishing} /> : null}
    </div>
  );
}
