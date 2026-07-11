import {
  Home,
  LayoutGrid,
  BarChart3,
  Grid2x2,
  Layers,
  Code2,
  Webhook,
  Inbox,
  History,
  Star,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavKey =
  | "home"
  | "workspace"
  | "dashboard"
  | "alltools"
  | "collections"
  | "snippets"
  | "api"
  | "webhooks"
  | "history"
  | "favorites"
  | "settings";

export const NAV_RAIL_ITEMS: {
  key: NavKey;
  label: string;
  href: string;
  icon: LucideIcon;
}[] = [
  { key: "home", label: "Home", href: "/", icon: Home },
  { key: "workspace", label: "Workspace", href: "/workspace", icon: LayoutGrid },
  { key: "dashboard", label: "Dashboard", href: "/workspace/dashboard", icon: BarChart3 },
  { key: "alltools", label: "All Tools", href: "/tools", icon: Grid2x2 },
  { key: "collections", label: "Collections", href: "/collections", icon: Layers },
  { key: "snippets", label: "Snippets", href: "/snippets", icon: Code2 },
  { key: "api", label: "API Tester", href: "/api-tester", icon: Webhook },
  { key: "webhooks", label: "Webhook Inbox", href: "/webhooks", icon: Inbox },
  { key: "history", label: "History", href: "/workspace/history", icon: History },
  { key: "favorites", label: "Favorites", href: "/workspace/favorites", icon: Star },
  { key: "settings", label: "Settings", href: "/workspace/settings", icon: Settings },
];

/**
 * Curated subset of NAV_RAIL_ITEMS for the mobile bottom tab bar.
 * "home" leads (leftmost) so the mobile shell has an explicit way back to
 * the marketing/landing page — previously there was no bottom-tab route to
 * it at all. Native app convention usually caps this bar at 5 items, but
 * home is common and expected enough here to make it 6 rather than bump
 * one of the existing five out to Settings.
 */
export const MOBILE_TAB_ITEMS: {
  key: NavKey;
  label: string;
  href: string;
  icon: LucideIcon;
}[] = (["home", "workspace", "alltools", "api", "collections", "settings"] as NavKey[]).map(
  (key) => NAV_RAIL_ITEMS.find((item) => item.key === key)!
);

export const WORKSPACE_TABS = [
  { key: "workflow", label: "Workflow" },
  { key: "collections", label: "Collections" },
  { key: "snippets", label: "Snippets" },
  { key: "history", label: "History" },
  { key: "templates", label: "Templates" },
] as const;

export const BOTTOM_PANEL_TABS = [
  { key: "console", label: "Console" },
  { key: "logs", label: "Logs" },
  { key: "performance", label: "Performance" },
  { key: "results", label: "Results" },
  { key: "timeline", label: "History Timeline" },
  { key: "network", label: "Network" },
  { key: "errors", label: "Errors" },
  { key: "statistics", label: "Statistics" },
] as const;

export const PALETTE_CAT_CHIPS = [
  { key: "all", label: "All" },
  { key: "data", label: "Data" },
  { key: "encode", label: "Encode" },
  { key: "web", label: "Web" },
  { key: "image", label: "Image" },
  { key: "text", label: "Text" },
  { key: "security", label: "Security" },
  { key: "gen", label: "Gen" },
] as const;
