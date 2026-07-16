"use client";

import { useEffect, useState } from "react";
import {
  Rocket,
  Grid2x2,
  LayoutTemplate,
  Upload,
  Users,
  BookOpen,
  Braces,
  ShieldCheck,
  Globe2,
  Image as ImageIcon,
  Code2,
  Type,
  Package,
  type LucideIcon,
} from "lucide-react";
import { TOOLS } from "@/lib/data/tools";
import { formatTimeAgo } from "@/lib/utils";

// Same six tools already surfaced as favorites elsewhere on the site.
const FAVORITE_TOOL_IDS = ["json", "jwt", "base64", "regex", "hash", "url"];

// Distinct from the sidebar nav — these are one-off actions, not another
// copy of the same page links. Anything not shipped yet is marked
// "Coming soon" instead of being left out entirely.
export const QUICK_ACTIONS = [
  { key: "new-workspace", label: "Create New Workspace", icon: Rocket, href: "/workspace" },
  { key: "browse-tools", label: "Browse All Tools", icon: Grid2x2, href: "/tools" },
  { key: "templates", label: "Explore Templates", icon: LayoutTemplate, href: null },
  { key: "import-workflow", label: "Import Workflow", icon: Upload, href: null },
  { key: "community", label: "Join Community", icon: Users, href: null },
  { key: "docs", label: "View Documentation", icon: BookOpen, href: null },
] as const;

// Matches the status styling already used for workflows inside
// CollectionDetailsPanel, so a workflow's status looks identical everywhere.
export const STATUS_META: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "var(--success)" },
  draft: { label: "Draft", color: "var(--text-faint)" },
  paused: { label: "Paused", color: "var(--warning)" },
};

// The `collection` table has no icon/color columns yet (that's a Collections-
// page schema decision, not a dashboard one — see chat). Until those columns
// exist, each real collection is assigned a look deterministically from its
// position in this fixed palette, so the same collection always renders the
// same way instead of a random one on every load. Purely cosmetic — never
// used as a stand-in for data we don't have.
const COLLECTION_LOOKS: { icon: LucideIcon; color: string }[] = [
  { icon: Braces, color: "var(--cat-data)" },
  { icon: ShieldCheck, color: "var(--secondary)" },
  { icon: Globe2, color: "var(--cat-web)" },
  { icon: ImageIcon, color: "var(--cat-image)" },
  { icon: Code2, color: "var(--warning)" },
  { icon: Type, color: "var(--cat-text)" },
  { icon: Package, color: "var(--cat-sec)" },
  { icon: Rocket, color: "var(--primary)" },
];

type ApiCollection = { id: string; name: string; createdAt: string; updatedAt: string };
type ApiWorkflow = {
  id: string;
  collectionId: string | null;
  name: string;
  status: string;
  steps: number;
  lastRunAt: string | null;
  createdAt: string;
  updatedAt: string;
};
type ApiEntitlements = { usage: { executions: number; "ai-calls": number } };
type ApiToolUsage = { toolId: string; count: number; lastUsedAt: string };
type ApiActivityEvent = { id: string; type: string; entityId: string | null; entityName: string | null; createdAt: string };

/**
 * Single source of truth for every number/list shown on the dashboard.
 * DesktopDashboardView and MobileDashboardView each call this directly
 * (instead of one passing props down to the other) so the two layouts stay
 * independent while the underlying data can never drift apart.
 *
 * Pulls real per-user data from /api/collections, /api/workflows and
 * /api/entitlements (same pattern as useEntitlements()) instead of the old
 * static COLLECTIONS demo array. Returns empty/zeroed data while loading or
 * for a signed-out user — every consumer already null/empty-guards these
 * fields, so no separate loading UI is required, but `loading` is exposed
 * in case a caller wants one later.
 */
export function useDashboardData() {
  const [collections, setCollections] = useState<ApiCollection[]>([]);
  const [workflows, setWorkflows] = useState<ApiWorkflow[]>([]);
  const [executions, setExecutions] = useState(0);
  const [aiCalls, setAiCalls] = useState(0);
  const [aiCallsLimit, setAiCallsLimit] = useState(0);
  const [executionsLimit, setExecutionsLimit] = useState(0);
  const [toolUsage, setToolUsage] = useState<ApiToolUsage[]>([]);
  const [recentToolsUsage, setRecentToolsUsage] = useState<ApiToolUsage[]>([]);
  const [recentActivity, setRecentActivity] = useState<ApiActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [collectionsRes, workflowsRes, entitlementsRes, toolUsageRes, activityRes] = await Promise.all([
          fetch("/api/collections"),
          fetch("/api/workflows"),
          fetch("/api/entitlements"),
          fetch("/api/tools/usage"),
          fetch("/api/activity"),
        ]);

        const [collectionsData, workflowsData, entitlementsData, toolUsageData, activityData] = await Promise.all([
          collectionsRes.ok ? collectionsRes.json() : { collections: [] },
          workflowsRes.ok ? workflowsRes.json() : { workflows: [] },
          entitlementsRes.ok ? entitlementsRes.json() : null,
          toolUsageRes.ok ? toolUsageRes.json() : { tools: [], recent: [] },
          activityRes.ok ? activityRes.json() : { activity: [] },
        ]);

        if (cancelled) return;
        setCollections(collectionsData.collections ?? []);
        setWorkflows(workflowsData.workflows ?? []);
        setExecutions((entitlementsData as ApiEntitlements | null)?.usage?.executions ?? 0);
        setAiCalls((entitlementsData as any)?.usage?.["ai-calls"] ?? 0);
        setAiCallsLimit((entitlementsData as any)?.limits?.aiCallsPerMonth ?? 0);
        setExecutionsLimit((entitlementsData as any)?.limits?.executionsPerMonth ?? 0);
        setToolUsage(toolUsageData.tools ?? []);
        setRecentToolsUsage(toolUsageData.recent ?? []);
        setRecentActivity(activityData.activity ?? []);
      } catch {
        if (!cancelled) {
          setCollections([]);
          setWorkflows([]);
          setExecutions(0);
          setAiCalls(0);
          setAiCallsLimit(0);
          setExecutionsLimit(0);
          setToolUsage([]);
          setRecentToolsUsage([]);
          setRecentActivity([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const workflowCountByCollection = new Map<string, number>();
  for (const wf of workflows) {
    if (!wf.collectionId) continue;
    workflowCountByCollection.set(wf.collectionId, (workflowCountByCollection.get(wf.collectionId) ?? 0) + 1);
  }

  const decoratedCollections = [...collections]
    .sort((a, b) => a.name.localeCompare(b.name)) // stable order so each collection keeps the same look
    .map((c, i) => ({
      ...c,
      ...COLLECTION_LOOKS[i % COLLECTION_LOOKS.length],
      workflowCount: workflowCountByCollection.get(c.id) ?? 0,
      updatedAgo: formatTimeAgo(c.updatedAt),
    }));

  const recentCollections = [...decoratedCollections]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Real usage first — a user's actual most-opened tools (see
  // /api/tools/usage, backed by the tool_usage table). Brand new accounts
  // have no rows yet, so fall back to the same fixed starter list as
  // before rather than showing an empty section on day one.
  const usedTools = toolUsage
    .map((u) => TOOLS.find((t) => t.id === u.toolId))
    .filter((t): t is (typeof TOOLS)[number] => !!t);
  const favoriteTools = usedTools.length > 0 ? usedTools : FAVORITE_TOOL_IDS.map((id) => TOOLS.find((t) => t.id === id)).filter(
    (t): t is (typeof TOOLS)[number] => !!t
  );

  const recentTools = recentToolsUsage
    .map((u) => TOOLS.find((t) => t.id === u.toolId))
    .filter((t): t is (typeof TOOLS)[number] => !!t);

  const collectionNameById = new Map(collections.map((c) => [c.id, c.name]));

  const recentWorkflows = [...workflows]
    .sort((a, b) => {
      const aTime = new Date(a.lastRunAt ?? a.updatedAt).getTime();
      const bTime = new Date(b.lastRunAt ?? b.updatedAt).getTime();
      return bTime - aTime;
    })
    .slice(0, 7)
    .map((wf) => ({
      ...wf,
      rowKey: wf.id,
      collectionName: wf.collectionId ? (collectionNameById.get(wf.collectionId) ?? "Uncategorized") : "Uncategorized",
      lastRun: formatTimeAgo(wf.lastRunAt ?? wf.updatedAt),
    }));

  // "Most used collection" now ranks by real workflow count (the one real
  // usage signal we have per collection) instead of a fabricated executions
  // count — there's no per-collection execution tracking yet, only a
  // per-user total (see `executions` above). If that per-collection metric
  // gets added later, swap the sort key here.
  const spotlightSource = [...decoratedCollections].sort((a, b) => b.workflowCount - a.workflowCount)[0];
  const spotlightCollection = spotlightSource
    ? {
        ...spotlightSource,
        desc:
          spotlightSource.workflowCount === 1
            ? "1 workflow in this collection"
            : `${spotlightSource.workflowCount} workflows in this collection`,
      }
    : undefined;

  return {
    loading,
    totalCollections: collections.length,
    totalWorkflows: workflows.length,
    totalTools: TOOLS.length,
    totalExecutions: executions,
    executionsLimit,
    totalAiCalls: aiCalls,
    aiCallsLimit,
    recentCollections,
    favoriteTools,
    recentTools,
    recentWorkflows,
    spotlightCollection,
    recentActivity,
  };
}
