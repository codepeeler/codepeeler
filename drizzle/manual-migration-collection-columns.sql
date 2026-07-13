-- Run this against your Neon DB (SQL editor in Neon console, or `psql $DATABASE_URL -f this-file.sql`).
-- Adds the Collections-page columns to the existing `collection` table
-- (icon/color/desc/tags/toolIds/visibility/starred/autoUpdate/allowDuplicate).
-- Matches lib/db/schema.ts exactly. Safe to re-run (IF NOT EXISTS everywhere).
--
-- Alternative: `npx drizzle-kit generate` + `npx drizzle-kit push` instead of raw SQL.

ALTER TABLE "collection" ADD COLUMN IF NOT EXISTS "desc" text NOT NULL DEFAULT '';
ALTER TABLE "collection" ADD COLUMN IF NOT EXISTS "icon" text NOT NULL DEFAULT 'folder';
ALTER TABLE "collection" ADD COLUMN IF NOT EXISTS "color" text NOT NULL DEFAULT 'var(--primary)';
ALTER TABLE "collection" ADD COLUMN IF NOT EXISTS "tags" jsonb NOT NULL DEFAULT '[]';
ALTER TABLE "collection" ADD COLUMN IF NOT EXISTS "tool_ids" jsonb NOT NULL DEFAULT '[]';
ALTER TABLE "collection" ADD COLUMN IF NOT EXISTS "visibility" text NOT NULL DEFAULT 'Private';
ALTER TABLE "collection" ADD COLUMN IF NOT EXISTS "starred" boolean NOT NULL DEFAULT false;
ALTER TABLE "collection" ADD COLUMN IF NOT EXISTS "auto_update" boolean NOT NULL DEFAULT false;
ALTER TABLE "collection" ADD COLUMN IF NOT EXISTS "allow_duplicate" boolean NOT NULL DEFAULT true;
