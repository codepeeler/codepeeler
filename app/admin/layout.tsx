"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { useAdminAccess } from "@/hooks/use-admin-access";
import { titleForAdminPath } from "@/lib/data/admin-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, checkingAccess, user } = useAdminAccess();
  const pathname = usePathname();

  if (checkingAccess || !isAdmin) {
    return <div className="min-h-screen bg-[var(--bg-elev)]" />;
  }

  const title = titleForAdminPath(pathname);
  const subtitle = pathname === "/admin" ? `Welcome back, ${user?.name?.split(" ")[0] ?? "Admin"} 👋` : undefined;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-elev)]">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminTopbar title={title} subtitle={subtitle} user={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
