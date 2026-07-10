import type { MockServer } from "@/lib/api-tester/types";

/**
 * Mock server definitions live in the browser (localStorage) — the source of truth is the client.
 * This is just a server-side mirror so the catch-all mock route can answer requests from *other*
 * apps/origins that don't have access to that localStorage. The client pushes its config here via
 * POST /api/mock/config whenever it changes (see ApiTesterProvider).
 *
 * Stored on globalThis so it survives Next.js dev-mode hot-reloads of this module (otherwise every
 * edit anywhere in the app would silently wipe the mock config until the client re-synced).
 */
const g = globalThis as unknown as { __codepeelerMockStore?: MockServer[] };
if (!g.__codepeelerMockStore) g.__codepeelerMockStore = [];

export function getMockStore(): MockServer[] {
  return g.__codepeelerMockStore || [];
}

export function setMockStore(servers: MockServer[]) {
  g.__codepeelerMockStore = servers;
}
