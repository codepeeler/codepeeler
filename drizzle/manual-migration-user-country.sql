-- Run in Neon Console SQL Editor, after your existing migrations.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "country" text;
