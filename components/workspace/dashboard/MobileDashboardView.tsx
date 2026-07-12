import Link from "next/link";
import { Layers, Workflow, Wrench, Zap, ChevronRight, Clock, Star, Plus, Sparkles, Check, Flame, Menu } from "lucide-react";
import MobileHeader from "@/components/layout/mobile/MobileHeader";
import MobileFooter from "@/components/layout/mobile/MobileFooter";
import Sidebar, { SIDEBAR_PANEL_ID } from "@/components/layout/Sidebar";
import CollectionIcon from "@/components/collections/CollectionIcon";
import Button from "@/components/ui/Button";
import ToolCard from "@/components/ui/ToolCard";
import StatCard from "@/components/workspace/dashboard/StatCard";
import { useDashboardData, QUICK_ACTIONS, STATUS_META } from "@/hooks/use-dashboard-data";
import { useMobileShell } from "@/providers/mobile-shell-provider";

/**
 * Purpose-built mobile layout: single scrolling column, no fixed-width
 * aside (that's what made the old shared markup break on phones), workflow
 * table replaced with stacked cards. Same useDashboardData() as desktop, so
 * the numbers/lists themselves are always identical — only the arrangement
 * differs.
 */
export default function MobileDashboardView() {
  const { togglePanel } = useMobileShell();
  const {
    totalCollections,
    totalWorkflows,
    totalTools,
    totalExecutions,
    recentCollections,
    favoriteTools,
    recentWorkflows,
    spotlightCollection,
  } = useDashboardData();

  return (
    <>
      <MobileHeader
        title="Dashboard"
        actions={[{ key: "menu", icon: Menu, label: "Menu", onClick: () => togglePanel(SIDEBAR_PANEL_ID) }]}
      />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <Sidebar />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="px-4 py-5">
            <div className="mb-5">
              <h1 className="font-[family-name:var(--font-display)] text-[20px] font-bold tracking-[-0.01em]">
                Dashboard
              </h1>
              <p className="mt-1 text-[12.5px] text-[var(--text-dim)]">
                Welcome back 👋 — here&apos;s what&apos;s happening in your workspace today.
              </p>
            </div>

            <Button href="/workspace" size="lg" className="mb-6 w-full justify-center">
              <Plus size={15} /> New Workspace
            </Button>

            <div className="mb-6 grid grid-cols-2 gap-3">
              <StatCard icon={Layers} label="Collections" value={totalCollections} color="var(--primary)" />
              <StatCard icon={Workflow} label="Total Workflows" value={totalWorkflows} color="var(--secondary)" />
              <StatCard icon={Wrench} label="Total Tools" value={totalTools} color="var(--success)" />
              <StatCard
                icon={Zap}
                label="Total Executions"
                value={totalExecutions.toLocaleString()}
                color="var(--warning)"
              />
            </div>

            <div className="mb-6">
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-display)] text-[14.5px] font-semibold">
                  Recent Collections
                </h2>
                <Link href="/collections" className="text-[12px] font-medium text-[var(--primary)]">
                  View all →
                </Link>
              </div>
              <div className="flex flex-col gap-2.5">
                {recentCollections.map((c) => (
                  <Link
                    key={c.id}
                    href="/collections"
                    className="flex items-center gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-3"
                  >
                    <CollectionIcon icon={c.icon} color={c.color} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-semibold">{c.name}</span>
                        {c.starred && (
                          <Star size={11} className="flex-shrink-0 fill-[var(--warning)] text-[var(--warning)]" />
                        )}
                      </div>
                      <div className="truncate text-[11px] text-[var(--text-faint)]">Updated {c.updatedAgo}</div>
                    </div>
                    <ChevronRight size={16} className="flex-shrink-0 text-[var(--text-faint)]" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-display)] text-[14.5px] font-semibold">
                  Favorite Tools
                </h2>
                <Link href="/workspace/favorites" className="text-[12px] font-medium text-[var(--primary)]">
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {favoriteTools.map((t) => (
                  <ToolCard key={t.id} tool={t} />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-display)] text-[14.5px] font-semibold">
                  Recent Workflows
                </h2>
                <Link href="/workspace/history" className="text-[12px] font-medium text-[var(--primary)]">
                  View all →
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                {recentWorkflows.map((wf) => (
                  <div
                    key={wf.rowKey}
                    className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-3"
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="truncate text-[12.5px] font-semibold">{wf.name}</span>
                      <span
                        className="flex flex-shrink-0 items-center gap-1 text-[10.5px] font-semibold"
                        style={{ color: STATUS_META[wf.status].color }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {STATUS_META[wf.status].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-[10.5px] text-[var(--text-faint)]">
                      <span className="truncate">{wf.collectionName}</span>
                      <span>·</span>
                      <span className="flex-shrink-0">{wf.steps} steps</span>
                      <span className="ml-auto flex flex-shrink-0 items-center gap-1">
                        <Clock size={10.5} /> {wf.lastRun}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="mb-2.5 font-[family-name:var(--font-display)] text-[14.5px] font-semibold">
                Quick Actions
              </h2>
              <div className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-1.5">
                {QUICK_ACTIONS.map(({ key, label, href, icon: Icon }) =>
                  href ? (
                    <Link
                      key={key}
                      href={href}
                      className="flex items-center gap-2.5 rounded-[9px] px-2.5 py-2.5 text-[12.5px] font-medium text-[var(--text-dim)]"
                    >
                      <Icon size={15} className="flex-shrink-0 text-[var(--text-faint)]" />
                      <span className="flex-1">{label}</span>
                      <ChevronRight size={14} className="flex-shrink-0 text-[var(--text-faint)]" />
                    </Link>
                  ) : (
                    <div
                      key={key}
                      className="flex items-center gap-2.5 rounded-[9px] px-2.5 py-2.5 text-[12.5px] font-medium text-[var(--text-faint)] opacity-60"
                    >
                      <Icon size={15} className="flex-shrink-0 text-[var(--text-faint)]" />
                      <span className="flex-1">{label}</span>
                      <span className="flex-shrink-0 rounded-full border border-[var(--border)] px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-faint)]">
                        Soon
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="mb-6 rounded-[12px] border border-[var(--border)] bg-[linear-gradient(160deg,var(--primary-dim),transparent)] p-4">
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] bg-[color-mix(in_srgb,var(--primary)_16%,transparent)] text-[var(--primary)]">
                  <Sparkles size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold">Free &amp; Local</div>
                  <div className="text-[11px] text-[var(--text-faint)]">No account needed</div>
                </div>
                <span className="flex-shrink-0 rounded-full bg-[color-mix(in_srgb,var(--success)_16%,transparent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--success)]">
                  Active
                </span>
              </div>
              <ul className="mb-3 space-y-1.5">
                {["Unlimited workflows", "All tools included", "100% local storage", "No sign-up required"].map(
                  (f) => (
                    <li key={f} className="flex items-center gap-2 text-[12px] text-[var(--text-dim)]">
                      <Check size={13} className="flex-shrink-0 text-[var(--success)]" />
                      {f}
                    </li>
                  )
                )}
              </ul>
              <Link
                href="/workspace/settings"
                className="flex w-full items-center justify-center rounded-[9px] border border-[var(--border)] bg-[var(--card)] py-2 text-[12px] font-semibold text-[var(--text)]"
              >
                View Settings
              </Link>
            </div>

            {spotlightCollection && (
              <div className="mb-2 rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--warning)]">
                    <Flame size={13} /> Most used collection
                  </span>
                  <Link href="/collections" className="text-[11.5px] font-medium text-[var(--primary)]">
                    View all →
                  </Link>
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
                    <Zap size={12} className="text-[var(--text-faint)]" />
                    {spotlightCollection.executions.toLocaleString()} runs
                  </span>
                  <span className="flex items-center gap-1">
                    <Workflow size={12} className="text-[var(--text-faint)]" />
                    {spotlightCollection.workflows} workflows
                  </span>
                </div>
                <Link
                  href="/collections"
                  className="flex w-full items-center justify-center rounded-[9px] bg-[var(--primary)] py-2 text-[12px] font-semibold text-white"
                >
                  Browse Collections
                </Link>
              </div>
            )}

            <MobileFooter variant="full" />
          </div>
        </main>
      </div>
    </>
  );
}
