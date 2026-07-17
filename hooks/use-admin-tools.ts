"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/providers/toast-provider";
import type { AdminToolRow } from "@/lib/tool-overrides";

export function useAdminTools() {
  const { toast } = useToast();
  const [tools, setTools] = useState<AdminToolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tools");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't load tools");
      setTools(data.tools);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't load tools");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (id: string, patch: Partial<Pick<AdminToolRow, "enabled" | "featured" | "beta">>) => {
    setTools((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    try {
      const res = await fetch(`/api/admin/tools/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't update tool");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't update tool");
      load();
    }
  };

  const filtered = query.trim()
    ? tools.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()) || t.cat.toLowerCase().includes(query.toLowerCase()))
    : tools;

  return { tools: filtered, loading, query, setQuery, update };
}
