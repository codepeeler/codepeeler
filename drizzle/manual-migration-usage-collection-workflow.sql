-- Run this against your Neon DB (SQL editor in Neon console, or `psql $DATABASE_URL -f this-file.sql`).
-- Matches lib/db/schema.ts exactly. After running this once, `usage`,
-- `collection`, and `workflow` tables will exist and the entitlements +
-- dashboard APIs will work.
--
-- If you'd rather use Drizzle's own migration flow instead of raw SQL:
--   npx drizzle-kit generate   (reads lib/db/schema.ts, writes a migration file)
--   npx drizzle-kit push       (applies it to DATABASE_URL)
-- Either path is fine — they produce the same tables.

CREATE TABLE IF NOT EXISTS "usage" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "count" integer NOT NULL DEFAULT 0,
  "period_key" text NOT NULL,
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "collection" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "workflow" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "collection_id" text REFERENCES "collection"("id") ON DELETE SET NULL,
  "name" text NOT NULL,
  "status" text NOT NULL DEFAULT 'draft',
  "steps" integer NOT NULL DEFAULT 0,
  "snapshot" jsonb,
  "last_run_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "usage_user_id_idx" ON "usage" ("user_id");
CREATE INDEX IF NOT EXISTS "collection_user_id_idx" ON "collection" ("user_id");
CREATE INDEX IF NOT EXISTS "workflow_user_id_idx" ON "workflow" ("user_id");
CREATE INDEX IF NOT EXISTS "workflow_collection_id_idx" ON "workflow" ("collection_id");
