-- Webhook Inbox schema — run this once in your Supabase project's SQL editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).

create extension if not exists pgcrypto;

create table if not exists webhook_inboxes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null default 'Untitled inbox',
  created_at timestamptz not null default now()
);

create table if not exists webhook_requests (
  id uuid primary key default gen_random_uuid(),
  inbox_id uuid not null references webhook_inboxes(id) on delete cascade,
  method text not null,
  path text not null default '',
  query jsonb not null default '{}'::jsonb,
  headers jsonb not null default '{}'::jsonb,
  body text,
  content_type text,
  ip text,
  size_bytes integer not null default 0,
  received_at timestamptz not null default now()
);

create index if not exists webhook_requests_inbox_id_idx on webhook_requests (inbox_id, received_at desc);

-- Row Level Security
-- Trust model here matches webhook.site / RequestBin: whoever holds the inbox's slug/URL can
-- view and manage it — there's no separate login system in this app yet, so this is
-- security-through-the-unguessable-slug, same as every other free webhook-bin tool. Only the
-- capture route (via the SERVICE ROLE key, which bypasses RLS) is allowed to insert requests —
-- there is deliberately no public insert policy on webhook_requests below, so nobody can spoof
-- a "captured request" through the browser-facing anon key.
alter table webhook_inboxes enable row level security;
alter table webhook_requests enable row level security;

drop policy if exists "anyone can read inboxes" on webhook_inboxes;
create policy "anyone can read inboxes" on webhook_inboxes for select using (true);

drop policy if exists "anyone can delete inboxes" on webhook_inboxes;
create policy "anyone can delete inboxes" on webhook_inboxes for delete using (true);

drop policy if exists "anyone can read requests" on webhook_requests;
create policy "anyone can read requests" on webhook_requests for select using (true);

drop policy if exists "anyone can delete requests" on webhook_requests;
create policy "anyone can delete requests" on webhook_requests for delete using (true);

-- Realtime: broadcast new captures to subscribers live (this is what makes the inbox feel
-- instant instead of the polling-based refresh most free webhook-bin tools fall back to).
alter publication supabase_realtime add table webhook_requests;
