/**
 * Tracks how often each tool page is opened, so the landing page can surface
 * a "Popular tools" section that reflects what this user actually uses —
 * not just a hardcoded list. Stored per-browser in localStorage, keyed by
 * the tool's page path (e.g. "/tools/json-formatter").
 */

export const TOOL_VISITS_STORAGE_KEY = "codepeeler:tool-visits";

type VisitMap = Record<string, number>;

function readVisits(): VisitMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(TOOL_VISITS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeVisits(visits: VisitMap) {
  try {
    window.localStorage.setItem(TOOL_VISITS_STORAGE_KEY, JSON.stringify(visits));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — fail silently
  }
}

/** Record a single visit to a tool page. Call once when the tool page mounts. */
export function recordToolVisit(path: string) {
  if (typeof window === "undefined" || !path) return;
  const visits = readVisits();
  visits[path] = (visits[path] ?? 0) + 1;
  writeVisits(visits);
}

/** Get the raw visit counts, keyed by tool page path. */
export function getToolVisitCounts(): VisitMap {
  return readVisits();
}
