-- Run this against your Neon DB (SQL editor in Neon console, or `psql $DATABASE_URL -f this-file.sql`).
-- Matches lib/db/schema.ts exactly. After running this once, the `tool_usage`
-- table will exist and /api/tools/track, /api/tools/usage, the dashboard's
-- real "Favorite Tools", and the admin "Tools used" panel will all work.
--
-- If you'd rather use Drizzle's own migration flow instead of raw SQL:
--   npx drizzle-kit generate   (reads lib/db/schema.ts, writes a migration file)
--   npx drizzle-kit push       (applies it to DATABASE_URL)
-- Either path is fine — they produce the same table.

CREATE TABLE IF NOT EXISTS "tool_usage" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "tool_id" text NOT NULL,
  "count" integer NOT NULL DEFAULT 0,
  "last_used_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "tool_usage_user_id_idx" ON "tool_usage" ("user_id");
