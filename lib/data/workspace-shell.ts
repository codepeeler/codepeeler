import {
  LayoutGrid,
  BarChart3,
  Grid2x2,
  Layers,
  Code2,
  Webhook,
  History,
  Star,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavKey =
  | "workspace"
  | "dashboard"
  | "alltools"
  | "collections"
  | "snippets"
  | "api"
  | "history"
  | "favorites"
  | "settings";

export const NAV_RAIL_ITEMS: {
  key: NavKey;
  label: string;
  href: string;
  icon: LucideIcon;
}[] = [
  { key: "workspace", label: "Workspace", href: "/workspace", icon: LayoutGrid },
  { key: "dashboard", label: "Dashboard", href: "/workspace/dashboard", icon: BarChart3 },
  { key: "alltools", label: "All Tools", href: "/tools", icon: Grid2x2 },
  { key: "collections", label: "Collections", href: "/collections", icon: Layers },
  { key: "snippets", label: "Snippets", href: "/snippets", icon: Code2 },
  { key: "api", label: "API Tester", href: "/api-tester", icon: Webhook },
  { key: "history", label: "History", href: "/workspace/history", icon: History },
  { key: "favorites", label: "Favorites", href: "/workspace/favorites", icon: Star },
  { key: "settings", label: "Settings", href: "/workspace/settings", icon: Settings },
];

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
