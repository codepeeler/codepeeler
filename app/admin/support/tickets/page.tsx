"use client";

import AdminSupportTicketsPanel from "@/components/admin/AdminSupportTicketsPanel";
import { useAdminSupportTickets } from "@/hooks/use-admin-support-tickets";

export default function AdminSupportTicketsPage() {
  const supportTickets = useAdminSupportTickets();
  return (
    <AdminSupportTicketsPanel
      tickets={supportTickets.tickets}
      loading={supportTickets.loading}
      statusFilter={supportTickets.statusFilter}
      setStatusFilter={supportTickets.setStatusFilter}
      selectedId={supportTickets.selectedId}
      setSelectedId={supportTickets.setSelectedId}
      messages={supportTickets.messages}
      detailLoading={supportTickets.detailLoading}
      sending={supportTickets.sending}
      onOpen={supportTickets.openTicket}
      onReply={supportTickets.reply}
      onSetStatus={supportTickets.setTicketStatus}
    />
  );
}
