-- Run this against your Neon DB (SQL editor in Neon console, or `psql $DATABASE_URL -f this-file.sql`).
-- Matches lib/db/schema.ts exactly. Adds the "role" column that gates
-- /admin and /api/admin/* (see lib/admin.ts).
--
-- If you'd rather use Drizzle's own migration flow instead of raw SQL:
--   npx drizzle-kit generate   (reads lib/db/schema.ts, writes a migration file)
--   npx drizzle-kit push       (applies it to DATABASE_URL)
-- Either path is fine — they produce the same column.

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" text NOT NULL DEFAULT 'user';

-- After running this, promote yourself to admin manually (nobody can become
-- admin through the app itself — see lib/auth.ts's additionalFields.role,
-- input: false):
--
--   UPDATE "user" SET "role" = 'admin' WHERE "email" = 'you@example.com';
