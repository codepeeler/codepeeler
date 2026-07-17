"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/providers/toast-provider";

export type AdminSessionRow = {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  user: { id: string; name: string; email: string } | null;
};

export function useAdminSessions() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<AdminSessionRow[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sessions?page=${page}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't load sessions");
      setSessions(data.sessions);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't load sessions");
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const revoke = async (id: string) => {
    setRevokingId(id);
    try {
      const res = await fetch(`/api/admin/sessions/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't revoke session");
      toast("Session revoked");
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't revoke session");
    } finally {
      setRevokingId(null);
    }
  };

  return { sessions, loading, page, setPage, revoke, revokingId };
}
