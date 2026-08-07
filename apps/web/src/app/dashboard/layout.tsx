import { requireOwnerPage } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireOwnerPage();
  return <AppShell>{children}</AppShell>;
}
