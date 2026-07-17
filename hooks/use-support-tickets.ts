"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/providers/toast-provider";

export type Ticket = { id: string; subject: string; status: string; createdAt: string; updatedAt: string };
export type TicketMessage = { id: string; senderId: string; senderRole: "user" | "admin"; message: string; createdAt: string };

export function useSupportTickets() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/support/tickets");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't load tickets");
      setTickets(data.tickets);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't load tickets");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const openTicket = async (id: string) => {
    setSelectedId(id);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/support/tickets/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't load ticket");
      setMessages(data.messages);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't load ticket");
    } finally {
      setDetailLoading(false);
    }
  };

  const createTicket = async (subject: string, message: string) => {
    setSending(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't send message");
      await loadTickets();
      toast("Ticket sent — we'll get back to you soon");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't send message");
    } finally {
      setSending(false);
    }
  };

  const replyToTicket = async (message: string) => {
    if (!selectedId) return;
    setSending(true);
    try {
      const res = await fetch(`/api/support/tickets/${selectedId}/messages`, {
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

  return { tickets, loading, selectedId, setSelectedId, messages, detailLoading, sending, openTicket, createTicket, replyToTicket };
}
