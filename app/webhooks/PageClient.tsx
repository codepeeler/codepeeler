"use client";

import { useMemo, useState } from "react";
import { Inbox, Plus, Copy, Trash2, RefreshCw, Radio, ExternalLink } from "lucide-react";
import { useWebhookInbox } from "@/providers/webhook-inbox-provider";
import { useToast } from "@/providers/toast-provider";
import { methodColorVar } from "@/lib/api-tester/engine";
import { inboxUrl, type CapturedRequest } from "@/lib/webhook-inbox/types";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const s = Math.max(0, Math.floor(diffMs / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function prettyBody(req: CapturedRequest): { text: string; isJson: boolean } {
  if (!req.body) return { text: "(empty body)", isJson: false };
  if (req.content_type?.includes("json")) {
    try {
      return { text: JSON.stringify(JSON.parse(req.body), null, 2), isJson: true };
    } catch {
      /* not actually valid JSON despite the header — fall through to raw */
    }
  }
  return { text: req.body, isJson: false };
}

function NotConfigured() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="max-w-[520px] rounded-xl border border-[var(--border-soft)] bg-[var(--card)] p-6">
        <div className="mb-2 flex items-center gap-2 text-[15px] font-bold">
          <Inbox size={17} className="text-[var(--primary)]" /> Webhook Inbox isn&apos;t configured yet
        </div>
        <p className="mb-3 text-[12.5px] leading-[1.6] text-[var(--text-dim)]">
          This feature captures incoming HTTP requests (from Stripe, GitHub, a cron job, anything) in real time using a free Supabase project.
        </p>
        <ol className="mb-3 list-decimal space-y-1.5 pl-5 text-[12.5px] leading-[1.6] text-[var(--text-dim)]">
          <li>
            Run <code className="rounded bg-[var(--bg-elev)] px-1 py-0.5 font-[family-name:var(--font-mono)] text-[11.5px]">supabase/schema.sql</code> once in your Supabase project&apos;s SQL editor.
          </li>
          <li>
            Add <code className="rounded bg-[var(--bg-elev)] px-1 py-0.5 font-[family-name:var(--font-mono)] text-[11.5px]">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
            <code className="rounded bg-[var(--bg-elev)] px-1 py-0.5 font-[family-name:var(--font-mono)] text-[11.5px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and{" "}
            <code className="rounded bg-[var(--bg-elev)] px-1 py-0.5 font-[family-name:var(--font-mono)] text-[11.5px]">SUPABASE_SERVICE_ROLE_KEY</code> to <code className="rounded bg-[var(--bg-elev)] px-1 py-0.5 font-[family-name:var(--font-mono)] text-[11.5px]">.env.local</code>.
          </li>
          <li>Restart the dev server.</li>
        </ol>
        <p className="text-[11.5px] text-[var(--text-faint)]">All three values are on your Supabase project&apos;s Settings → API page.</p>
      </div>
    </div>
  );
}

export default function WebhooksPage() {
  const {
    configured,
    inboxes,
    activeInbox,
    setActiveSlug,
    requests,
    loadingRequests,
    creating,
    error,
    createInbox,
    deleteInboxEverywhere,
    clearRequests,
  } = useWebhookInbox();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(() => requests.find((r) => r.id === selectedId) || requests[0] || null, [requests, selectedId]);

  const copyUrl = () => {
    if (!activeInbox) return;
    navigator.clipboard.writeText(inboxUrl(activeInbox.slug)).then(() => toast("Inbox URL copied"));
  };

  if (!configured) return <NotConfigured />;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Inbox list */}
      <div className="flex w-[240px] flex-shrink-0 flex-col border-r border-[var(--border-soft)]">
        <div className="flex items-center justify-between border-b border-[var(--border-soft)] p-3">
          <span className="text-[12.5px] font-bold uppercase tracking-wide text-[var(--text-faint)]">Inboxes</span>
          <button
            onClick={() => createInbox()}
            disabled={creating}
            title="New inbox"
            className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--primary-dim)] text-[var(--primary)] hover:brightness-[1.1] disabled:opacity-40"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-1.5">
          {inboxes.length === 0 && (
            <button
              onClick={() => createInbox()}
              disabled={creating}
              className="mt-2 flex w-full flex-col items-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] p-4 text-center text-[11.5px] text-[var(--text-faint)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              <Inbox size={18} />
              Create your first inbox
            </button>
          )}
          {inboxes.map((ib) => (
            <button
              key={ib.id}
              onClick={() => setActiveSlug(ib.slug)}
              className="mb-0.5 flex w-full flex-col items-start gap-0.5 rounded-lg px-2.5 py-2 text-left"
              style={{ background: activeInbox?.id === ib.id ? "var(--primary-dim)" : "transparent" }}
            >
              <span className="truncate text-[12.5px] font-semibold" style={{ color: activeInbox?.id === ib.id ? "var(--primary)" : "var(--text)" }}>
                {ib.name}
              </span>
              <span className="font-[family-name:var(--font-mono)] text-[10.5px] text-[var(--text-faint)]">/{ib.slug}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active inbox */}
      {!activeInbox ? (
        <div className="flex flex-1 items-center justify-center text-[13px] text-[var(--text-faint)]">Select or create an inbox to get started.</div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-soft)] p-3">
            <span className="flex items-center gap-1.5 rounded-md bg-[var(--success)]/15 px-2 py-1 text-[10.5px] font-bold text-[var(--success)]">
              <Radio size={11} className="animate-pulse" /> LIVE
            </span>
            <code className="min-w-0 flex-1 truncate rounded-md border border-[var(--border-soft)] bg-[var(--bg-elev)] px-2.5 py-1.5 font-[family-name:var(--font-mono)] text-[12px]">
              {activeInbox ? inboxUrl(activeInbox.slug) : ""}
            </code>
            <button onClick={copyUrl} className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-[11.5px] font-semibold text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)]">
              <Copy size={12} /> Copy
            </button>
            <button
              onClick={() => clearRequests(activeInbox.slug)}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-[11.5px] font-semibold text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)]"
            >
              <RefreshCw size={12} /> Clear
            </button>
            <button
              onClick={() => deleteInboxEverywhere(activeInbox.slug)}
              className="flex items-center gap-1.5 rounded-lg border border-[color-mix(in_srgb,var(--danger)_35%,var(--border))] bg-[var(--danger-dim)] px-2.5 py-1.5 text-[11.5px] font-semibold text-[var(--danger)] hover:brightness-[1.1]"
            >
              <Trash2 size={12} /> Delete inbox
            </button>
          </div>
          {error && <div className="mx-3 mt-2 rounded-lg bg-[var(--danger-dim)] px-3 py-2 text-[12px] text-[var(--danger)]">{error}</div>}

          <div className="flex flex-1 overflow-hidden">
            {/* Request list */}
            <div className="w-[300px] flex-shrink-0 overflow-y-auto border-r border-[var(--border-soft)]">
              {loadingRequests && <div className="p-3 text-[11.5px] text-[var(--text-faint)]">Loading…</div>}
              {!loadingRequests && requests.length === 0 && (
                <div className="p-4 text-[12px] leading-[1.6] text-[var(--text-faint)]">
                  Nothing yet. Send any HTTP request (GET/POST/PUT/PATCH/DELETE) to the URL above — it&apos;ll show up here instantly.
                </div>
              )}
              {requests.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className="flex w-full flex-col items-start gap-1 border-b border-[var(--border-soft)] px-3 py-2.5 text-left"
                  style={{ background: (selected?.id || requests[0]?.id) === r.id ? "var(--card-hover)" : "transparent" }}
                >
                  <div className="flex w-full items-center gap-2">
                    <span className="font-[family-name:var(--font-mono)] text-[11px] font-bold" style={{ color: methodColorVar(r.method) }}>
                      {r.method}
                    </span>
                    <span className="truncate font-[family-name:var(--font-mono)] text-[11.5px] text-[var(--text-dim)]">{r.path || "/"}</span>
                  </div>
                  <div className="flex w-full items-center justify-between text-[10.5px] text-[var(--text-faint)]">
                    <span>{timeAgo(r.received_at)}</span>
                    <span>{r.size_bytes}B</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Detail */}
            <div className="flex-1 overflow-y-auto p-4">
              {!selected ? (
                <div className="flex h-full items-center justify-center text-[12.5px] text-[var(--text-faint)]">Select a request to inspect it.</div>
              ) : (
                <RequestDetail request={selected} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RequestDetail({ request }: { request: CapturedRequest }) {
  const { toast } = useToast();
  const body = prettyBody(request);
  const headerEntries = Object.entries(request.headers || {});
  const queryEntries = Object.entries(request.query || {});

  const copyAsCurl = () => {
    const headerFlags = headerEntries
      .filter(([k]) => !["host", "content-length", "connection"].includes(k.toLowerCase()))
      .map(([k, v]) => `-H '${k}: ${v.replace(/'/g, "'\\''")}'`)
      .join(" \\\n  ");
    const bodyFlag = request.body ? ` \\\n  -d '${request.body.replace(/'/g, "'\\''")}'` : "";
    const curl = `curl -X ${request.method} '${window.location.origin}${request.path}' \\\n  ${headerFlags}${bodyFlag}`;
    navigator.clipboard.writeText(curl).then(() => toast("Copied as cURL"));
  };

  return (
    <div className="max-w-[720px]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-mono)] text-[13px] font-bold" style={{ color: methodColorVar(request.method) }}>
            {request.method}
          </span>
          <span className="font-[family-name:var(--font-mono)] text-[13px]">{request.path || "/"}</span>
        </div>
        <button onClick={copyAsCurl} className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-[11.5px] font-semibold text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)]">
          <ExternalLink size={12} /> Copy as cURL
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-[11.5px] text-[var(--text-faint)]">
        <span>{new Date(request.received_at).toLocaleString()}</span>
        <span>{request.size_bytes} bytes</span>
        {request.ip && <span>from {request.ip}</span>}
        {request.content_type && <span>{request.content_type}</span>}
      </div>

      {queryEntries.length > 0 && (
        <Section title={`Query params (${queryEntries.length})`}>
          <KVList entries={queryEntries} />
        </Section>
      )}

      <Section title={`Headers (${headerEntries.length})`}>
        <KVList entries={headerEntries} />
      </Section>

      <Section title="Body">
        <pre className={`overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elev)] p-3 font-[family-name:var(--font-mono)] text-[11.5px] ${body.isJson ? "" : ""}`}>
          {body.text}
        </pre>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-faint)]">{title}</div>
      {children}
    </div>
  );
}

function KVList({ entries }: { entries: [string, string][] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border-soft)]">
      {entries.map(([k, v], i) => (
        <div key={k} className={`flex gap-3 px-2.5 py-1.5 text-[11.5px] ${i % 2 === 1 ? "bg-[var(--bg-elev)]" : ""}`}>
          <span className="w-[160px] flex-shrink-0 truncate font-[family-name:var(--font-mono)] font-semibold text-[var(--text-dim)]">{k}</span>
          <span className="min-w-0 flex-1 break-words font-[family-name:var(--font-mono)] text-[var(--text)]">{v}</span>
        </div>
      ))}
    </div>
  );
}
