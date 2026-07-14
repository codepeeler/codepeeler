import "server-only";
import { auth } from "@/lib/auth";

/**
 * Every /api/admin/* route calls this first. Middleware only confirms
 * "there's a session cookie" (see middleware.ts) — the actual role check
 * has to happen here, server-side, same pattern as getUserEntitlements()
 * for plan checks. Returns the session if the caller is an admin, null
 * otherwise (caller should respond 401/403).
 */
export async function requireAdminSession(headers: Headers) {
  const session = await auth.api.getSession({ headers });
  if (!session || session.user.role !== "admin") return null;
  return session;
}
