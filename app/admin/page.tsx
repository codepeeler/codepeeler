"use client";

import AdminDashboardOverview from "@/components/admin/AdminDashboardOverview";
import { useAdminPanel } from "@/hooks/use-admin-panel";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";

/**
 * Dashboard tab — every number here comes from a real query (see
 * app/api/admin/dashboard/route.ts and app/api/admin/stats/route.ts).
 * Nothing is hardcoded. Widgets that need infrastructure that doesn't
 * exist yet (server load, storage, job queue) were deliberately left out
 * rather than faking numbers for them — revisit once the app is split
 * frontend/backend and Redis/BullMQ is in place.
 */
export default function AdminDashboardPage() {
  const { stats, statsLoading } = useAdminPanel();
  const { data, loading } = useAdminDashboard();

  return <AdminDashboardOverview stats={stats} statsLoading={statsLoading} data={data} loading={loading} />;
}
