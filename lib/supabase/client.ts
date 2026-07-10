import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser client — uses the public anon key (NEXT_PUBLIC_*, safe to ship to the client).
 * Only used for the Webhook Inbox feature's read-only Realtime subscription and for
 * fetching/deleting rows the browser already knows the id of. Nothing here can insert into
 * webhook_requests — RLS only grants that to the service-role key used server-side.
 */
let cached: SupabaseClient | null | undefined;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  cached = url && anonKey ? createClient(url, anonKey) : null;
  return cached;
}
