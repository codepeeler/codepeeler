"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BOTTOM_PANEL_TABS } from "@/lib/data/workspace-shell";
import { useWorkflow } from "@/providers/workflow-provider";
import { NODE_TYPES, NODE_CAT_COLOR } from "@/lib/data/node-types";
import type { LogLevel } from "@/lib/types/workflow";
import Drawer from "@/components/layout/mobile/Drawer";

export const BOTTOM_PANEL_ID = "bottom-panel";

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

const LEVEL_FILTERS: { key: LogLevel | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "info", label: "Info" },
  { key: "success", label: "Success" },
  { key: "error", label: "Error" },
];

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="px-1 py-6 text-center text-[11px] leading-[1.6] text-[var(--text-faint)]">{children}</div>;
}

function BottomPanelContent() {
  const [activeTab, setActiveTab] = useState<string>("console");
  const [logFilter, setLogFilter] = useState<LogLevel | "all">("all");
  const {
    logs,
    clearLogs,
    bottomHeight,
    setBottomHeight,
    runHistory,
    networkLogs,
    clearNetworkLogs,
    nodes,
    conns,
    stickies,
    frames,
    variables,
  } = useWorkflow();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === "console" || activeTab === "logs")
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [logs, activeTab]);

  const lastRun = runHistory[runHistory.length - 1];
  const errorLogs = useMemo(() => logs.filter((l) => l.level === "error"), [logs]);
  const filteredLogs = useMemo(
    () => (logFilter === "all" ? logs : logs.filter((l) => l.level === logFilter)),
    [logs, logFilter]
  );

  const stats = useMemo(() => {
    const byStatus = { idle: 0, ok: 0, err: 0, busy: 0 };
    const byCat: Record<string, number> = {};
    nodes.forEach((n) => {
      byStatus[n.status] += 1;
      const cat = NODE_TYPES[n.type].cat;
      byCat[cat] = (byCat[cat] ?? 0) + 1;
    });
    const totalRuns = runHistory.length;
    const okRuns = runHistory.filter((r) => r.ok).length;
    const avgDuration = totalRuns
      ? Math.round(runHistory.reduce((sum, r) => sum + r.duration, 0) / totalRuns)
      : 0;
    return {
      byStatus,
      byCat,
      totalRuns,
      okRuns,
      successRate: totalRuns ? Math.round((okRuns / totalRuns) * 100) : null,
      avgDuration,
    };
  }, [nodes, runHistory]);

  return (
    <>
      <div className="flex items-center gap-0.5 overflow-x-auto border-b border-[var(--border-soft)] px-2 py-1.5">
        {BOTTOM_PANEL_TABS.map((tab) => {
          const badgeCount =
            tab.key === "console"
              ? logs.length
              : tab.key === "logs"
              ? logs.length
              : tab.key === "errors"
              ? errorLogs.length
              : tab.key === "network"
              ? networkLogs.length
              : tab.key === "timeline"
              ? runHistory.length
              : 0;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-[11.5px] font-semibold text-[var(--text-faint)] transition-colors duration-150 hover:text-[var(--text)]",
                activeTab === tab.key && "bg-[var(--card)] text-[var(--text)]"
              )}
            >
              {tab.label}
              {badgeCount > 0 && (
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-1.5 py-0.5 text-[9.5px]",
                    tab.key === "errors"
                      ? "bg-[color-mix(in_srgb,var(--danger)_18%,transparent)] text-[var(--danger)]"
                      : "bg-[var(--primary-dim)] text-[var(--primary)]"
                  )}
                >
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
        {(activeTab === "console" || activeTab === "logs") && logs.length > 0 && (
          <button
            onClick={clearLogs}
            title="Clear console"
            className="ml-auto flex flex-shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[var(--text-faint)] transition-colors duration-150 hover:text-[var(--danger)]"
          >
            <Trash2 size={12} /> Clear
          </button>
        )}
        {activeTab === "network" && networkLogs.length > 0 && (
          <button
            onClick={clearNetworkLogs}
            title="Clear network log"
            className="ml-auto flex flex-shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[var(--text-faint)] transition-colors duration-150 hover:text-[var(--danger)]"
          >
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>

      <div className="flex h-[calc(100%-42px)]">
        {activeTab === "console" && (
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 font-[family-name:var(--font-mono)] text-[11px] leading-[1.7]"
          >
            {logs.length === 0 ? (
              <div className="text-[var(--text-faint)]">Run a workflow to see console output here.</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-2.5">
                  <span className="flex-shrink-0 text-[var(--text-faint)]">{formatTime(log.time)}</span>
                  <span
                    className={cn(
                      "flex-shrink-0 font-semibold",
                      log.level === "success" && "text-[var(--success)]",
                      log.level === "error" && "text-[var(--danger)]",
                      log.level === "info" && "text-[var(--text-faint)]"
                    )}
                  >
                    {log.level === "success" ? "✓" : log.level === "error" ? "✕" : "›"}
                  </span>
                  <span className="text-[var(--text-dim)]">{log.message}</span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "logs" && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex flex-shrink-0 gap-1.5 border-b border-[var(--border-soft)] px-3 py-2">
              {LEVEL_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setLogFilter(f.key)}
                  className={cn(
                    "rounded-[8px] border border-[var(--border)] px-2.5 py-1 text-[10.5px] font-semibold text-[var(--text-faint)] transition-colors duration-150",
                    logFilter === f.key && "border-transparent bg-[var(--primary)] text-white"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-3 font-[family-name:var(--font-mono)] text-[11px] leading-[1.7]">
              {filteredLogs.length === 0 ? (
                <EmptyState>No log entries for this filter yet.</EmptyState>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="flex gap-2.5 border-b border-[var(--border-soft)]/60 py-1">
                    <span className="flex-shrink-0 text-[var(--text-faint)]">{formatTime(log.time)}</span>
                    <span
                      className={cn(
                        "flex-shrink-0 w-14 uppercase",
                        log.level === "success" && "text-[var(--success)]",
                        log.level === "error" && "text-[var(--danger)]",
                        log.level === "info" && "text-[var(--text-faint)]"
                      )}
                    >
                      {log.level}
                    </span>
                    <span className="text-[var(--text-dim)]">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "performance" && (
          <div className="flex-1 overflow-y-auto p-3 text-[11.5px]">
            {!lastRun ? (
              <EmptyState>Run the workflow to see per-node timing here.</EmptyState>
            ) : (
              <>
                <div className="mb-3 flex items-center gap-4 text-[11px] text-[var(--text-faint)]">
                  <span>
                    Last run: <b className="text-[var(--text)]">{lastRun.duration}ms</b>
                  </span>
                  <span>
                    Nodes run: <b className="text-[var(--text)]">{lastRun.nodeCount}</b>
                  </span>
                </div>
                <div className="space-y-1.5">
                  {lastRun.perf.map((p) => {
                    const maxMs = Math.max(1, ...lastRun.perf.map((x) => x.ms));
                    const pct = Math.max(4, Math.round((p.ms / maxMs) * 100));
                    return (
                      <div key={p.nodeId} className="flex items-center gap-2.5">
                        <span className="w-32 flex-shrink-0 truncate text-[10.5px] text-[var(--text-dim)]">
                          {NODE_TYPES[p.nodeType]?.label ?? p.nodeType}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--border-soft)]">
                          <div
                            style={{
                              width: `${pct}%`,
                              background: p.status === "err" ? "var(--danger)" : "var(--primary)",
                            }}
                            className="h-full rounded-full"
                          />
                        </div>
                        <span className="w-12 flex-shrink-0 text-right font-[family-name:var(--font-mono)] text-[10px] text-[var(--text-faint)]">
                          {p.ms}ms
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "results" && (
          <div className="flex-1 overflow-y-auto p-3">
            {!lastRun || lastRun.results.length === 0 ? (
              <EmptyState>Run the workflow to see each node&apos;s output here.</EmptyState>
            ) : (
              <div className="space-y-2">
                {lastRun.results.map((r) => (
                  <div key={r.nodeId} className="rounded-lg border border-[var(--border-soft)] p-2.5">
                    <div className="mb-1 text-[10.5px] font-semibold text-[var(--text-dim)]">
                      {NODE_TYPES[r.nodeType]?.label ?? r.nodeType}
                    </div>
                    <pre className="max-h-[90px] overflow-auto whitespace-pre-wrap break-words font-[family-name:var(--font-mono)] text-[10px] leading-[1.5] text-[var(--text-faint)]">
                      {r.output || "(empty)"}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="flex-1 overflow-y-auto p-3">
            {runHistory.length === 0 ? (
              <EmptyState>Every run of this workflow will show up here, most recent last.</EmptyState>
            ) : (
              <div className="space-y-1.5">
                {[...runHistory].reverse().map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 rounded-lg border border-[var(--border-soft)] px-3 py-2 text-[11px]"
                  >
                    <span
                      className={cn(
                        "h-[7px] w-[7px] flex-shrink-0 rounded-full",
                        r.ok ? "bg-[var(--success)]" : "bg-[var(--danger)]"
                      )}
                    />
                    <span className="flex-shrink-0 text-[var(--text-faint)]">{formatTime(r.startedAt)}</span>
                    <span className="flex-1 text-[var(--text-dim)]">
                      {r.nodeCount} node{r.nodeCount === 1 ? "" : "s"} · {r.ok ? "success" : "with errors"}
                    </span>
                    <span className="flex-shrink-0 font-[family-name:var(--font-mono)] text-[10px] text-[var(--text-faint)]">
                      {r.duration}ms
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "network" && (
          <div className="flex-1 overflow-y-auto p-3">
            {networkLogs.length === 0 ? (
              <EmptyState>
                No network requests yet. This fills in automatically whenever a node makes an HTTP
                request during a run.
              </EmptyState>
            ) : (
              <div className="space-y-1.5">
                {[...networkLogs].reverse().map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center gap-2.5 rounded-lg border border-[var(--border-soft)] px-3 py-2 text-[11px]"
                  >
                    <span
                      className={cn(
                        "flex-shrink-0 rounded px-1.5 py-0.5 text-[9.5px] font-bold",
                        n.ok
                          ? "bg-[var(--primary-dim)] text-[var(--primary)]"
                          : "bg-[color-mix(in_srgb,var(--danger)_18%,transparent)] text-[var(--danger)]"
                      )}
                    >
                      {n.method}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-[family-name:var(--font-mono)] text-[10.5px] text-[var(--text-dim)]">
                      {n.url}
                    </span>
                    <span className="flex-shrink-0 text-[10px] text-[var(--text-faint)]">
                      {n.status ?? n.error ?? "failed"}
                    </span>
                    <span className="flex-shrink-0 font-[family-name:var(--font-mono)] text-[10px] text-[var(--text-faint)]">
                      {n.duration}ms
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "errors" && (
          <div className="flex-1 overflow-y-auto p-3">
            {errorLogs.length === 0 ? (
              <EmptyState>No errors — nice. They&apos;ll show up here the moment a node fails.</EmptyState>
            ) : (
              <div className="space-y-1.5">
                {errorLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-lg border border-[var(--danger)]/25 bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-3 py-2 text-[11px]"
                  >
                    <div className="mb-0.5 text-[10px] text-[var(--text-faint)]">{formatTime(log.time)}</div>
                    <div className="text-[var(--danger)]">{log.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "statistics" && (
          <div className="flex-1 overflow-y-auto p-3">
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Nodes", value: nodes.length },
                { label: "Connections", value: conns.length },
                { label: "Sticky notes", value: stickies.length },
                { label: "Frames", value: frames.length },
                { label: "Variables", value: variables.length },
                { label: "Total runs", value: stats.totalRuns },
                {
                  label: "Success rate",
                  value: stats.successRate === null ? "—" : `${stats.successRate}%`,
                },
                { label: "Avg run time", value: stats.totalRuns ? `${stats.avgDuration}ms` : "—" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-[var(--border-soft)] p-2.5">
                  <div className="text-[16px] font-semibold">{s.value}</div>
                  <div className="text-[10px] text-[var(--text-faint)]">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-[var(--text-faint)]">
              Nodes by status
            </div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {(["idle", "ok", "err", "busy"] as const).map((s) => (
                <span
                  key={s}
                  className="rounded-[8px] border border-[var(--border)] px-2.5 py-1 text-[10.5px] capitalize text-[var(--text-dim)]"
                >
                  {s}: {stats.byStatus[s]}
                </span>
              ))}
            </div>

            <div className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-[var(--text-faint)]">
              Nodes by category
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(stats.byCat).length === 0 ? (
                <span className="text-[11px] text-[var(--text-faint)]">No nodes on the canvas yet.</span>
              ) : (
                Object.entries(stats.byCat).map(([cat, count]) => (
                  <span
                    key={cat}
                    style={{
                      color: NODE_CAT_COLOR[cat as keyof typeof NODE_CAT_COLOR],
                      borderColor: `color-mix(in srgb, ${NODE_CAT_COLOR[cat as keyof typeof NODE_CAT_COLOR]} 35%, transparent)`,
                      background: `color-mix(in srgb, ${NODE_CAT_COLOR[cat as keyof typeof NODE_CAT_COLOR]} 12%, transparent)`,
                    }}
                    className="rounded-[8px] border px-2.5 py-1 text-[10.5px] font-semibold capitalize"
                  >
                    {cat}: {count}
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        <div className="hidden w-[240px] flex-shrink-0 border-l border-[var(--border-soft)] lg:block" />
      </div>
    </>
  );
}

/**
 * Desktop: fixed-height resizable strip along the bottom of the canvas
 * (unchanged behavior). Mobile (<lg): rendered as a bottom-sheet Drawer,
 * opened via the console icon in the workspace MobileHeader or the
 * panel FAB, so it doesn't permanently eat vertical space on small screens.
 */
export default function BottomPanel() {
  const { bottomHeight, setBottomHeight } = useWorkflow();

  const onResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = bottomHeight;
    const onMove = (ev: PointerEvent) => setBottomHeight(startHeight - (ev.clientY - startY));
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <>
      <div
        style={{ height: bottomHeight }}
        className="relative hidden flex-shrink-0 border-t border-[var(--border-soft)] bg-[var(--bg-elev)] lg:block"
      >
        <div
          onPointerDown={onResizeStart}
          className="absolute left-0 top-[-3px] z-[35] h-1.5 w-full cursor-row-resize hover:bg-[var(--primary)]"
        />
        <BottomPanelContent />
      </div>
      <Drawer id={BOTTOM_PANEL_ID} title="Console" variant="bottom">
        <BottomPanelContent />
      </Drawer>
    </>
  );
}
