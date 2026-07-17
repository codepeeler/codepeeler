import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { featureFlag } from "@/lib/db/schema";

/**
 * Checks a single flag. Returns false if the flag has never been created
 * (safe default — a flag that doesn't exist yet is "off"). Every check is
 * a fresh DB read — fine at this app's scale; add a short in-memory cache
 * here later if this ever gets called on a hot path.
 */
export async function isFeatureEnabled(key: string): Promise<boolean> {
  const [row] = await db.select({ enabled: featureFlag.enabled }).from(featureFlag).where(eq(featureFlag.key, key));
  return row?.enabled ?? false;
}
