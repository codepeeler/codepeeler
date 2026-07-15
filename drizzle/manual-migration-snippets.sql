-- Run this against your Neon DB (SQL editor in Neon console, or `psql $DATABASE_URL -f this-file.sql`).
-- Matches lib/db/schema.ts exactly. Creates the `snippet` and
-- `snippet_bookmark` tables that back the community Snippets page
-- (/api/snippets/*). Safe to re-run (IF NOT EXISTS everywhere).
--
-- Alternative: `npx drizzle-kit generate` + `npx drizzle-kit push` instead of raw SQL.

CREATE TABLE IF NOT EXISTS "snippet" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "desc" text NOT NULL DEFAULT '',
  "language" text NOT NULL DEFAULT 'JavaScript',
  "category" text NOT NULL DEFAULT 'Utilities',
  "code" text NOT NULL DEFAULT '',
  "tags" jsonb NOT NULL DEFAULT '[]',
  "views" integer NOT NULL DEFAULT 0,
  "uses" integer NOT NULL DEFAULT 0,
  "rating" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "snippet_bookmark" (
  "id" text PRIMARY KEY NOT NULL,
  "snippet_id" text NOT NULL REFERENCES "snippet"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "snippet_user_id_idx" ON "snippet" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "snippet_bookmark_unique_idx" ON "snippet_bookmark" ("snippet_id", "user_id");
CREATE INDEX IF NOT EXISTS "snippet_bookmark_user_id_idx" ON "snippet_bookmark" ("user_id");
