-- Run this against your Neon DB (SQL editor in Neon console, or `psql $DATABASE_URL -f this-file.sql`).
-- Matches lib/db/schema.ts exactly. Run AFTER manual-migration-admin-audit-site-settings.sql.
-- Adds: feature_flag, coupon, support_ticket, support_ticket_message

CREATE TABLE IF NOT EXISTS "feature_flag" (
  "key" text PRIMARY KEY,
  "enabled" boolean NOT NULL DEFAULT false,
  "description" text,
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "coupon" (
  "code" text PRIMARY KEY,
  "description" text,
  "extra_trial_days" integer NOT NULL DEFAULT 0,
  "max_redemptions" integer,
  "times_redeemed" integer NOT NULL DEFAULT 0,
  "active" boolean NOT NULL DEFAULT true,
  "expires_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "support_ticket" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "subject" text NOT NULL,
  "status" text NOT NULL DEFAULT 'open',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "support_ticket_user_id_idx" ON "support_ticket" ("user_id");
CREATE INDEX IF NOT EXISTS "support_ticket_status_idx" ON "support_ticket" ("status");

CREATE TABLE IF NOT EXISTS "support_ticket_message" (
  "id" text PRIMARY KEY,
  "ticket_id" text NOT NULL REFERENCES "support_ticket"("id") ON DELETE CASCADE,
  "sender_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "sender_role" text NOT NULL,
  "message" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "support_ticket_message_ticket_id_idx" ON "support_ticket_message" ("ticket_id");
