import { pgTable, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("user"), // "user" | "admin" — gates /admin and /api/admin/*
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
