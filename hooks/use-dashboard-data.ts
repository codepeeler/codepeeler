"use client";

import { Rocket, Grid2x2, LayoutTemplate, Upload, Users, BookOpen } from "lucide-react";
import { COLLECTIONS } from "@/lib/data/collections";
import { TOOLS } from "@/lib/data/tools";
import { parseAgoToMinutes } from "@/lib/utils";

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

/**
 * Single source of truth for every number/list shown on the dashboard.
 * DesktopDashboardView and MobileDashboardView each call this directly
 * (instead of one passing props down to the other) so the two layouts stay
 * independent while the underlying data can never drift apart — the exact
 * same pattern CanvasArea uses to share workflow state with
 * MobileCanvasArea via useWorkflow(). Change what the dashboard shows once,
 * here, and both layouts pick it up automatically.
 */
export function useDashboardData() {
  const totalWorkflows = COLLECTIONS.reduce((sum, c) => sum + c.workflows, 0);
  const totalTools = COLLECTIONS.reduce((sum, c) => sum + c.tools, 0);
  const totalExecutions = COLLECTIONS.reduce((sum, c) => sum + c.executions, 0);

  const recentCollections = [...COLLECTIONS]
    .sort((a, b) => parseAgoToMinutes(a.updatedAgo) - parseAgoToMinutes(b.updatedAgo))
    .slice(0, 5);

  const favoriteTools = FAVORITE_TOOL_IDS.map((id) => TOOLS.find((t) => t.id === id)).filter(
    (t): t is (typeof TOOLS)[number] => !!t
  );

  const recentWorkflows = COLLECTIONS.flatMap((c) =>
    c.workflowsList.map((wf) => ({
      ...wf,
      rowKey: `${c.id}-${wf.id}`,
      collectionName: c.name,
      minutes: parseAgoToMinutes(wf.lastRun),
    }))
  )
    .sort((a, b) => a.minutes - b.minutes)
    .slice(0, 7);

  // "Most used collection" stands in for a community spotlight — this app
  // has no accounts or community backend, so we surface the real thing
  // that's closest to it instead of inventing a fake author/rating.
  const spotlightCollection = [...COLLECTIONS].sort((a, b) => b.executions - a.executions)[0];

  return {
    totalCollections: COLLECTIONS.length,
    totalWorkflows,
    totalTools,
    totalExecutions,
    recentCollections,
    favoriteTools,
    recentWorkflows,
    spotlightCollection,
  };
}
