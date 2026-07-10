"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Info, Plug, Trash2, Unplug } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApiTester } from "@/providers/api-tester-provider";
import type { StreamMessage, StreamStatus } from "@/lib/api-tester/types";

function StatusBadge({ status }: { status: StreamStatus }) {
  const map: Record<StreamStatus, { label: string; color: string }> = {
    idle: { label: "Not connected", color: "var(--text-faint)" },
    connecting: { label: "Connecting…", color: "var(--warning)" },
    open: { label: "Connected", color: "var(--success)" },
    closed: { label: "Closed", color: "var(--text-faint)" },
    error: { label: "Error", color: "var(--danger)" },
  };
  const { label, color } = map[status];
  return (
    <span className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: status === "open" ? `0 0 0 3px ${color}33` : "none" }} />
      {label}
    </span>
  );
}

function MessageRow({ msg }: { msg: StreamMessage }) {
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour12: false });
  if (msg.direction === "system") {
    return <div className="px-3.5 py-1 text-center text-[11px] italic text-[var(--text-faint)]">— {msg.data} · {time} —</div>;
  }
  const isSent = msg.direction === "sent";
  return (
    <div className={cn("flex px-3.5 py-1", isSent ? "justify-end" : "justify-start")}>
      <div
        className="max-w-[80%] rounded-xl px-3 py-2"
        style={{
          background: isSent ? "var(--primary-dim)" : "var(--bg-elev)",
          borderTopRightRadius: isSent ? 4 : undefined,
          borderTopLeftRadius: !isSent ? 4 : undefined,
        }}
      >
        <div className="mb-0.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--text-faint)]">
          {isSent ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
          {isSent ? "Sent" : "Received"}
          {msg.event && msg.event !== "message" && <span className="rounded bg-[var(--secondary-dim)] px-1 text-[var(--secondary)]">{msg.event}</span>}
          <span className="ml-auto font-normal normal-case">{time}</span>
        </div>
        <pre className="whitespace-pre-wrap break-all font-[family-name:var(--font-mono)] text-[12.5px] leading-[1.5] text-[var(--text)]">{msg.data}</pre>
      </div>
    </div>
  );
}

export default function StreamPanel() {
  const { activeTab, connectWebSocket, disconnectWebSocket, sendWsMessage, connectSSE, disconnectSSE, clearStreamLog } = useApiTester();
  const [draft, setDraft] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [activeTab?.streamMessages.length]);

  if (!activeTab) return null;
  const isWs = activeTab.request.protocol === "websocket";
  const status = activeTab.streamStatus;
  const connected = status === "open";
  const busy = status === "connecting";

  const connect = () => (isWs ? connectWebSocket() : connectSSE());
  const disconnect = () => (isWs ? disconnectWebSocket() : disconnectSSE());

  const send = () => {
    if (!draft.trim()) return;
    sendWsMessage(draft);
    setDraft("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-[var(--border-soft)] px-3.5 py-2.5">
        <StatusBadge status={status} />
        <span className="text-[11px] text-[var(--text-faint)]">{activeTab.streamMessages.filter((m) => m.direction !== "system").length} messages</span>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={clearStreamLog} className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-dim)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]" title="Clear log">
            <Trash2 size={13} />
          </button>
          {connected || busy ? (
            <button onClick={disconnect} className="flex items-center gap-1.5 rounded-lg bg-[var(--danger-dim)] px-3 py-1.5 text-[12px] font-bold text-[var(--danger)]">
              <Unplug size={13} /> {isWs ? "Disconnect" : "Stop"}
            </button>
          ) : (
            <button onClick={connect} className="flex items-center gap-1.5 rounded-lg bg-[linear-gradient(135deg,var(--primary),#7C4CF0)] px-3 py-1.5 text-[12px] font-bold text-white">
              <Plug size={13} /> {isWs ? "Connect" : "Start"}
            </button>
          )}
        </div>
      </div>

      {!isWs && (
        <div className="flex items-start gap-1.5 border-b border-[var(--border-soft)] bg-[var(--bg-elev)] px-3.5 py-2 text-[11px] leading-[1.5] text-[var(--text-faint)]">
          <Info size={12} className="mt-0.5 flex-shrink-0" />
          Read via a manual fetch stream (not the native EventSource API) so your custom headers actually get sent — same CORS rules as a regular request apply.
        </div>
      )}
      {isWs && (
        <div className="flex items-start gap-1.5 border-b border-[var(--border-soft)] bg-[var(--bg-elev)] px-3.5 py-2 text-[11px] leading-[1.5] text-[var(--text-faint)]">
          <Info size={12} className="mt-0.5 flex-shrink-0" />
          Browsers don&apos;t allow custom headers on WebSocket connections — auth typically goes in the URL (a token query param) or as a subprotocol.
        </div>
      )}

      <div ref={logRef} className="min-h-0 flex-1 overflow-y-auto py-2">
        {activeTab.streamMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[12.5px] text-[var(--text-faint)]">
            {isWs ? "Connect, then send a message below." : "Start the stream to see incoming events here."}
          </div>
        ) : (
          activeTab.streamMessages.map((m) => <MessageRow key={m.id} msg={m} />)
        )}
      </div>

      {isWs && (
        <div className="flex flex-shrink-0 items-center gap-2 border-t border-[var(--border-soft)] p-2.5">
          <textarea
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={connected ? "Type a message… (Enter to send)" : "Connect first to send a message"}
            disabled={!connected}
            className="flex-1 resize-none rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-2 font-[family-name:var(--font-mono)] text-[12.5px] outline-none focus:border-[var(--primary)] disabled:opacity-50"
          />
          <button
            onClick={send}
            disabled={!connected || !draft.trim()}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-[linear-gradient(135deg,var(--primary),#7C4CF0)] px-3.5 text-[12.5px] font-bold text-white disabled:opacity-40"
          >
            <ArrowUp size={13} /> Send
          </button>
        </div>
      )}
    </div>
  );
}
