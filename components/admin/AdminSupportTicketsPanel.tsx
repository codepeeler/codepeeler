"use client";

import { useState } from "react";
import { LifeBuoy, Send, ArrowLeft } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import type { AdminTicket, AdminTicketMessage } from "@/hooks/use-admin-support-tickets";

const STATUS_OPTIONS = ["", "open", "pending", "closed"] as const;

type Props = {
  tickets: AdminTicket[];
  loading: boolean;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  messages: AdminTicketMessage[];
  detailLoading: boolean;
  sending: boolean;
  onOpen: (id: string) => void;
  onReply: (message: string) => void;
  onSetStatus: (status: "open" | "pending" | "closed") => void;
};

export default function AdminSupportTicketsPanel({
  tickets,
  loading,
  statusFilter,
  setStatusFilter,
  selectedId,
  setSelectedId,
  messages,
  detailLoading,
  sending,
  onOpen,
  onReply,
  onSetStatus,
}: Props) {
  const [reply, setReply] = useState("");
  const selected = tickets.find((t) => t.id === selectedId);

  if (selectedId) {
    return (
      <div className="rounded-[14px] border border-[var(--border)] p-4">
        <button
          onClick={() => setSelectedId(null)}
          className="mb-3 flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--text-dim)] hover:text-[var(--text)]"
        >
          <ArrowLeft size={14} /> Back to tickets
        </button>

        {selected && (
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-bold">{selected.subject}</h3>
              <p className="text-[12px] text-[var(--text-faint)]">
                {selected.userName} · {selected.userEmail}
              </p>
            </div>
            <select
              value={selected.status}
              onChange={(e) => onSetStatus(e.target.value as "open" | "pending" | "closed")}
              className="h-8 rounded-[7px] border border-[var(--border)] bg-[var(--bg)] px-2 text-[12px] outline-none"
            >
              <option value="open">Open</option>
              <option value="pending">Awaiting user</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        )}

        {detailLoading ? (
          <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">Loading…</div>
        ) : (
          <div className="mb-3 flex flex-col gap-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-[10px] px-3 py-2 text-[12.5px] ${
                  m.senderRole === "admin" ? "self-end bg-[var(--primary)] text-white" : "self-start border border-[var(--border)]"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.message}</p>
                <p className={`mt-1 text-[10px] ${m.senderRole === "admin" ? "text-white/70" : "text-[var(--text-faint)]"}`}>
                  {m.senderRole === "admin" ? "You" : "User"} · {formatTimeAgo(m.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Reply to user…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && reply.trim()) {
                onReply(reply);
                setReply("");
              }
            }}
            className="h-8 flex-1 rounded-[7px] border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[12.5px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
          />
          <button
            onClick={() => {
              if (!reply.trim()) return;
              onReply(reply);
              setReply("");
            }}
            disabled={sending || !reply.trim()}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[7px] bg-[var(--primary)] text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[14px] border border-[var(--border)]">
      <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-4 py-3">
        <h3 className="flex items-center gap-1.5 text-[13px] font-semibold">
          <LifeBuoy size={14} className="text-[var(--text-faint)]" /> Support tickets
        </h3>
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s || "all"}
              onClick={() => setStatusFilter(s)}
              className={`rounded-[6px] px-2 py-1 text-[11px] font-semibold ${
                statusFilter === s ? "bg-[var(--primary)] text-white" : "text-[var(--text-dim)] hover:bg-[var(--card)]"
              }`}
            >
              {s ? s[0].toUpperCase() + s.slice(1) : "All"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">Loading…</div>
      ) : tickets.length === 0 ? (
        <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">No tickets.</div>
      ) : (
        <div className="divide-y divide-[var(--border-soft)]">
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => onOpen(t.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-[var(--card)]"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-semibold">{t.subject}</div>
                <div className="text-[11px] text-[var(--text-faint)]">
                  {t.userName} · {formatTimeAgo(t.updatedAt)}
                </div>
              </div>
              <span className="flex-shrink-0 rounded-full bg-[var(--border)]/40 px-2 py-[3px] text-[10.5px] font-semibold text-[var(--text-dim)]">
                {t.status}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
