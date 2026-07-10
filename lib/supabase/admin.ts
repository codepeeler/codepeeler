import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Admin client — uses the SERVICE ROLE key, which bypasses Row Level Security entirely.
 * `import "server-only"` makes any accidental client-component import fail the build instead
 * of silently leaking this key into the browser bundle.
 * Used by: the public /api/hooks/[slug] capture route (must write with no user session), and
 * the /api/webhook-inbox management routes (create/clear/delete).
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
