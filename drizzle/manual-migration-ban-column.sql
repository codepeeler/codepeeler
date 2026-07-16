-- Run this against your Neon DB (SQL editor in Neon console, or `psql $DATABASE_URL -f this-file.sql`).
-- Matches lib/db/schema.ts exactly. Adds the "banned" column that supports suspending users.
--
-- If you'd rather use Drizzle's own migration flow instead of raw SQL:
--   npx drizzle-kit generate
--   npx drizzle-kit push
-- Either path is fine — they produce the same column.

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banned" BOOLEAN NOT NULL DEFAULT FALSE;
