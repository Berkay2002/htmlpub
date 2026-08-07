"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, KeyRound, Library, UploadCloud } from "lucide-react";
import { useCallback, useState } from "react";
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
            <Link key={href} href={href} className={pathname === href ? "nav-link active" : "nav-link"}>
              <Icon aria-hidden="true" size={20} strokeWidth={1.6} />{label}
            </Link>
          ))}
        </nav>
        <button className="publish-button" onClick={() => setPublishing(true)}><UploadCloud size={19} />Publish HTML</button>
        <div className="owner-row"><span className="avatar">ME</span><span>Workspace owner</span></div>
      </aside>
      <div className="workspace">
        <main>{children}</main>
        <footer>Interactive artifacts may contact third-party services.</footer>
      </div>
      {publishing ? <PublishModal onClose={closePublishing} /> : null}
    </div>
  );
}
