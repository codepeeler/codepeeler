"use client";

import { usePathname } from "next/navigation";
import AdminComingSoon from "@/components/admin/AdminComingSoon";
import { titleForAdminPath } from "@/lib/data/admin-nav";

// Next.js resolves a static route (e.g. app/admin/users/page.tsx) over this
// catch-all automatically, so every real page built so far already wins.
// Everything else in the nav lands here.
export default function AdminCatchAllPage() {
  const pathname = usePathname();
  return <AdminComingSoon label={titleForAdminPath(pathname)} />;
}
