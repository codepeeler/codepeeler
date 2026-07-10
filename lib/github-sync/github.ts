import type { Collection } from "@/lib/api-tester/types";

/**
 * Collections are backed up to/from a private GitHub Gist — one JSON file per collection.
 * Gists give free version history for every push (viewable/diffable on github.com), and
 * sharing a gist URL with a teammate is the whole "team sync" story: they paste the same
 * gist ID into "Import from Gist" to get the collection on their machine too.
 *
 * Calls go straight from the browser to api.github.com using the user's own token — GitHub's
 * REST API supports CORS for exactly this (Authorization header is on their allowed list), so
 * there's no server proxy involved and the token never leaves the browser.
 *
 * IMPORTANT: Gist read/write still requires a CLASSIC personal access token with the `gist`
 * scope — fine-grained tokens don't cover Gist access yet (a known, long-standing GitHub API
 * gap). This is called out in the UI, not just here.
 */

const TOKEN_STORAGE_KEY = "codepeeler:github-pat";
const GIST_MARKER_PREFIX = "codepeeler-collection:";

export function loadGitHubToken(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function saveGitHubToken(token: string) {
  try {
    if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* storage unavailable — token just won't persist across reloads */
  }
}

export interface GistSyncResult {
  gistId: string;
  filename: string;
  htmlUrl: string;
  updatedAt: string;
}

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
}

function slugFilename(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "collection"}.codepeeler.json`;
}

async function describeError(res: Response): Promise<string> {
  if (res.status === 401) return "GitHub rejected the token — check it's valid and hasn't expired.";
  if (res.status === 403) return "GitHub forbade this request — check the token has the 'gist' scope (classic tokens only; fine-grained tokens don't cover Gists yet).";
  if (res.status === 404) return "Gist not found — check the ID and that this token can access it.";
  if (res.status === 422) return "GitHub rejected the request body — the gist may be malformed.";
  const text = await res.text().catch(() => "");
  return `GitHub API error (${res.status}): ${text.slice(0, 200)}`;
}

export function extractGistId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/gist\.github\.com\/(?:[^/]+\/)?([a-f0-9]+)/i);
  if (match) return match[1];
  // Bare id, possibly with a trailing slash or query string pasted along with it.
  return trimmed.split(/[/?#]/)[0];
}

/** Creates the gist on first push, updates the same gist (preserving its revision history) on every push after. */
export async function pushCollectionToGist(token: string, collection: Collection): Promise<GistSyncResult> {
  const filename = collection.github?.filename || slugFilename(collection.name);
  const withoutSyncMeta: Collection = { ...collection };
  delete withoutSyncMeta.github;
  const content = JSON.stringify(withoutSyncMeta, null, 2);

  const isUpdate = !!collection.github?.gistId;
  const url = isUpdate ? `https://api.github.com/gists/${collection.github!.gistId}` : "https://api.github.com/gists";
  const res = await fetch(url, {
    method: isUpdate ? "PATCH" : "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      description: `${GIST_MARKER_PREFIX} ${collection.name}`,
      public: false,
      files: { [filename]: { content } },
    }),
  });
  if (!res.ok) throw new Error(await describeError(res));
  const data = await res.json();
  return { gistId: data.id, filename, htmlUrl: data.html_url, updatedAt: data.updated_at };
}

/** Pulls the linked gist's current content back down, overwriting the local collection with whatever's on GitHub. */
export async function pullCollectionFromGist(token: string, gistId: string, filename?: string): Promise<Collection> {
  const res = await fetch(`https://api.github.com/gists/${gistId}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await describeError(res));
  const data = await res.json();
  const files = (data.files || {}) as Record<string, { content: string; filename: string } | null>;
  const file = (filename ? files[filename] : Object.values(files)[0]) || null;
  if (!file) throw new Error("That gist doesn't contain a recognizable collection file.");

  let parsed: Collection;
  try {
    parsed = JSON.parse(file.content) as Collection;
  } catch {
    throw new Error("That gist's file isn't valid JSON — is it really a Codepeeler collection export?");
  }
  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.items)) {
    throw new Error("That gist doesn't look like a Codepeeler collection (missing 'items').");
  }

  return {
    ...parsed,
    github: { gistId, filename: file.filename, lastSyncedAt: new Date().toISOString() },
  };
}

/** Same as pullCollectionFromGist, but always assigns a fresh local id — used for "Import from Gist" to add a brand-new collection rather than overwrite one. */
export async function importCollectionFromGist(token: string, gistId: string, newId: string, filename?: string): Promise<Collection> {
  const pulled = await pullCollectionFromGist(token, gistId, filename);
  return { ...pulled, id: newId };
}
