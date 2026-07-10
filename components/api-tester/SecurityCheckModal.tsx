"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Modal } from "@/components/api-tester/Modals";

interface TlsInfo {
  protocol: string | null;
  cipher: string | null;
  subject: string | null;
  issuer: string | null;
  validFrom: string | null;
  validTo: string | null;
  daysUntilExpiry: number | null;
  authorized: boolean;
  authorizationError: string | null;
}

interface HeaderFinding {
  key: string;
  label: string;
  why: string;
  present: boolean;
  value: string | null;
}

interface CheckResult {
  url: string;
  isHttps: boolean;
  tls: TlsInfo | null;
  status: number | null;
  fetchError: string | null;
  headerFindings: HeaderFinding[];
  grade: "A" | "B" | "C" | "D" | "F";
}

const GRADE_COLOR: Record<CheckResult["grade"], string> = {
  A: "var(--success)",
  B: "var(--success)",
  C: "var(--warning)",
  D: "var(--warning)",
  F: "var(--danger)",
};

export function SecurityCheckModal({ url, onClose }: { url: string; onClose: () => void }) {
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/security-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) throw new Error(data.error || `Check failed (${res.status})`);
      setResult(data as CheckResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Security Health Check" onClose={onClose} width={560}>
      <div className="mb-3.5 truncate rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elev)] px-2.5 py-1.5 font-[family-name:var(--font-mono)] text-[12px] text-[var(--text-dim)]">{url}</div>

      {!result && (
        <button
          onClick={run}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-[linear-gradient(135deg,var(--primary),#7C4CF0)] px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-40"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
          {loading ? "Checking…" : "Run check"}
        </button>
      )}

      {error && <div className="mt-3 rounded-lg bg-[var(--danger-dim)] px-3 py-2 text-[12px] text-[var(--danger)]">{error}</div>}

      {result && (
        <div>
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-[var(--border-soft)] p-3">
            <div
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-[17px] font-extrabold text-white"
              style={{ background: GRADE_COLOR[result.grade] }}
            >
              {result.grade}
            </div>
            <div className="min-w-0 flex-1 text-[11.5px] leading-[1.5] text-[var(--text-faint)]">
              Quick heuristic score based on TLS + presence of common security headers — not a substitute for a full audit.
            </div>
            <button onClick={run} disabled={loading} className="flex-shrink-0 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-dim)] disabled:opacity-40">
              {loading ? <Loader2 size={12} className="animate-spin" /> : "Re-run"}
            </button>
          </div>

          {result.isHttps && result.tls && (
            <Section title="TLS Certificate">
              {!result.tls.authorized && (
                <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-[var(--danger-dim)] px-2.5 py-1.5 text-[11.5px] text-[var(--danger)]">
                  <ShieldAlert size={13} /> Not trusted: {result.tls.authorizationError}
                </div>
              )}
              <KV label="Protocol" value={result.tls.protocol || "unknown"} />
              <KV label="Cipher" value={result.tls.cipher || "unknown"} />
              <KV label="Issuer" value={result.tls.issuer || "unknown"} />
              <KV label="Subject (CN)" value={result.tls.subject || "unknown"} />
              {result.tls.daysUntilExpiry != null && (
                <KV
                  label="Expires"
                  value={`${result.tls.validTo ? new Date(result.tls.validTo).toLocaleDateString() : "?"} (${result.tls.daysUntilExpiry >= 0 ? `${result.tls.daysUntilExpiry} days left` : `expired ${-result.tls.daysUntilExpiry} days ago`})`}
                  danger={result.tls.daysUntilExpiry < 14}
                />
              )}
            </Section>
          )}
          {!result.isHttps && (
            <div className="mb-4 flex items-center gap-1.5 rounded-lg bg-[var(--warning-dim)] px-2.5 py-1.5 text-[11.5px] text-[var(--warning)]">
              <ShieldAlert size={13} /> Plain HTTP — no TLS to inspect. Traffic to this endpoint isn&apos;t encrypted.
            </div>
          )}

          <Section title={`Security Headers${result.status != null ? ` (response: ${result.status})` : ""}`}>
            {result.fetchError && <div className="mb-2 text-[11.5px] text-[var(--danger)]">Couldn&apos;t fetch headers: {result.fetchError}</div>}
            <div className="space-y-1.5">
              {result.headerFindings.map((h) => (
                <div key={h.key} className="rounded-lg border border-[var(--border-soft)] px-2.5 py-1.5">
                  <div className="flex items-center gap-1.5">
                    {h.present ? <CheckCircle2 size={13} className="flex-shrink-0 text-[var(--success)]" /> : <XCircle size={13} className="flex-shrink-0 text-[var(--danger)]" />}
                    <span className="text-[12px] font-semibold">{h.label}</span>
                  </div>
                  {h.present ? (
                    <div className="mt-0.5 truncate pl-[19px] font-[family-name:var(--font-mono)] text-[10.5px] text-[var(--text-faint)]">{h.value}</div>
                  ) : (
                    <div className="mt-0.5 pl-[19px] text-[10.5px] leading-[1.5] text-[var(--text-faint)]">Missing — {h.why}</div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}
    </Modal>
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

function KV({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex gap-3 border-b border-[var(--border-soft)] py-1 text-[11.5px] last:border-0">
      <span className="w-[100px] flex-shrink-0 text-[var(--text-faint)]">{label}</span>
      <span className="min-w-0 flex-1 break-words" style={{ color: danger ? "var(--danger)" : "var(--text)" }}>{value}</span>
    </div>
  );
}
