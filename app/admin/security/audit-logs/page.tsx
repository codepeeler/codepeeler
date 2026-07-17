"use client";

import AdminAuditLogTable from "@/components/admin/AdminAuditLogTable";
import { useAdminAuditLog } from "@/hooks/use-admin-audit-log";

export default function AdminAuditLogsPage() {
  const auditLog = useAdminAuditLog();
  return <AdminAuditLogTable entries={auditLog.entries} loading={auditLog.loading} page={auditLog.page} setPage={auditLog.setPage} />;
}
