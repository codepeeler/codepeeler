-- Run this against your Neon DB (SQL editor in Neon console, or `psql $DATABASE_URL -f this-file.sql`).
-- Matches lib/db/schema.ts exactly. After running this once, /api/activity,
-- the dashboard's "Recent Activity" feed, and the admin panel's
-- "Recent activity" timeline will all work.
--
-- NOTE: this is separate from drizzle/manual-migration-tool-usage.sql — you
-- need both. If you haven't run that one yet, run it first (it creates
-- tool_usage, which this file doesn't touch).
--
-- If you'd rather use Drizzle's own migration flow instead of raw SQL:
--   npx drizzle-kit generate   (reads lib/db/schema.ts, writes a migration file)
--   npx drizzle-kit push       (applies it to DATABASE_URL)
-- Either path is fine — they produce the same table.

CREATE TABLE IF NOT EXISTS "activity_event" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "entity_id" text,
  "entity_name" text,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "activity_event_user_id_created_at_idx" ON "activity_event" ("user_id", "created_at" DESC);
