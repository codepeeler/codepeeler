"use client";

import { BarChart3, Workflow, Wrench, Zap, RefreshCw, Clock } from "lucide-react";
import NavRail from "@/components/workspace/NavRail";
import CollectionsStatsBar from "@/components/collections/CollectionsStatsBar";
import CollectionIcon from "@/components/collections/CollectionIcon";
import { WorkflowProvider } from "@/providers/workflow-provider";
import { COLLECTIONS } from "@/lib/data/collections";
import { TOOLS, CAT_META, type CatKey } from "@/lib/data/tools";
import { parseAgoToMinutes } from "@/lib/utils";

function StatCard({ icon: Icon, label, value }: { icon: typeof BarChart3; label: string; value: string | number }) {
  return (
    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-[9px] bg-[var(--primary-dim)] text-[var(--primary)]">
        <Icon size={16} />
      </div>
      <div className="text-[22px] font-bold leading-none">{value}</div>
      <div className="mt-1 text-[11.5px] text-[var(--text-faint)]">{label}</div>
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0;
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-[11.5px]">
        <span className="text-[var(--text-dim)]">{label}</span>
        <b className="text-[var(--text)]">{value}</b>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--border-soft)]">
        <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const totalWorkflows = COLLECTIONS.reduce((sum, c) => sum + c.workflows, 0);
  const totalTools = COLLECTIONS.reduce((sum, c) => sum + c.tools, 0);
  const totalExecutions = COLLECTIONS.reduce((sum, c) => sum + c.executions, 0);
  const autoUpdateOn = COLLECTIONS.filter((c) => c.autoUpdate).length;
  const autoUpdateOff = COLLECTIONS.length - autoUpdateOn;

  const topByExecutions = [...COLLECTIONS].sort((a, b) => b.executions - a.executions).slice(0, 5);
  const maxExecutions = Math.max(...topByExecutions.map((c) => c.executions), 1);

  const catKeys = Object.keys(CAT_META) as CatKey[];
  const toolsByCat = catKeys.map((key) => ({
    key,
    label: CAT_META[key].label,
    color: CAT_META[key].color,
    count: TOOLS.filter((t) => t.cat === key).length,
  }));
  const maxCatCount = Math.max(...toolsByCat.map((c) => c.count), 1);

  const recentActivity = COLLECTIONS.flatMap((c) =>
    c.activity.map((a) => ({ ...a, collectionName: c.name, icon: c.icon, color: c.color, minutes: parseAgoToMinutes(a.time) }))
  )
    .sort((a, b) => a.minutes - b.minutes)
    .slice(0, 8);

  return (
    <WorkflowProvider>
      <div className="relative flex min-h-0 flex-1">
        <NavRail />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] px-6 py-7">
            <div className="mb-7">
              <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.01em]">
                Dashboard
              </h1>
              <p className="mt-1 text-[13.5px] text-[var(--text-dim)]">
                An overview of activity across all your collections
              </p>
            </div>

            <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard icon={BarChart3} label="Collections" value={COLLECTIONS.length} />
              <StatCard icon={Workflow} label="Total Workflows" value={totalWorkflows} />
              <StatCard icon={Wrench} label="Total Tools" value={totalTools} />
              <StatCard icon={Zap} label="Total Executions" value={totalExecutions} />
            </div>

            <div className="mb-7 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4">
                <h2 className="mb-3 text-[13px] font-semibold">Executions by Collection</h2>
                {topByExecutions.map((c) => (
                  <Bar key={c.id} label={c.name} value={c.executions} max={maxExecutions} color={c.color} />
                ))}
              </div>

              <div className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4">
                <h2 className="mb-3 text-[13px] font-semibold">Tools by Category</h2>
                {toolsByCat.map((c) => (
                  <Bar key={c.key} label={c.label} value={c.count} max={maxCatCount} color={c.color} />
                ))}
              </div>
            </div>

            <div className="mb-7 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4">
                <h2 className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold">
                  <RefreshCw size={13} className="text-[var(--success)]" /> Auto-Update Status
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex-1 rounded-[10px] border border-[var(--border-soft)] p-3 text-center">
                    <div className="text-[20px] font-bold text-[var(--success)]">{autoUpdateOn}</div>
                    <div className="text-[10.5px] text-[var(--text-faint)]">Auto-Update On</div>
                  </div>
                  <div className="flex-1 rounded-[10px] border border-[var(--border-soft)] p-3 text-center">
                    <div className="text-[20px] font-bold text-[var(--text-faint)]">{autoUpdateOff}</div>
                    <div className="text-[10.5px] text-[var(--text-faint)]">Auto-Update Off</div>
                  </div>
                </div>
              </div>

              <div className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4">
                <h2 className="mb-3 text-[13px] font-semibold">Recent Activity</h2>
                <div className="space-y-2.5">
                  {recentActivity.map((a) => (
                    <div key={`${a.collectionName}-${a.id}`} className="flex items-center gap-2.5">
                      <CollectionIcon icon={a.icon} color={a.color} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12px] text-[var(--text-dim)]">{a.text}</div>
                        <div className="flex items-center gap-1 text-[10.5px] text-[var(--text-faint)]">
                          <span className="font-medium">{a.collectionName}</span>
                          <span>·</span>
                          <Clock size={10} /> {a.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <CollectionsStatsBar />
    </WorkflowProvider>
  );
}
