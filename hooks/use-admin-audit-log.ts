"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/providers/toast-provider";

export type AuditLogEntry = {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  createdAt: string;
  admin: { id: string; name: string; email: string } | null;
  target: { id: string; name: string; email: string } | null;
};

export function useAdminAuditLog() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit-log?page=${page}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't load audit log");
      setEntries(data.entries);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't load audit log");
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    load();
  }, [load]);

  return { entries, loading, page, setPage };
}
