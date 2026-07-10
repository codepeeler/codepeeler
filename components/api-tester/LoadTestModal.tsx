"use client";

import { useMemo, useState } from "react";
import { Zap, Loader2, Square, Gauge, Timer, Activity } from "lucide-react";
import { Modal } from "@/components/api-tester/Modals";
import { useApiTester } from "@/providers/api-tester-provider";
import { defaultLoadTestConfig } from "@/lib/api-tester/engine";
import type { LoadTestConfig, LoadTestMode, LoadTestTargetType } from "@/lib/api-tester/types";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-3">
      <div className="mb-[5px] text-[11.5px] font-bold text-[var(--text-dim)]">{label}</div>
      {children}
      {hint && <div className="mt-1 text-[10.5px] leading-[1.5] text-[var(--text-faint)]">{hint}</div>}
    </div>
  );
}

function NumberInput({ value, onChange, min = 0, max, suffix }: { value: number; onChange: (n: number) => void; min?: number; max?: number; suffix?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px]"
      />
      {suffix && <span className="flex-shrink-0 text-[11px] text-[var(--text-faint)]">{suffix}</span>}
    </div>
  );
}

/** Small dependency-free latency-over-time chart, rendered as inline SVG — dots colored by pass/fail. */
function LatencyTimelineChart({ timeline }: { timeline: { t: number; durationMs: number; ok: boolean }[] }) {
  const W = 580, H = 140, PAD = 24;
  if (!timeline.length) return null;
  const maxT = Math.max(...timeline.map((s) => s.t), 1);
  const maxD = Math.max(...timeline.map((s) => s.durationMs), 1);
  const x = (t: number) => PAD + (t / maxT) * (W - PAD * 2);
  const y = (d: number) => H - PAD - (d / maxD) * (H - PAD * 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border-soft)" strokeWidth={1} />
      <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border-soft)" strokeWidth={1} />
      <text x={2} y={PAD + 4} fontSize={9} fill="var(--text-faint)">{Math.round(maxD)}ms</text>
      <text x={2} y={H - PAD} fontSize={9} fill="var(--text-faint)">0</text>
      <text x={W - PAD} y={H - 6} fontSize={9} fill="var(--text-faint)" textAnchor="end">{(maxT / 1000).toFixed(1)}s</text>
      {timeline.map((s, i) => (
        <circle key={i} cx={x(s.t)} cy={y(s.durationMs)} r={2.2} fill={s.ok ? "var(--success)" : "var(--danger)"} opacity={0.75} />
      ))}
    </svg>
  );
}

function StatBlock({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <div className="text-[19px] font-extrabold" style={accent ? { color: accent } : undefined}>{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-[var(--text-faint)]">{label}</div>
    </div>
  );
}

const MODES: { key: LoadTestMode; label: string; desc: string }[] = [
  { key: "burst", label: "Burst", desc: "Fire a fixed number of requests, then stop." },
  { key: "duration", label: "Sustained", desc: "Keep sending for a fixed amount of time." },
];

export function LoadTestModal({
  targetType,
  collectionId,
  onClose,
}: {
  targetType: LoadTestTargetType;
  collectionId?: string;
  onClose: () => void;
}) {
  const {
    activeTab, collections,
    loadTestRunning, loadTestResult, loadTestProgress,
    runLoadTestForActiveRequest, runLoadTestForCollection, cancelLoadTest, clearLoadTestResult,
  } = useApiTester();
  const [config, setConfig] = useState<LoadTestConfig>(() => defaultLoadTestConfig(targetType));
  const collection = collectionId ? collections.find((c) => c.id === collectionId) : undefined;
  const targetLabel = targetType === "collection" ? collection?.name || "collection" : activeTab?.name || "request";

  const setC = (patch: Partial<LoadTestConfig>) => setConfig((prev) => ({ ...prev, ...patch }));

  const run = () => {
    if (targetType === "collection" && collectionId) runLoadTestForCollection(collectionId, config);
    else runLoadTestForActiveRequest(config);
  };

  const progressPct = useMemo(() => {
    if (!loadTestProgress) return 0;
    if (config.mode === "burst") return Math.min(100, (loadTestProgress.completed / Math.max(1, config.totalRequests)) * 100);
    return Math.min(100, (loadTestProgress.elapsedMs / (config.durationSec * 1000)) * 100);
  }, [loadTestProgress, config]);

  return (
    <Modal title={`Load Test — ${targetLabel}`} onClose={onClose} width={680}>
      {!loadTestResult && !loadTestRunning && (
        <>
          <div className="mb-3 text-xs text-[var(--text-faint)]">
            {targetType === "collection"
              ? "Each virtual user runs through the whole collection, in order, repeatedly. Pre-request/test scripts and chain extractions are skipped by default — a load test measures raw throughput, not correctness."
              : "Concurrent workers hammer this single request. Pre-request/test scripts are skipped by default so timing reflects the endpoint, not script overhead."}
          </div>

          <Field label="Mode">
            <div className="flex gap-2">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setC({ mode: m.key })}
                  className="flex-1 rounded-lg border px-3 py-2 text-left"
                  style={{
                    borderColor: config.mode === m.key ? "var(--primary)" : "var(--border)",
                    background: config.mode === m.key ? "var(--primary-dim)" : "var(--card)",
                  }}
                >
                  <div className="text-[12.5px] font-bold" style={{ color: config.mode === m.key ? "var(--primary)" : "var(--text)" }}>{m.label}</div>
                  <div className="text-[10.5px] text-[var(--text-faint)]">{m.desc}</div>
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Concurrent workers" hint="How many requests run at the same time.">
              <NumberInput value={config.concurrency} min={1} max={200} onChange={(n) => setC({ concurrency: n })} />
            </Field>
            {config.mode === "burst" ? (
              <Field label="Total requests" hint="Stops once this many complete.">
                <NumberInput value={config.totalRequests} min={1} onChange={(n) => setC({ totalRequests: n })} />
              </Field>
            ) : (
              <Field label="Duration" hint="How long to keep sending.">
                <NumberInput value={config.durationSec} min={1} onChange={(n) => setC({ durationSec: n })} suffix="seconds" />
              </Field>
            )}
          </div>

          <Field label="Target RPS cap (optional)" hint="Caps the aggregate rate across all workers. Leave at 0 to go as fast as concurrency allows.">
            <NumberInput value={config.targetRps} min={0} onChange={(n) => setC({ targetRps: n })} suffix="req/s, 0 = unlimited" />
          </Field>

          <label className="mb-4 flex cursor-pointer items-start gap-2.5">
            <input type="checkbox" className="mt-0.5 h-3.5 w-3.5 accent-[var(--primary)]" checked={config.runScripts} onChange={(e) => setC({ runScripts: e.target.checked })} />
            <div>
              <div className="text-[12.5px] font-semibold">Run pre-request/test scripts and chain extractions</div>
              <div className="text-[11px] text-[var(--text-faint)]">Off by default. Turning this on lets scripts mutate shared variables under concurrency, which is a race condition by nature — only enable it if your scripts are read-only.</div>
            </div>
          </label>

          <button
            onClick={run}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,var(--primary),#7C4CF0)] py-2.5 text-[13px] font-bold text-white"
          >
            <Zap size={14} /> Start Load Test
          </button>
        </>
      )}

      {loadTestRunning && (
        <div>
          <div className="mb-3 flex items-center gap-2 text-[13px] font-bold">
            <Loader2 size={16} className="animate-spin text-[var(--primary)]" /> Running…
          </div>
          <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-elev)]">
            <div className="h-full rounded-full bg-[linear-gradient(135deg,var(--primary),#7C4CF0)] transition-[width]" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="mb-4 flex items-center gap-5 text-[12px] text-[var(--text-dim)]">
            <span>{loadTestProgress?.completed ?? 0} completed</span>
            <span>{loadTestProgress?.sent ?? 0} sent</span>
            <span>{((loadTestProgress?.elapsedMs ?? 0) / 1000).toFixed(1)}s elapsed</span>
          </div>
          <button onClick={cancelLoadTest} className="flex items-center gap-1.5 rounded-lg border border-[var(--danger)] bg-[var(--danger-dim)] px-3.5 py-2 text-xs font-semibold text-[var(--danger)]">
            <Square size={12} /> Cancel
          </button>
        </div>
      )}

      {loadTestResult && !loadTestRunning && (
        <div>
          {loadTestResult.aborted && (
            <div className="mb-3 rounded-lg bg-[var(--warning-dim)] px-3 py-2 text-[11.5px] font-semibold text-[var(--warning)]">Load test was cancelled early.</div>
          )}
          <div className="mb-3 grid grid-cols-2 gap-3 rounded-lg bg-[var(--bg-elev)] p-3 sm:grid-cols-4">
            <StatBlock label="Requests" value={String(loadTestResult.totalRequests)} />
            <StatBlock label="Success" value={String(loadTestResult.successCount)} accent="var(--success)" />
            <StatBlock label="Failed" value={String(loadTestResult.failCount)} accent={loadTestResult.failCount ? "var(--danger)" : undefined} />
            <StatBlock label="Achieved RPS" value={loadTestResult.achievedRps.toFixed(1)} />
          </div>
          <div className="mb-3 grid grid-cols-2 gap-3 rounded-lg bg-[var(--bg-elev)] p-3 sm:grid-cols-4">
            <StatBlock label="Avg latency" value={`${Math.round(loadTestResult.avgMs)}ms`} />
            <StatBlock label="p50" value={`${Math.round(loadTestResult.p50)}ms`} />
            <StatBlock label="p90" value={`${Math.round(loadTestResult.p90)}ms`} />
            <StatBlock label="p99" value={`${Math.round(loadTestResult.p99)}ms`} />
          </div>

          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-faint)]">
            <Activity size={12} /> Latency over time
          </div>
          <div className="mb-3 rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elev)] p-2">
            <LatencyTimelineChart timeline={loadTestResult.timeline} />
          </div>

          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-faint)]">
            <Gauge size={12} /> Status codes
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {Object.entries(loadTestResult.statusCounts).map(([code, count]) => (
              <span
                key={code}
                className="rounded-md px-2 py-1 font-[family-name:var(--font-mono)] text-[11px] font-bold"
                style={{
                  background: code.startsWith("2") ? "var(--success-dim)" : "var(--danger-dim)",
                  color: code.startsWith("2") ? "var(--success)" : "var(--danger)",
                }}
              >
                {code}: {count}
              </span>
            ))}
          </div>

          {loadTestResult.perRequest.length > 1 && (
            <>
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-faint)]">
                <Timer size={12} /> Per-request breakdown
              </div>
              <div className="mb-3 max-h-[180px] overflow-y-auto">
                {loadTestResult.perRequest.map((r) => (
                  <div key={r.itemId} className="mb-1 flex items-center gap-2.5 rounded-lg border border-[var(--border-soft)] px-2.5 py-2">
                    <span className="w-[34px] flex-shrink-0 font-[family-name:var(--font-mono)] text-[10px] font-extrabold" style={{ color: `var(--${r.method.toLowerCase()})` }}>{r.method}</span>
                    <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[12px]">{r.name}</span>
                    <span className="text-[11px] text-[var(--text-faint)]">{r.successCount}/{r.count} ok</span>
                    <span className="font-[family-name:var(--font-mono)] text-[11px] font-bold text-[var(--text-dim)]">p90 {Math.round(r.p90)}ms</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <button onClick={clearLoadTestResult} className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] py-2 text-xs font-semibold text-[var(--text-dim)]">
            Run again
          </button>
        </div>
      )}
    </Modal>
  );
}
