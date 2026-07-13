"use client";

import { useState } from "react";
import { GitBranch, Upload, Download, Unlink, ExternalLink, Loader2, Eye, EyeOff } from "lucide-react";
import { Modal } from "@/components/api-tester/Modals";
import { CapabilityGate } from "@/components/core/CapabilityGate";
import { useApiTester } from "@/providers/api-tester-provider";
import { uid } from "@/lib/api-tester/engine";
import {
  loadGitHubToken,
  saveGitHubToken,
  pushCollectionToGist,
  pullCollectionFromGist,
  importCollectionFromGist,
  extractGistId,
} from "@/lib/github-sync/github";

function TokenField() {
  const [token, setToken] = useState(() => loadGitHubToken());
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(true);

  return (
    <div className="mb-4 rounded-lg border border-[var(--border-soft)] p-3">
      <div className="mb-1.5 text-[11.5px] font-bold text-[var(--text-dim)]">GitHub Personal Access Token</div>
      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <input
            type={visible ? "text" : "password"}
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              setSaved(false);
            }}
            placeholder="ghp_..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] py-1.5 pl-2.5 pr-8 font-[family-name:var(--font-mono)] text-[12px] outline-none focus:border-[var(--primary)]"
          />
          <button
            onClick={() => setVisible(!visible)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text)]"
            tabIndex={-1}
          >
            {visible ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
        <button
          onClick={() => {
            saveGitHubToken(token.trim());
            setSaved(true);
          }}
          disabled={saved}
          className="rounded-lg bg-[var(--primary-dim)] px-3 py-1.5 text-[11.5px] font-semibold text-[var(--primary)] disabled:opacity-40"
        >
          Save
        </button>
      </div>
      <div className="mt-1.5 text-[10.5px] leading-[1.5] text-[var(--text-faint)]">
        Needs a <span className="font-semibold">classic</span> token with the <code className="rounded bg-[var(--bg-elev)] px-1 py-0.5">gist</code> scope — fine-grained
        tokens don&apos;t support Gists yet. Create one at{" "}
        <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-[var(--primary)] underline">
          github.com/settings/tokens
        </a>
        . Stored only in this browser&apos;s localStorage — never sent anywhere except directly to api.github.com.
      </div>
    </div>
  );
}

export function GitHubSyncModal({ collectionId, onClose }: { collectionId?: string; onClose: () => void }) {
  const { collections, setCollections, toast } = useApiTester();
  const collection = collectionId ? collections.find((c) => c.id === collectionId) : undefined;

  const [importGistId, setImportGistId] = useState("");
  const [busy, setBusy] = useState<"push" | "pull" | "import" | null>(null);
  const [error, setError] = useState("");

  const requireToken = (): string | null => {
    const token = loadGitHubToken();
    if (!token) {
      setError("Add and save a GitHub token above first.");
      return null;
    }
    return token;
  };

  const push = async () => {
    if (!collection) return;
    const token = requireToken();
    if (!token) return;
    setBusy("push");
    setError("");
    try {
      const result = await pushCollectionToGist(token, collection);
      setCollections((prev) =>
        prev.map((c) =>
          c.id === collection.id ? { ...c, github: { gistId: result.gistId, filename: result.filename, lastSyncedAt: result.updatedAt } } : c
        )
      );
      toast(collection.github ? "Pushed to GitHub" : "Gist created and linked");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Push failed.");
    } finally {
      setBusy(null);
    }
  };

  const pull = async () => {
    if (!collection?.github) return;
    const token = requireToken();
    if (!token) return;
    setBusy("pull");
    setError("");
    try {
      const pulled = await pullCollectionFromGist(token, collection.github.gistId, collection.github.filename);
      setCollections((prev) => prev.map((c) => (c.id === collection.id ? { ...pulled, id: collection.id } : c)));
      toast("Pulled latest from GitHub");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pull failed.");
    } finally {
      setBusy(null);
    }
  };

  const unlink = () => {
    if (!collection) return;
    setCollections((prev) => prev.map((c) => (c.id === collection.id ? { ...c, github: undefined } : c)));
    toast("Unlinked from GitHub (the gist itself is untouched)");
  };

  const doImport = async () => {
    const token = requireToken();
    if (!token || !importGistId.trim()) return;
    setBusy("import");
    setError("");
    try {
      const gistId = extractGistId(importGistId);
      const imported = await importCollectionFromGist(token, gistId, uid());
      setCollections((prev) => [...prev, imported]);
      toast(`Imported "${imported.name}"`);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal title={collection ? `GitHub Sync — ${collection.name}` : "Import Collection from GitHub"} onClose={onClose} width={520}>
      <CapabilityGate capability="github-sync" label="GitHub Sync" description="Push and pull your collections to a GitHub Gist to back them up or share with your team.">
      <TokenField />

      {collection && (
        <div className="mb-4">
          {collection.github ? (
            <div className="mb-3 rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elev)] p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold text-[var(--success)]">
                <GitBranch size={13} /> Linked
              </div>
              <div className="mb-1 font-[family-name:var(--font-mono)] text-[11.5px] text-[var(--text-dim)]">{collection.github.filename}</div>
              <div className="flex items-center justify-between text-[10.5px] text-[var(--text-faint)]">
                <span>Last synced {new Date(collection.github.lastSyncedAt).toLocaleString()}</span>
                <a
                  href={`https://gist.github.com/${collection.github.gistId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[var(--primary)] hover:underline"
                >
                  View gist <ExternalLink size={10} />
                </a>
              </div>
            </div>
          ) : (
            <div className="mb-3 text-[12px] leading-[1.6] text-[var(--text-faint)]">
              Not linked to GitHub yet. Push to create a private gist — every push after that updates the same gist and keeps full revision history.
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={push}
              disabled={busy !== null}
              className="flex items-center gap-1.5 rounded-lg bg-[linear-gradient(135deg,var(--primary),#7C4CF0)] px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-40"
            >
              {busy === "push" ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} {collection.github ? "Push update" : "Push (create gist)"}
            </button>
            {collection.github && (
              <>
                <button
                  onClick={pull}
                  disabled={busy !== null}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)] disabled:opacity-40"
                >
                  {busy === "pull" ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} Pull latest
                </button>
                <button
                  onClick={unlink}
                  disabled={busy !== null}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)] disabled:opacity-40"
                >
                  <Unlink size={13} /> Unlink
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-[var(--border-soft)] pt-3.5">
        <div className="mb-1.5 text-[11.5px] font-bold text-[var(--text-dim)]">
          {collection ? "Or import a different collection from a gist" : "Paste a gist ID or URL shared by a teammate"}
        </div>
        <div className="flex gap-1.5">
          <input
            value={importGistId}
            onChange={(e) => setImportGistId(e.target.value)}
            placeholder="Gist ID, or paste the full gist URL"
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-1.5 font-[family-name:var(--font-mono)] text-[12px] outline-none focus:border-[var(--primary)]"
          />
          <button
            onClick={doImport}
            disabled={busy !== null || !importGistId.trim()}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[11.5px] font-semibold text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)] disabled:opacity-40"
          >
            {busy === "import" ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} Import as new
          </button>
        </div>
      </div>

      {error && <div className="mt-3 rounded-lg bg-[var(--danger-dim)] px-3 py-2 text-[12px] text-[var(--danger)]">{error}</div>}
      </CapabilityGate>
    </Modal>
  );
}
