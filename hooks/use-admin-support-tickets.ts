"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/providers/toast-provider";

export type AdminTicket = {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
  userEmail: string;
};
export type AdminTicketMessage = { id: string; senderId: string; senderRole: "user" | "admin"; message: string; createdAt: string };

export function useAdminSupportTickets() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AdminTicketMessage[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/support/tickets${statusFilter ? `?status=${statusFilter}` : ""}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't load tickets");
      setTickets(data.tickets);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't load tickets");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const openTicket = async (id: string) => {
    setSelectedId(id);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/support/tickets/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't load ticket");
      setMessages(data.messages);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't load ticket");
    } finally {
      setDetailLoading(false);
    }
  };

  const reply = async (message: string) => {
    if (!selectedId) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/support/tickets/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't send reply");
      setMessages((prev) => [...prev, data.message]);
      await loadTickets();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't send reply");
    } finally {
      setSending(false);
    }
  };

  const setTicketStatus = async (status: "open" | "pending" | "closed") => {
    if (!selectedId) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/support/tickets/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't update ticket");
      await loadTickets();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't update ticket");
    } finally {
      setSending(false);
    }
  };

  return {
    tickets,
    loading,
    statusFilter,
    setStatusFilter,
    selectedId,
    setSelectedId,
    messages,
    detailLoading,
    sending,
    openTicket,
    reply,
    setTicketStatus,
  };
}
