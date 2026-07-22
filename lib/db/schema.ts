import { pgTable, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("user"), // "user" | "admin" — gates /admin and /api/admin/*
  banned: boolean("banned").notNull().default(false),
  // 2-letter country code from Vercel's edge geolocation header
  // (x-vercel-ip-country) — see app/api/geo/route.ts. Only populates in
  // production on Vercel; stays null in local dev (no header there).
  country: text("country"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(), // Razorpay subscription id, e.g. sub_xxxxxxxxxxxx
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  planId: text("plan_id").notNull(), // Razorpay plan id, e.g. plan_xxxxxxxxxxxx
  billingCycle: text("billing_cycle").notNull(), // "monthly" | "yearly"
  // created -> authenticated -> active -> (cancelled | completed | halted | paused)
  status: text("status").notNull().default("created"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// One row per (user, metered-type). No cron job needed to reset counts —
// `periodKey` (e.g. "2026-07") is compared against the current period on every
// read/write; a mismatch means "new period", so the row is reset to 0 first.
// See lib/usage.ts for the read/increment logic — always go through those
// helpers, never write to this table directly.
export const usage = pgTable("usage", {
  id: text("id").primaryKey(), // `${userId}:${type}`
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // UsageType, e.g. "executions" | "ai-calls"
  count: integer("count").notNull().default(0),
  periodKey: text("period_key").notNull(), // "YYYY-MM", current billing/calendar month
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Real, per-user collections. The Collections *page* now reads/writes this
// table directly (see hooks/use-collections.ts) instead of the old
// lib/data/collections.ts demo array. `visibility` is a label the owner sets
// on their own collection, not a working cross-account ACL yet -- there's no
// sharing/membership table, so "Shared"/"Public" don't grant other users
// access. `tags` and `toolIds` are simple jsonb arrays (no join table) since
// they're small, owner-only lists with no need for relational queries.
export const collection = pgTable("collection", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  desc: text("desc").notNull().default(""),
  icon: text("icon").notNull().default("folder"), // key into COLLECTION_ICON_MAP, lib/data/collections.ts
  color: text("color").notNull().default("var(--primary)"), // CSS color/var string, used as-is
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  toolIds: jsonb("tool_ids").$type<string[]>().notNull().default([]),
  visibility: text("visibility").notNull().default("Private"), // "Private" | "Shared" | "Public" (label only)
  starred: boolean("starred").notNull().default(false),
  autoUpdate: boolean("auto_update").notNull().default(false),
  allowDuplicate: boolean("allow_duplicate").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Real, per-user workflows. `snapshot` holds the serialized canvas
// (WorkflowSnapshot: nodes/connections/variables) once the workspace builder
// is wired to save here instead of localStorage -- until then this table is
// populated only via the /api/workflows create/run routes (metadata +
// limit + execution tracking), snapshot stays null.
export const workflow = pgTable("workflow", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  collectionId: text("collection_id").references(() => collection.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  status: text("status").notNull().default("draft"), // "active" | "draft" | "paused"
  steps: integer("steps").notNull().default(0),
  snapshot: jsonb("snapshot"),
  lastRunAt: timestamp("last_run_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Community snippets — public code snippets any signed-in user can browse,
// create, and bookmark. `mine`/`bookmarked` in the UI's Snippet type are
// derived per-request (not stored) from userId/snippetBookmark, same
// pattern as how the admin panel derives isAdmin from session.user.role.
export const snippet = pgTable("snippet", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  desc: text("desc").notNull().default(""),
  language: text("language").notNull().default("JavaScript"),
  category: text("category").notNull().default("Utilities"),
  code: text("code").notNull().default(""),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  views: integer("views").notNull().default(0),
  uses: integer("uses").notNull().default(0),
  rating: integer("rating").notNull().default(0), // 0-5, not yet user-submittable — display only for now
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Per-user, per-tool usage counter — powers "Favorite Tools" on the user's
// own dashboard and the "Tools Used" breakdown in the admin user detail
// panel. Previously this only lived in the browser's localStorage
// (lib/tool-usage.ts), which meant it wasn't tied to the account, didn't
// survive a new device/browser, and admins couldn't see it. This table is
// the real, server-side counterpart — same increment-with-upsert shape as
// `usage` above, but keyed by tool instead of metered type, and not
// period-scoped (it's a running lifetime total, not a monthly cap).
export const toolUsage = pgTable("tool_usage", {
  id: text("id").primaryKey(), // `${userId}:${toolId}`
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  toolId: text("tool_id").notNull(), // matches Tool.id in lib/data/tools.ts
  count: integer("count").notNull().default(0),
  lastUsedAt: timestamp("last_used_at").notNull().defaultNow(),
});

// Per-user, per-tool pin — the user explicitly starred this tool via the
// pin control (dashboard + Favorites page). Distinct from `toolUsage` above
// (an automatic most-opened counter): a tool can be heavily used but never
// pinned, or pinned but rarely opened. Composite-unique on (userId, toolId),
// same shape as `snippetBookmark` below, so pin/unpin is a plain insert/delete.
export const toolFavorite = pgTable("tool_favorite", {
  id: text("id").primaryKey(), // `${userId}:${toolId}`
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  toolId: text("tool_id").notNull(), // matches Tool.id in lib/data/tools.ts
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Chronological "what did this user do" history — one row per meaningful
// action (tool opened, snippet created/viewed/used, collection
// created/updated, workflow created/run). This is the missing piece the
// other tables don't cover: `snippet`/`collection`/`workflow` only hold
// *current state*, not a timeline of events, and `usage`/`toolUsage` only
// hold running *totals*, not individual moments. Powers "Recent Activity"
// on the user's own dashboard and in the admin user detail panel.
// `entityName` is denormalized (copied at event time, not looked up live)
// so the timeline still reads correctly even if the snippet/collection/
// workflow it refers to is later renamed or deleted.
export const activityEvent = pgTable("activity_event", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // ActivityType, see lib/activity.ts
  entityId: text("entity_id"), // id of the tool/snippet/collection/workflow, if any
  entityName: text("entity_name"), // display name at the time of the event
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Per-user bookmark on a snippet. Composite-unique on (snippetId, userId) so
// toggling bookmark is a simple insert/delete, no boolean flag on `snippet`
// itself (which is shared across all viewers).
export const snippetBookmark = pgTable("snippet_bookmark", {
  id: text("id").primaryKey(),
  snippetId: text("snippet_id")
    .notNull()
    .references(() => snippet.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// One row per admin action — "who did what, to whom, when". Written
// alongside every admin mutation (grant/revoke Pro, ban, role change,
// email sent, usage reset) — never read from directly by app logic, purely
// for accountability. Surfaced in Admin → Security → Audit Logs.
export const adminAuditLog = pgTable("admin_audit_log", {
  id: text("id").primaryKey(),
  adminUserId: text("admin_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  targetUserId: text("target_user_id").references(() => user.id, { onDelete: "set null" }),
  action: text("action").notNull(), // e.g. "grant_pro", "revoke_pro", "ban", "unban", "promote_admin", "demote_admin", "reset_usage", "send_email"
  details: jsonb("details"), // free-form context, e.g. { duration: "3m" } or { subject: "..." }
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Single-row sitewide config table (id is always "site"). Read on every
// page load for the maintenance banner / announcement bar. Kept as one
// row instead of a key-value table since there are only ever these two
// switches right now — add columns here as more site-wide toggles show up.
export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default("site"),
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  maintenanceMessage: text("maintenance_message"),
  announcementEnabled: boolean("announcement_enabled").notNull().default(false),
  announcementMessage: text("announcement_message"),
  announcementLink: text("announcement_link"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Simple on/off switches for gradually rolling out new features without a
// deploy. `key` is whatever string the code checks (e.g. "new-snippets-ui");
// read via lib/feature-flags.ts, never query this table directly elsewhere.
export const featureFlag = pgTable("feature_flag", {
  key: text("key").primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  description: text("description"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Coupons extend the free trial rather than discounting price — applying a
// real % / flat-amount discount to a live Razorpay subscription needs a
// Razorpay "Offer" linked at subscription-create time (a further
// integration, not implemented here). This version is simpler and needs no
// Razorpay-side setup: redeeming a code just pushes back start_at at
// checkout (see app/api/subscription/create/route.ts).
export const coupon = pgTable("coupon", {
  code: text("code").primaryKey(), // stored uppercase, e.g. "LAUNCH30"
  description: text("description"),
  extraTrialDays: integer("extra_trial_days").notNull().default(0),
  maxRedemptions: integer("max_redemptions"), // null = unlimited
  timesRedeemed: integer("times_redeemed").notNull().default(0),
  active: boolean("active").notNull().default(true),
  expiresAt: timestamp("expires_at"), // null = never expires
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// One row per support ticket a user opens. `status` drives the admin queue:
// "open" = needs a first admin reply, "pending" = admin replied and it's
// back in the user's court, "closed" = resolved. A new user reply on a
// closed ticket flips it back to "open" (see the ticket-message route).
export const supportTicket = pgTable("support_ticket", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  status: text("status").notNull().default("open"), // "open" | "pending" | "closed"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Thread messages for a support_ticket, oldest first. senderRole is
// denormalized (rather than looked up via senderId -> user.role every time)
// since a user's role can't retroactively change who "spoke" in the past.
export const supportTicketMessage = pgTable("support_ticket_message", {
  id: text("id").primaryKey(),
  ticketId: text("ticket_id")
    .notNull()
    .references(() => supportTicket.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  senderRole: text("sender_role").notNull(), // "user" | "admin"
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Per-tool admin override on top of the static TOOLS list in
// lib/data/tools.ts. Row only exists once an admin changes a tool away
// from its default (enabled/not-featured/not-beta) — absence of a row
// means "all defaults", see lib/tool-overrides.ts. `id` is the tool's id
// from lib/data/tools.ts. Admin → Management → Tools.
export const toolOverride = pgTable("tool_override", {
  id: text("id").primaryKey(),
  enabled: boolean("enabled").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  beta: boolean("beta").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// A user's request to be refunded for a subscription charge. Tracked here
// instead of directly in Razorpay so support/ops has a queue with a status
// and an admin note, even before the "actually call Razorpay's refund
// API" step is wired up. Admin → Billing → Refunds.
export const refundRequest = pgTable("refund_request", {
  id: text("id").primaryKey(),
  subscriptionId: text("subscription_id").references(() => subscription.id, { onDelete: "set null" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amount: integer("amount"), // smallest currency unit (paise), null = "full amount" / unspecified
  reason: text("reason").notNull().default(""),
  status: text("status").notNull().default("pending"), // "pending" | "approved" | "rejected" | "processed"
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Unified table for Feedback → User Feedback / Feature Requests / Bug
// Reports / Ratings — one shape, `type` distinguishes the sidebar tabs
// instead of four near-identical tables. `rating` is only meaningful for
// type="rating" (1-5), null otherwise.
export const feedbackEntry = pgTable("feedback_entry", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  type: text("type").notNull().default("feedback"), // "feedback" | "feature_request" | "bug_report" | "rating"
  message: text("message").notNull().default(""),
  rating: integer("rating"),
  status: text("status").notNull().default("new"), // "new" | "reviewed" | "resolved" | "wont_fix"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Manual allow/block list for specific IPs — not enforced automatically
// anywhere yet (no middleware reads this table); it's a queue an admin
// curates now so the enforcement hook has a source of truth to read from
// whenever that gets wired in. Admin → Security → IP Management.
export const ipRule = pgTable("ip_rule", {
  id: text("id").primaryKey(),
  ip: text("ip").notNull().unique(),
  type: text("type").notNull().default("block"), // "block" | "allow"
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Admin-issued API tokens for external/programmatic access — separate from
// better-auth's own session/account tables since these are long-lived,
// admin-managed credentials rather than a login session. Only `keyPrefix`
// (first 8 chars) is stored for display; the full key is shown once at
// creation and never persisted, `keyHash` is what's checked on use.
export const apiKey = pgTable("api_key", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  keyHash: text("key_hash").notNull(),
  createdByUserId: text("created_by_user_id").references(() => user.id, { onDelete: "set null" }),
  lastUsedAt: timestamp("last_used_at"),
  revoked: boolean("revoked").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
