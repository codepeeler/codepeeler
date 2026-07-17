"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LifeBuoy, Send, Plus, ArrowLeft } from "lucide-react";
import MobileHeader from "@/components/layout/mobile/MobileHeader";
import { useSupportTickets } from "@/hooks/use-support-tickets";
import { formatTimeAgo } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = { open: "Open", pending: "Awaiting reply", closed: "Closed" };
const STATUS_COLOR: Record<string, string> = {
  open: "text-[var(--warning)] bg-[var(--warning)]/10",
  pending: "text-[var(--primary)] bg-[var(--primary)]/10",
  closed: "text-[var(--text-faint)] bg-[var(--border)]/40",
};

export default function SupportPage() {
  const router = useRouter();
  const { tickets, loading, selectedId, setSelectedId, messages, detailLoading, sending, openTicket, createTicket, replyToTicket } =
    useSupportTickets();

  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [reply, setReply] = useState("");

  const selectedTicket = tickets.find((t) => t.id === selectedId);

  return (
    <>
      <MobileHeader title="Support" onBack={() => router.back()} />
      <main className="mx-auto max-w-[720px] px-4 py-5 lg:px-6 lg:py-7">
        {selectedId ? (
          <div>
            <button
              onClick={() => setSelectedId(null)}
              className="mb-4 flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--text-dim)] hover:text-[var(--text)]"
            >
              <ArrowLeft size={14} /> Back to tickets
            </button>

            {selectedTicket && (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[16px] font-bold">{selectedTicket.subject}</h2>
                <span className={`rounded-full px-2 py-[3px] text-[11px] font-semibold ${STATUS_COLOR[selectedTicket.status]}`}>
                  {STATUS_LABEL[selectedTicket.status] ?? selectedTicket.status}
                </span>
              </div>
            )}

            {detailLoading ? (
              <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">Loading…</div>
            ) : (
              <div className="mb-4 flex flex-col gap-2.5">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[85%] rounded-[12px] px-3.5 py-2.5 text-[13px] ${
                      m.senderRole === "admin" ? "self-start bg-[var(--card)] border border-[var(--border)]" : "self-end bg-[var(--primary)] text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.message}</p>
                    <p className={`mt-1 text-[10.5px] ${m.senderRole === "admin" ? "text-[var(--text-faint)]" : "text-white/70"}`}>
                      {m.senderRole === "admin" ? "Support" : "You"} · {formatTimeAgo(m.createdAt)}
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
                placeholder="Type a reply…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && reply.trim()) {
                    replyToTicket(reply);
                    setReply("");
                  }
                }}
                className="h-9 flex-1 rounded-[8px] border border-[var(--border)] bg-[var(--bg)] px-3 text-[13px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
              />
              <button
                onClick={() => {
                  if (!reply.trim()) return;
                  replyToTicket(reply);
                  setReply("");
                }}
                disabled={sending || !reply.trim()}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[8px] bg-[var(--primary)] text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        ) : showNew ? (
          <div>
            <button
              onClick={() => setShowNew(false)}
              className="mb-4 flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--text-dim)] hover:text-[var(--text)]"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <h2 className="mb-4 text-[16px] font-bold">New support request</h2>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="mb-2.5 h-9 w-full rounded-[8px] border border-[var(--border)] bg-[var(--bg)] px-3 text-[13px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
            />
            <textarea
              value={firstMessage}
              onChange={(e) => setFirstMessage(e.target.value)}
              placeholder="Describe the issue…"
              rows={6}
              className="mb-3 w-full resize-none rounded-[8px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-[13px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
            />
            <button
              onClick={async () => {
                if (!subject.trim() || !firstMessage.trim()) return;
                await createTicket(subject, firstMessage);
                setSubject("");
                setFirstMessage("");
                setShowNew(false);
              }}
              disabled={sending || !subject.trim() || !firstMessage.trim()}
              className="h-9 rounded-[8px] bg-[var(--primary)] px-4 text-[13px] font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h1 className="flex items-center gap-2 text-[22px] font-bold">
                  <LifeBuoy size={20} /> Support
                </h1>
                <p className="mt-1 text-[13px] text-[var(--text-dim)]">Get help from the CodePeeler team.</p>
              </div>
              <button
                onClick={() => setShowNew(true)}
                className="flex h-9 items-center gap-1.5 rounded-[8px] bg-[var(--primary)] px-3.5 text-[13px] font-semibold text-white hover:opacity-90"
              >
                <Plus size={15} /> New ticket
              </button>
            </div>

            {loading ? (
              <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">Loading…</div>
            ) : tickets.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-[var(--border)] py-14 text-center text-[13px] text-[var(--text-faint)]">
                No support tickets yet. Something not working right? Open one above.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {tickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => openTicket(t.id)}
                    className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--border)] px-4 py-3 text-left hover:border-[var(--primary)]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-semibold">{t.subject}</div>
                      <div className="text-[11.5px] text-[var(--text-faint)]">Updated {formatTimeAgo(t.updatedAt)}</div>
                    </div>
                    <span className={`flex-shrink-0 rounded-full px-2 py-[3px] text-[11px] font-semibold ${STATUS_COLOR[t.status]}`}>
                      {STATUS_LABEL[t.status] ?? t.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
