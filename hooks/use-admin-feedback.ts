"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/providers/toast-provider";

export type FeedbackEntry = {
  id: string;
  userId: string | null;
  type: "feedback" | "feature_request" | "bug_report" | "rating";
  message: string;
  rating: number | null;
  status: "new" | "reviewed" | "resolved" | "wont_fix";
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
};

export function useAdminFeedback(type?: FeedbackEntry["type"]) {
  const { toast } = useToast();
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = type ? `?type=${type}` : "";
      const res = await fetch(`/api/admin/feedback${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't load feedback");
      setEntries(data.entries);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't load feedback");
    } finally {
      setLoading(false);
    }
  }, [type, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: FeedbackEntry["status"]) => {
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't update entry");
      setEntries((prev) => prev.map((e) => (e.id === id ? data.entry : e)));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't update entry");
    }
  };

  return { entries, loading, updateStatus };
}
