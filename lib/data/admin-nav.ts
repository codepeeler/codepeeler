import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Wrench,
  FolderKanban,
  Layers,
  Code2,
  Terminal,
  CreditCard,
  FileText,
  BookOpen,
  Search,
  BarChart3,
  MessageSquare,
  LifeBuoy,
  Bell,
  Megaphone,
  ShieldCheck,
  Settings,
  KeyRound,
  ClipboardList,
  Plug,
  Sparkles,
} from "lucide-react";

export type AdminNavLeaf = {
  label: string;
  href: string;
  /** true once a real page exists at `href` — false falls through to the coming-soon catch-all. */
  ready?: boolean;
};

export type AdminNavGroup = {
  section: string;
  icon: LucideIcon;
  items: AdminNavLeaf[];
};

// Mirrors the full feature list exactly — every item the plan calls for
// gets a nav entry now, even ones that render the "coming soon" screen
// until they're built (see app/admin/[...slug]/page.tsx). `ready: true`
// marks the ones with a real, working page behind them.
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    section: "Management",
    icon: FolderKanban,
    items: [
      { label: "Users", href: "/admin/users", ready: true },
      { label: "Tools", href: "/admin/tools", ready: true },
      { label: "Workspaces", href: "/admin/workspaces" },
      { label: "Collections", href: "/admin/collections" },
      { label: "Snippets", href: "/admin/snippets" },
      { label: "API Tester", href: "/admin/api-tester" },
    ],
  },
  {
    section: "Billing & Plans",
    icon: CreditCard,
    items: [
      { label: "Plans", href: "/admin/billing/plans" },
      { label: "Subscriptions", href: "/admin/billing/subscriptions" },
      { label: "Payments", href: "/admin/billing/payments" },
      { label: "Transactions", href: "/admin/billing/transactions" },
      { label: "Refunds", href: "/admin/billing/refunds", ready: true },
      { label: "Coupons", href: "/admin/billing/coupons", ready: true },
      { label: "Promo Codes", href: "/admin/billing/promo-codes" },
      { label: "Invoices", href: "/admin/billing/invoices" },
    ],
  },
  {
    section: "Blog CMS",
    icon: FileText,
    items: [
      { label: "Posts", href: "/admin/blog/posts" },
      { label: "Categories", href: "/admin/blog/categories" },
      { label: "Tags", href: "/admin/blog/tags" },
      { label: "Authors", href: "/admin/blog/authors" },
      { label: "Drafts", href: "/admin/blog/drafts" },
      { label: "Media Library", href: "/admin/blog/media" },
      { label: "Comments", href: "/admin/blog/comments" },
    ],
  },
  {
    section: "Documentation CMS",
    icon: BookOpen,
    items: [
      { label: "Documentation Pages", href: "/admin/docs/pages" },
      { label: "Categories", href: "/admin/docs/categories" },
      { label: "API Docs", href: "/admin/docs/api-docs" },
      { label: "Changelog", href: "/admin/docs/changelog" },
      { label: "Keyboard Shortcuts", href: "/admin/docs/shortcuts" },
    ],
  },
  {
    section: "SEO",
    icon: Search,
    items: [
      { label: "Meta Tags", href: "/admin/seo/meta-tags" },
      { label: "Sitemap", href: "/admin/seo/sitemap" },
      { label: "Robots.txt", href: "/admin/seo/robots" },
      { label: "Redirects", href: "/admin/seo/redirects" },
      { label: "Schema", href: "/admin/seo/schema" },
      { label: "Canonical URLs", href: "/admin/seo/canonical" },
      { label: "SEO Analytics", href: "/admin/seo/analytics" },
    ],
  },
  {
    section: "Analytics",
    icon: BarChart3,
    items: [
      { label: "User Analytics", href: "/admin/analytics/users" },
      { label: "Tool Analytics", href: "/admin/analytics/tools" },
      { label: "Traffic Analytics", href: "/admin/analytics/traffic" },
      { label: "Search Analytics", href: "/admin/analytics/search" },
      { label: "Revenue Analytics", href: "/admin/analytics/revenue" },
      { label: "Country Analytics", href: "/admin/analytics/country" },
      { label: "Device Analytics", href: "/admin/analytics/device" },
    ],
  },
  {
    section: "Feedback",
    icon: MessageSquare,
    items: [
      { label: "User Feedback", href: "/admin/feedback/user", ready: true },
      { label: "Feature Requests", href: "/admin/feedback/feature-requests", ready: true },
      { label: "Bug Reports", href: "/admin/feedback/bug-reports", ready: true },
      { label: "Ratings", href: "/admin/feedback/ratings", ready: true },
    ],
  },
  {
    section: "Support",
    icon: LifeBuoy,
    items: [
      { label: "Contact Messages", href: "/admin/support/contact-messages" },
      { label: "Support Tickets", href: "/admin/support/tickets", ready: true },
      { label: "FAQ Management", href: "/admin/support/faq" },
    ],
  },
  {
    section: "Notifications",
    icon: Bell,
    items: [
      { label: "Push Notifications", href: "/admin/notifications/push" },
      { label: "Email Notifications", href: "/admin/notifications/email" },
      { label: "Announcement Banner", href: "/admin/system/settings", ready: true },
    ],
  },
  {
    section: "Marketing",
    icon: Megaphone,
    items: [
      { label: "Newsletter", href: "/admin/marketing/newsletter" },
      { label: "Email Campaigns", href: "/admin/marketing/campaigns" },
      { label: "Referral Program", href: "/admin/marketing/referrals" },
      { label: "Promo Campaigns", href: "/admin/marketing/promo-campaigns" },
    ],
  },
  {
    section: "Security",
    icon: ShieldCheck,
    items: [
      { label: "Audit Logs", href: "/admin/security/audit-logs", ready: true },
      { label: "Admin Logs", href: "/admin/security/admin-logs", ready: true },
      { label: "Login History / Sessions", href: "/admin/security/sessions", ready: true },
      { label: "IP Management", href: "/admin/security/ip", ready: true },
      { label: "API Keys", href: "/admin/security/api-keys", ready: true },
      { label: "2FA Settings", href: "/admin/security/2fa" },
    ],
  },
  {
    section: "System",
    icon: Settings,
    items: [
      { label: "General Settings", href: "/admin/system/settings", ready: true },
      { label: "Maintenance Mode", href: "/admin/system/settings", ready: true },
      { label: "Feature Flags", href: "/admin/system/feature-flags", ready: true },
      { label: "Cache Management", href: "/admin/system/cache" },
      { label: "Queue Jobs", href: "/admin/system/queue-jobs" },
      { label: "Background Jobs", href: "/admin/system/background-jobs" },
      { label: "Database Status", href: "/admin/system/database" },
      { label: "Storage Management", href: "/admin/system/storage" },
      { label: "Backup & Restore", href: "/admin/system/backup" },
      { label: "Email Settings", href: "/admin/system/email" },
      { label: "OAuth Providers", href: "/admin/system/oauth" },
      { label: "Environment Variables", href: "/admin/system/env" },
    ],
  },
  {
    section: "Roles & Permissions",
    icon: KeyRound,
    items: [
      { label: "Roles", href: "/admin/roles/roles" },
      { label: "Permissions", href: "/admin/roles/permissions" },
      { label: "Admin Accounts", href: "/admin/roles/admin-accounts", ready: true },
    ],
  },
  {
    section: "Reports",
    icon: ClipboardList,
    items: [
      { label: "Daily Reports", href: "/admin/reports/daily" },
      { label: "Weekly Reports", href: "/admin/reports/weekly" },
      { label: "Monthly Reports", href: "/admin/reports/monthly" },
      { label: "Export Reports", href: "/admin/reports/export" },
    ],
  },
  {
    section: "Integrations",
    icon: Plug,
    items: [
      { label: "Webhooks", href: "/admin/integrations/webhooks" },
      { label: "Third-party Integrations", href: "/admin/integrations/third-party" },
      { label: "API Tokens", href: "/admin/integrations/api-tokens" },
    ],
  },
  {
    section: "AI (Future)",
    icon: Sparkles,
    items: [
      { label: "AI Models", href: "/admin/ai/models" },
      { label: "AI Usage", href: "/admin/ai/usage" },
      { label: "Prompt Library", href: "/admin/ai/prompt-library" },
      { label: "Token Usage", href: "/admin/ai/token-usage" },
    ],
  },
];

export const ADMIN_DASHBOARD_LEAF: AdminNavLeaf = { label: "Dashboard", href: "/admin", ready: true };

/** Looks up the nav label for the topbar title, given the current pathname. */
export function titleForAdminPath(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  for (const group of ADMIN_NAV) {
    const match = group.items.find((i) => pathname.startsWith(i.href));
    if (match) return match.label;
  }
  const last = pathname.split("/").filter(Boolean).pop() ?? "Admin";
  return last
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export { LayoutDashboard, Users, Wrench, Layers, Code2, Terminal };
