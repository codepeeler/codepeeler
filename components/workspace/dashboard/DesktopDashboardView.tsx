import Link from "next/link";
import { Layers, Workflow, Wrench, Zap, ChevronRight, Clock, Plus, Flame, Sparkles } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import CollectionsStatsBar from "@/components/collections/CollectionsStatsBar";
import CollectionIcon from "@/components/collections/CollectionIcon";
import Button from "@/components/ui/Button";
import ToolCard from "@/components/ui/ToolCard";
import StatCard from "@/components/workspace/dashboard/StatCard";
import PlanCard from "@/components/workspace/dashboard/PlanCard";
import RecentActivity from "@/components/workspace/dashboard/RecentActivity";
import VerifyEmailBanner from "@/components/auth/VerifyEmailBanner";
import { useDashboardData, QUICK_ACTIONS, STATUS_META } from "@/hooks/use-dashboard-data";

/**
 * Unchanged desktop layout (three-column: nav rail / content / quick-actions
 * aside) — only the data now comes from useDashboardData() instead of being
 * computed inline, so it can't drift from what MobileDashboardView shows.
 */
export default function DesktopDashboardView() {
  const {
    totalCollections,
    totalWorkflows,
    totalTools,
    totalExecutions,
    totalAiCalls,
    recentCollections,
    favoriteTools,
    isFavoriteTool,
    toggleFavoriteTool,
    recentTools,
    recentWorkflows,
    spotlightCollection,
    recentActivity,
  } = useDashboardData();

  return (
    <>
      <div className="relative flex min-h-0 flex-1">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] px-6 py-7">
            <VerifyEmailBanner />

            <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.01em]">
                  Dashboard
                </h1>
                <p className="mt-1 text-[13.5px] text-[var(--text-dim)]">
                  Welcome back 👋 — here&apos;s what&apos;s happening across your workspace today.
                </p>
              </div>
              <Button href="/workspace">
                <Plus size={14} /> New Workspace
              </Button>
            </div>

            <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard icon={Layers} label="Collections" value={totalCollections} color="var(--primary)" />
              <StatCard icon={Workflow} label="Total Workflows" value={totalWorkflows} color="var(--secondary)" />
              <StatCard icon={Wrench} label="Total Tools" value={totalTools} color="var(--success)" />
              <StatCard
                icon={Zap}
                label="Total Executions"
                value={totalExecutions.toLocaleString()}
                color="var(--warning)"
              />
              <StatCard
                icon={Sparkles}
                label="AI Assist Calls"
                value={totalAiCalls.toLocaleString()}
                color="var(--accent)"
              />
            </div>

            <div className="mb-7">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-display)] text-[16px] font-semibold">
                  Recent Collections
                </h2>
                <Link href="/collections" className="text-[12.5px] font-medium text-[var(--primary)] hover:underline">
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                {recentCollections.map((c) => (
                  <Link
                    key={c.id}
                    href="/collections"
                    className="flex items-center gap-3.5 rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-3.5 transition-all duration-150 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] hover:shadow-[var(--shadow-soft)]"
                  >
                    <CollectionIcon icon={c.icon} color={c.color} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[13.5px] font-semibold">{c.name}</span>
                      </div>
                      <div className="truncate text-[11.5px] text-[var(--text-faint)]">Updated {c.updatedAgo}</div>
                    </div>
                    <ChevronRight size={16} className="flex-shrink-0 text-[var(--text-faint)]" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="mb-7">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-display)] text-[16px] font-semibold">Favorite Tools</h2>
                <Link
                  href="/workspace/favorites"
                  className="text-[12.5px] font-medium text-[var(--primary)] hover:underline"
                >
                  View all →
                </Link>
              </div>
              {favoriteTools.length === 0 ? (
                <div className="rounded-[12px] border border-dashed border-[var(--border)] px-6 py-8 text-center">
                  <p className="text-[12.5px] text-[var(--text-faint)]">
                    No favorite tools yet — tap the star on any tool card to pin it here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {favoriteTools.map((t) => (
                    <ToolCard key={t.id} tool={t} isFavorite onToggleFavorite={(tool) => toggleFavoriteTool(tool.id)} />
                  ))}
                </div>
              )}
            </div>

            {recentTools.length > 0 && (
              <div className="mb-7">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-[family-name:var(--font-display)] text-[16px] font-semibold">Recent Tools</h2>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {recentTools.map((t) => (
                    <ToolCard
                      key={t.id}
                      tool={t}
                      isFavorite={isFavoriteTool(t.id)}
                      onToggleFavorite={(tool) => toggleFavoriteTool(tool.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-display)] text-[16px] font-semibold">
                  Recent Workflows
                </h2>
                <Link
                  href="/workspace/history"
                  className="text-[12.5px] font-medium text-[var(--primary)] hover:underline"
                >
                  View all →
                </Link>
              </div>
              <div className="overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--card)]">
                <table className="w-full border-collapse text-left text-[12.5px]">
                  <thead>
                    <tr className="border-b border-[var(--border-soft)] text-[10.5px] uppercase tracking-[0.05em] text-[var(--text-faint)]">
                      <th className="px-4 py-2.5 font-semibold">Workflow</th>
                      <th className="px-4 py-2.5 font-semibold">Status</th>
                      <th className="px-4 py-2.5 font-semibold">Steps</th>
                      <th className="hidden px-4 py-2.5 font-semibold sm:table-cell">Collection</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Last Run</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentWorkflows.map((wf) => (
                      <tr
                        key={wf.rowKey}
                        className="border-b border-[var(--border-soft)] last:border-b-0 hover:bg-[var(--card-hover)]"
                      >
                        <td className="px-4 py-3 font-medium">{wf.name}</td>
                        <td className="px-4 py-3">
                          <span
                            className="flex items-center gap-1.5 text-[11px] font-semibold"
                            style={{ color: STATUS_META[wf.status].color }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {STATUS_META[wf.status].label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-dim)]">{wf.steps}</td>
                        <td className="hidden px-4 py-3 text-[var(--text-dim)] sm:table-cell">{wf.collectionName}</td>
                        <td className="px-4 py-3 text-right text-[var(--text-faint)]">
                          <span className="inline-flex items-center gap-1">
                            <Clock size={11} /> {wf.lastRun}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        <aside className="z-[40] flex w-[260px] flex-shrink-0 flex-col overflow-y-auto border-l border-[var(--border-soft)] bg-[var(--bg-elev)] px-3.5 py-4">
          <h2 className="mb-2.5 px-1 font-[family-name:var(--font-display)] text-[15px] font-semibold">
            Quick Actions
          </h2>
          <div className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-1.5">
            {QUICK_ACTIONS.map(({ key, label, href, icon: Icon }) =>
              href ? (
                <Link
                  key={key}
                  href={href}
                  className="flex items-center gap-2.5 rounded-[9px] px-2.5 py-2.5 text-[12.5px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
                >
                  <Icon size={15} className="flex-shrink-0 text-[var(--text-faint)]" />
                  <span className="flex-1">{label}</span>
                  <ChevronRight size={14} className="flex-shrink-0 text-[var(--text-faint)]" />
                </Link>
              ) : (
                <div
                  key={key}
                  title="Coming soon"
                  className="flex cursor-not-allowed items-center gap-2.5 rounded-[9px] px-2.5 py-2.5 text-[12.5px] font-medium text-[var(--text-faint)] opacity-60"
                >
                  <Icon size={15} className="flex-shrink-0 text-[var(--text-faint)]" />
                  <span className="flex-1">{label}</span>
                  <span className="flex-shrink-0 rounded-[8px] border border-[var(--border)] px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-faint)]">
                    Soon
                  </span>
                </div>
              )
            )}
          </div>

          <div className="mt-4">
            <h2 className="mb-2.5 px-1 font-[family-name:var(--font-display)] text-[15px] font-semibold">
              Your Plan
            </h2>
            <PlanCard />
          </div>

          <div className="mt-4">
            <h2 className="mb-2.5 px-1 font-[family-name:var(--font-display)] text-[15px] font-semibold">
              Recent Activity
            </h2>
            <RecentActivity events={recentActivity} />
          </div>

          {spotlightCollection && (
            <div className="mt-4">
              <div className="mb-2.5 flex items-center justify-between px-1">
                <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">
                  Community Spotlight
                </h2>
                <Link href="/collections" className="text-[11.5px] font-medium text-[var(--primary)] hover:underline">
                  View all →
                </Link>
              </div>
              <div className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-[var(--warning)]">
                  <Flame size={13} /> Most used collection
                </div>
                <div className="mb-2.5 flex items-center gap-2.5">
                  <CollectionIcon icon={spotlightCollection.icon} color={spotlightCollection.color} size="sm" />
                  <span className="truncate text-[13px] font-semibold">{spotlightCollection.name}</span>
                </div>
                <p className="mb-3 line-clamp-2 text-[11.5px] leading-[1.5] text-[var(--text-faint)]">
                  {spotlightCollection.desc}
                </p>
                <div className="mb-3 flex items-center gap-4 text-[11px] text-[var(--text-dim)]">
                  <span className="flex items-center gap-1">
                    <Workflow size={12} className="text-[var(--text-faint)]" />
                    {spotlightCollection.workflowCount} workflows
                  </span>
                </div>
                <Link
                  href="/collections"
                  className="flex w-full items-center justify-center rounded-[9px] bg-[var(--primary)] py-2 text-[12px] font-semibold text-white transition-[filter] duration-150 hover:brightness-[1.08]"
                >
                  Browse Collections
                </Link>
              </div>
            </div>
          )}
        </aside>
      </div>

      <CollectionsStatsBar />
    </>
  );
}
