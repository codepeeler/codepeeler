"use client";

import { useRouter } from "next/navigation";
import MobileHeader from "@/components/layout/mobile/MobileHeader";
import AdminStatsBar from "@/components/admin/AdminStatsBar";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import AdminUserDetailPanel from "@/components/admin/AdminUserDetailPanel";
import { useAdminPanel } from "@/hooks/use-admin-panel";

/**
 * Internal ops tool, not a customer-facing page — one responsive layout
 * (same pattern as app/profile/page.tsx) rather than separate Desktop/Mobile
 * views. Gated twice: middleware.ts confirms there's a session, this page
 * (via useAdminPanel) confirms session.user.role === "admin" and bounces
 * anyone else to the dashboard; every /api/admin/* route re-checks the role
 * itself too, so this page-level check is only about avoiding a UI flash.
 */
export default function AdminPage() {
  const router = useRouter();
  const {
    isAdmin,
    checkingAccess,
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
  } = useAdminPanel();

  if (checkingAccess || !isAdmin) {
    return (
      <>
        <MobileHeader title="Admin" onBack={() => router.back()} />
        <div className="mx-auto max-w-[1200px] px-4 py-5 lg:px-6 lg:py-7" />
      </>
    );
  }

  return (
    <>
      <MobileHeader title="Admin" onBack={() => router.back()} />
      <main className="mx-auto max-w-[1200px] px-4 py-5 lg:px-6 lg:py-7">
        <div className="mb-7">
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.01em]">Admin</h1>
          <p className="mt-1 text-[13.5px] text-[var(--text-dim)]">Users, subscriptions, and usage — for support and ops.</p>
        </div>

        <AdminStatsBar stats={stats} loading={statsLoading} />

        <AdminUsersTable
          query={query}
          setQuery={setQuery}
          onSearchSubmit={handleSearchSubmit}
          users={users}
          loading={usersLoading}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          onSelectUser={handleSelectUser}
        />
      </main>

      {selectedUserId && (
        <AdminUserDetailPanel
          detail={detail}
          loading={detailLoading}
          actionPending={actionPending}
          onClose={handleCloseDetail}
          onGrantPro={handleGrantPro}
          onRevokePro={handleRevokePro}
          onResetUsage={handleResetUsage}
          onToggleBan={handleToggleBan}
          onToggleRole={handleToggleRole}
        />
      )}
    </>
  );
}
