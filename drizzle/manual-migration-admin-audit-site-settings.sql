-- Run this against your Neon DB (SQL editor in Neon console, or `psql $DATABASE_URL -f this-file.sql`).
-- Matches lib/db/schema.ts exactly. Adds:
--   1. admin_audit_log  — who did what to whom, when (Admin → Security → Audit Logs)
--   2. site_settings    — single-row config for maintenance mode + announcement banner
--
-- If you'd rather use Drizzle's own migration flow instead of raw SQL:
--   npx drizzle-kit generate   (reads lib/db/schema.ts, writes a migration file)
--   npx drizzle-kit push       (applies it to DATABASE_URL)
-- Either path is fine — they produce the same tables.

CREATE TABLE IF NOT EXISTS "admin_audit_log" (
  "id" text PRIMARY KEY,
  "admin_user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "target_user_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "action" text NOT NULL,
  "details" jsonb,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "admin_audit_log_admin_user_id_idx" ON "admin_audit_log" ("admin_user_id");
CREATE INDEX IF NOT EXISTS "admin_audit_log_target_user_id_idx" ON "admin_audit_log" ("target_user_id");
CREATE INDEX IF NOT EXISTS "admin_audit_log_created_at_idx" ON "admin_audit_log" ("created_at");

CREATE TABLE IF NOT EXISTS "site_settings" (
  "id" text PRIMARY KEY DEFAULT 'site',
  "maintenance_mode" boolean NOT NULL DEFAULT false,
  "maintenance_message" text,
  "announcement_enabled" boolean NOT NULL DEFAULT false,
  "announcement_message" text,
  "announcement_link" text,
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Seed the single settings row so the app can always assume it exists
-- (avoids a null-check everywhere it's read).
INSERT INTO "site_settings" ("id") VALUES ('site') ON CONFLICT ("id") DO NOTHING;
