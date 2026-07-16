"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/providers/toast-provider";
import { useSession } from "@/lib/auth-client";

export type AdminStats = {
  totalUsers: number;
  newUsersLast7Days: number;
  proUsers: number;
  freeUsers: number;
  executionsThisPeriod: number;
  aiCallsThisPeriod: number;
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
  banned: boolean;
  createdAt: string;
  plan: "free" | "pro";
  subscriptionStatus: string | null;
  billingCycle: string | null;
  currentPeriodEnd: string | null;
  executionsUsed: number;
  aiCallsUsed: number;
};

export type AdminUserDetail = {
  user: { id: string; name: string; email: string; emailVerified: boolean; role: string; banned: boolean; createdAt: string };
  subscriptions: Array<{
    id: string;
    planId: string;
    billingCycle: string;
    status: string;
    currentPeriodEnd: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  activeSubscription: AdminUserDetail["subscriptions"][number] | null;
  entitlements: { plan: "free" | "pro"; usage: Record<string, number> };
  topTools: Array<{ toolId: string; name: string; count: number; lastUsedAt: string }>;
  counts: { collections: number; workflows: number; snippets: number };
  lastActiveAt: string | null;
  recentActivity: Array<{ id: string; type: string; entityId: string | null; entityName: string | null; createdAt: string }>;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data as T;
}

/**
 * Same pattern as useDashboardData()/useProfile() — all admin panel state
 * and handlers live here, app/admin/page.tsx just renders around it.
 * Redirects non-admins straight to the dashboard (the API routes enforce
 * this too — this is just so a non-admin doesn't see a flash of the UI).
 */
export function useAdminPanel() {
  const { data: session, isPending: sessionPending } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (sessionPending) return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (!isAdmin) {
      toast("You don't have access to the admin panel");
      router.push("/workspace/dashboard");
    }
  }, [sessionPending, session, isAdmin, router, toast]);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [usersLoading, setUsersLoading] = useState(true);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionPending, setActionPending] = useState(false);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await fetchJson<AdminStats>("/api/admin/stats");
      setStats(data);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't load stats");
    } finally {
      setStatsLoading(false);
    }
  }, [toast]);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (query.trim()) params.set("q", query.trim());
      const data = await fetchJson<{ users: AdminUserRow[]; totalPages: number }>(`/api/admin/users?${params}`);
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't load users");
    } finally {
      setUsersLoading(false);
    }
  }, [page, query, toast]);

  const loadDetail = useCallback(
    async (userId: string) => {
      setDetailLoading(true);
      try {
        const data = await fetchJson<AdminUserDetail>(`/api/admin/users/${userId}`);
        setDetail(data);
      } catch (err) {
        toast(err instanceof Error ? err.message : "Couldn't load user detail");
      } finally {
        setDetailLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (!isAdmin) return;
    loadStats();
  }, [isAdmin, loadStats]);

  useEffect(() => {
    if (!isAdmin) return;
    loadUsers();
  }, [isAdmin, loadUsers]);

  useEffect(() => {
    if (!selectedUserId) {
      setDetail(null);
      return;
    }
    loadDetail(selectedUserId);
  }, [selectedUserId, loadDetail]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleSelectUser = (userId: string) => setSelectedUserId(userId);
  const handleCloseDetail = () => setSelectedUserId(null);

  const refreshAfterAction = async () => {
    await Promise.all([loadUsers(), loadStats(), selectedUserId ? loadDetail(selectedUserId) : Promise.resolve()]);
  };

  const handleGrantPro = async (userId: string) => {
    setActionPending(true);
    try {
      await fetchJson(`/api/admin/users/${userId}/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "grant" }),
      });
      toast("Pro access granted");
      await refreshAfterAction();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't grant Pro");
    } finally {
      setActionPending(false);
    }
  };

  const handleRevokePro = async (userId: string) => {
    setActionPending(true);
    try {
      await fetchJson(`/api/admin/users/${userId}/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke" }),
      });
      toast("Pro access revoked");
      await refreshAfterAction();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't revoke Pro");
    } finally {
      setActionPending(false);
    }
  };

  const handleResetUsage = async (userId: string, type: "executions" | "ai-calls" | "all") => {
    setActionPending(true);
    try {
      await fetchJson(`/api/admin/users/${userId}/usage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      toast("Usage reset");
      await refreshAfterAction();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't reset usage");
    } finally {
      setActionPending(false);
    }
  };

  const handleToggleBan = async (userId: string, banned: boolean) => {
    setActionPending(true);
    try {
      await fetchJson(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned }),
      });
      toast(banned ? "User banned" : "User unbanned");
      await refreshAfterAction();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't toggle ban state");
    } finally {
      setActionPending(false);
    }
  };

  const handleToggleRole = async (userId: string, role: "admin" | "user") => {
    setActionPending(true);
    try {
      await fetchJson(`/api/admin/users/${userId}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      toast(`User role updated to ${role}`);
      await refreshAfterAction();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't update role");
    } finally {
      setActionPending(false);
    }
  };

  return {
    isAdmin,
    checkingAccess: sessionPending || !session,

    stats,
    statsLoading,

    query,
    setQuery,
    page,
    setPage,
    users,
    totalPages,
    usersLoading,
    handleSearchSubmit,

    selectedUserId,
    detail,
    detailLoading,
    actionPending,
    handleSelectUser,
    handleCloseDetail,
    handleGrantPro,
    handleRevokePro,
    handleResetUsage,
    handleToggleBan,
    handleToggleRole,
  };
}
