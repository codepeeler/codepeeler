-- Run this against your Neon DB (SQL editor in Neon console, or `psql $DATABASE_URL -f this-file.sql`).
-- Matches lib/db/schema.ts exactly. Adds the `tool_favorite` table — real
-- per-user pin/unpin for tools, separate from `tool_usage` (automatic
-- most-opened counter). Same shape as `snippet_bookmark`.
--
-- If you'd rather use Drizzle's own migration flow instead of raw SQL:
--   npx drizzle-kit generate
--   npx drizzle-kit push
-- Either path is fine — they produce the same table.

CREATE TABLE IF NOT EXISTS "tool_favorite" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "tool_id" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE "tool_favorite" ADD CONSTRAINT "tool_favorite_user_id_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "tool_favorite_user_tool_idx" ON "tool_favorite" ("user_id", "tool_id");
