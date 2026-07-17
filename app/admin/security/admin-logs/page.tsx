"use client";

import AdminLogsPanel from "@/components/admin/AdminLogsPanel";
import { useAdminLogs } from "@/hooks/use-admin-logs";

export default function AdminLogsPage() {
  const { admins, loading } = useAdminLogs();
  return <AdminLogsPanel admins={admins} loading={loading} />;
}
