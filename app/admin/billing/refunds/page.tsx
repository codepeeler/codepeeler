"use client";

import AdminRefundsPanel from "@/components/admin/AdminRefundsPanel";
import { useAdminRefunds } from "@/hooks/use-admin-refunds";

export default function AdminRefundsPage() {
  const { refunds, loading, saving, create, updateStatus } = useAdminRefunds();
  return <AdminRefundsPanel refunds={refunds} loading={loading} saving={saving} onCreate={create} onUpdateStatus={updateStatus} />;
}
