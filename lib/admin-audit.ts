import "server-only";
import crypto from "crypto";
import { db } from "@/lib/db";
import { adminAuditLog } from "@/lib/db/schema";

/**
 * Fire-and-forget audit trail for every admin mutation. Call this from
 * inside the route AFTER the actual action succeeds — never let a logging
 * failure block or roll back the real action, so this only ever logs a
 * console error and swallows the rest.
 */
export async function logAdminAction(
  adminUserId: string,
  targetUserId: string | null,
  action: string,
  details?: Record<string, unknown>
) {
  try {
    await db.insert(adminAuditLog).values({
      id: crypto.randomUUID(),
      adminUserId,
      targetUserId,
      action,
      details: details ?? null,
    });
  } catch (err) {
    console.error("Failed to write admin audit log:", err);
  }
}
