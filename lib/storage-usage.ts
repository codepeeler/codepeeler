import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { collection, workflow, snippet } from "@/lib/db/schema";

/**
 * Real per-account storage usage, in bytes — sums the actual byte size of
 * everything this user has stored in Postgres (the only place account data
 * lives; avatar bytes live in R2 separately and aren't sized here yet).
 * This is what /workspace/settings' "Storage used" and the sidebar's
 * Storage Used bar should show for a *signed-in* user — never the
 * anonymous local-only estimate, which is a browser thing, not an account
 * thing, and doesn't mean anything once a plan/limit is involved.
 *
 * `octet_length` gives true UTF-8 byte size (not JS .length's UTF-16 code
 * units), matching how the storageMB plan limit is meant to be interpreted.
 */
export async function getStorageUsageBytes(userId: string): Promise<number> {
  const [collectionsRow] = await db
    .select({
      bytes: sql<number>`coalesce(sum(
        octet_length(${collection.name}) + octet_length(${collection.desc}) +
        octet_length(${collection.tags}::text) + octet_length(${collection.toolIds}::text)
      ), 0)`,
    })
    .from(collection)
    .where(eq(collection.userId, userId));

  const [workflowsRow] = await db
    .select({
      bytes: sql<number>`coalesce(sum(
        octet_length(${workflow.name}) + octet_length(coalesce(${workflow.snapshot}::text, ''))
      ), 0)`,
    })
    .from(workflow)
    .where(eq(workflow.userId, userId));

  const [snippetsRow] = await db
    .select({
      bytes: sql<number>`coalesce(sum(
        octet_length(${snippet.title}) + octet_length(${snippet.desc}) +
        octet_length(${snippet.code}) + octet_length(${snippet.tags}::text)
      ), 0)`,
    })
    .from(snippet)
    .where(eq(snippet.userId, userId));

  return Number(collectionsRow?.bytes ?? 0) + Number(workflowsRow?.bytes ?? 0) + Number(snippetsRow?.bytes ?? 0);
}
