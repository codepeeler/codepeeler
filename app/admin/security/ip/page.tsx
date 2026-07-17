"use client";

import AdminIpRulesPanel from "@/components/admin/AdminIpRulesPanel";
import { useAdminIpRules } from "@/hooks/use-admin-ip-rules";

export default function AdminIpRulesPage() {
  const { rules, loading, saving, create, remove } = useAdminIpRules();
  return <AdminIpRulesPanel rules={rules} loading={loading} saving={saving} onCreate={create} onDelete={remove} />;
}
