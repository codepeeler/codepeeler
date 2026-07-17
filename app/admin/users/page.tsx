"use client";

import AdminStatsBar from "@/components/admin/AdminStatsBar";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import AdminUserDetailPanel from "@/components/admin/AdminUserDetailPanel";
import { useAdminPanel } from "@/hooks/use-admin-panel";

export default function AdminUsersPage() {
  const {
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
    handleSendEmail,
  } = useAdminPanel();

  return (
    <>
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
          onSendEmail={handleSendEmail}
        />
      )}
    </>
  );
}
