"use client";

import { usePathname } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";
import { Braces, FileCode2, FolderKanban, KeyRound, UploadCloud } from "lucide-react";
import { useCallback, useState } from "react";
import { Toaster } from "@htmlpub/ui/components/sonner";
import { Button } from "@htmlpub/ui/components/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@htmlpub/ui/components/breadcrumb";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@htmlpub/ui/components/sidebar";
import { PublishModal } from "./publish-modal";

const items = [
  { href: "/dashboard", label: "Library", icon: FileCode2 },
  { href: "/dashboard/collections", label: "Collections", icon: FolderKanban },
  { href: "/dashboard/tokens", label: "API tokens", icon: KeyRound },
];

function currentLabel(pathname: string) {
  return items.find((item) => pathname === item.href || (item.href === "/dashboard" && pathname.startsWith("/dashboard/documents/")))?.label ?? "Workspace";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [publishing, setPublishing] = useState(false);
  const closePublishing = useCallback(() => setPublishing(false), []);

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-sidebar-border">
        <SidebarHeader className="p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard" size="lg" tooltip="htmlpub" className="group-data-[collapsible=icon]:justify-center">
                <Braces data-icon="inline-start" className="text-sidebar-primary" />
                <span className="app-mark text-lg font-semibold tracking-tight">htmlpub</span>
                <span className="mono-meta text-sidebar-primary">/</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarMenu>
              {items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href === "/dashboard" && pathname.startsWith("/dashboard/documents/"));
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton href={href} isActive={active} tooltip={label}>
                      <Icon data-icon="inline-start" />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel>Publish</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <Button onPress={() => setPublishing(true)} className="w-full justify-start gap-2 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0" size="lg">
                  <UploadCloud data-icon="inline-start" />
                  <span className="group-data-[collapsible=icon]:hidden">Publish HTML</span>
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="gap-2 border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2 overflow-hidden rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-2.5">
            <Show when="signed-in"><UserButton /></Show>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-xs font-medium text-sidebar-foreground">Workspace owner</p>
              <p className="truncate text-[11px] text-sidebar-foreground/60">Private workspace</p>
            </div>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="bg-app-grid">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border/80 bg-background/95 px-4 backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger />
            <div className="hidden h-5 w-px bg-border sm:block" />
            <Breadcrumb className="hidden sm:block">
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="/dashboard">Workspace</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbItem><BreadcrumbPage>{currentLabel(pathname)}</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="hidden rounded-lg border border-border bg-muted px-2 py-1 text-[11px] font-medium lg:inline-flex">⌘ B</kbd>
            <Button size="sm" className="rounded-xl" onPress={() => setPublishing(true)}><UploadCloud data-icon="inline-start" />Publish HTML</Button>
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <footer className="border-t border-border/80 bg-background/80 px-4 py-3 text-[11px] text-muted-foreground lg:px-8">
          Interactive artifacts may contact third-party services.
        </footer>
      </SidebarInset>
      {publishing ? <PublishModal onClose={closePublishing} /> : null}
      <Toaster position="bottom-right" />
    </SidebarProvider>
  );
}
