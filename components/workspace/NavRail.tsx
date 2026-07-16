"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, Database, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_RAIL_ITEMS } from "@/lib/data/workspace-shell";
import { useWorkflow } from "@/providers/workflow-provider";
import { useCommandPalette } from "@/providers/command-palette-provider";
import { useEntitlements } from "@/hooks/use-entitlements";
import Drawer from "@/components/layout/mobile/Drawer";

export const NAV_RAIL_PANEL_ID = "nav-rail";

const WORKFLOWS_STORAGE_KEY = "codepeeler:workflows";
const ACTIVE_ID_STORAGE_KEY = "codepeeler:activeWorkflowId";

/** Fallback-only quota — ~5 MB is the commonly-quoted per-origin localStorage
 * limit across browsers, used only while entitlements haven't loaded yet. */
const LOCAL_STORAGE_QUOTA_BYTES = 5 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function NavRailContent({ collapsed, onToggleCollapse, showCollapseButton }: { collapsed: boolean; onToggleCollapse?: () => void; showCollapseButton: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { nodes, conns, workflows, activeWorkflowId, switchWorkflow, createWorkflow } = useWorkflow();
  const { open: openCommandPalette } = useCommandPalette();
  // /workspace is a logged-in-only area (see middleware.ts), so whoever sees
  // this rail always has an account — real per-account storage (collections
  // + workflows + snippets, measured server-side) is what actually matters
  // against their plan's storageMB limit, not a browser-local estimate.
  const { loading: entitlementsLoading, entitlements } = useEntitlements();

  // Local-only fallback, used solely if entitlements haven't loaded yet (or
  // fail to) — never the primary number for a signed-in user.
  const [localBytes, setLocalBytes] = useState(0);
  useEffect(() => {
    const readLocalUsage = () => {
      try {
        const raw =
          (window.localStorage.getItem(WORKFLOWS_STORAGE_KEY) ?? "") +
          (window.localStorage.getItem(ACTIVE_ID_STORAGE_KEY) ?? "");
        setLocalBytes(new Blob([raw]).size);
      } catch {
        setLocalBytes(0);
      }
    };
    readLocalUsage();
    const t = setTimeout(readLocalUsage, 700);
    return () => clearTimeout(t);
  }, [nodes, conns, workflows]);

  const hasRealStorageData = !entitlementsLoading && !!entitlements;
  const storageBytes = hasRealStorageData ? entitlements!.storageUsedBytes : localBytes;
  const storageQuotaBytes = hasRealStorageData ? entitlements!.limits.storageMB * 1024 * 1024 : LOCAL_STORAGE_QUOTA_BYTES;
  const storagePct = Math.min(100, Math.round((storageBytes / Math.max(storageQuotaBytes, 1)) * 100));

  const goToTemplates = () => {
    if (pathname === "/collections") {
      document.getElementById("templates")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push("/collections#templates");
    }
  };

  return (
    <>
      {showCollapseButton && (
        <div className="flex items-center justify-between px-2.5 pb-1 pt-2.5">
          {!collapsed && (
            <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--text-faint)]">
              Workspace
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            className="ml-auto flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[var(--text-faint)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
          >
            <ChevronLeft size={14} className={cn("transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>
      )}

      <div className="px-2 pb-1 pt-2.5">
        {NAV_RAIL_ITEMS.map(({ key, label, href, icon: Icon }) => (
          <Link
            key={key}
            href={href}
            className={cn(
              "mb-px flex items-center gap-2.5 rounded-lg px-[9px] py-2 text-[12.5px] font-semibold text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]",
              pathname === href && "bg-[var(--primary-dim)] text-[var(--primary)]"
            )}
          >
            <Icon size={15} className="flex-shrink-0 opacity-85" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </div>

      {!collapsed && (
        <>
          <div className="mb-1.5 mt-4 flex items-center justify-between px-[9px] text-[10.5px] font-bold uppercase tracking-[0.07em] text-[var(--text-faint)]">
            <span>Workflows</span>
            <button
              onClick={() => createWorkflow()}
              title="New workflow"
              className="flex h-[18px] w-[18px] items-center justify-center rounded-[5px] text-[var(--text-faint)] transition-colors duration-150 hover:bg-[var(--primary-dim)] hover:text-[var(--primary)]"
            >
              +
            </button>
          </div>
          <div className="px-2 text-[11.5px] text-[var(--text-faint)]">
            {workflows.map((wf) => (
              <button
                key={wf.id}
                onClick={() => switchWorkflow(wf.id)}
                className={cn(
                  "mb-0.5 block w-full truncate rounded-lg px-[9px] py-1.5 text-left transition-colors duration-150 hover:bg-[var(--card-hover)]",
                  wf.id === activeWorkflowId
                    ? "bg-[var(--card)] text-[var(--text)] shadow-[inset_2px_0_0_var(--primary)]"
                    : "text-[var(--text-faint)]"
                )}
              >
                {wf.name}
              </button>
            ))}
          </div>

          <div className="mx-2 mt-4 rounded-xl border border-[var(--border-soft)] bg-transparent p-3">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--text-faint)]">
              Workspace Statistics
            </div>
            <div className="flex items-center justify-between py-1 text-[11.5px] text-[var(--text-dim)]">
              <span>Nodes on canvas</span>
              <b className="text-[var(--text)]">{nodes.length}</b>
            </div>
            <div className="flex items-center justify-between py-1 text-[11.5px] text-[var(--text-dim)]">
              <span>Connections</span>
              <b className="text-[var(--text)]">{conns.length}</b>
            </div>
            <div className="flex items-center justify-between py-1 text-[11.5px] text-[var(--text-dim)]">
              <span>Saved workflows</span>
              <b className="text-[var(--text)]">{workflows.length}</b>
            </div>
          </div>

          <div className="mx-2 mb-2.5 mt-4 rounded-xl border border-[var(--border-soft)] p-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium text-[var(--text-faint)]">
              <Database size={12} />
              Storage Used
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border-soft)]">
              <div
                className={`h-full rounded-full ${storagePct >= 90 ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
                style={{ width: `${Math.max(storagePct, storageBytes > 0 ? 2 : 0)}%` }}
              />
            </div>
            <div className="mt-1.5 text-[10.5px] text-[var(--text-faint)]">
              {formatBytes(storageBytes)} / {formatBytes(storageQuotaBytes)}
            </div>
          </div>

          <button
            onClick={openCommandPalette}
            className="mx-2 mb-3 flex items-center justify-between rounded-lg border border-[var(--border-soft)] px-2.5 py-2 text-[11px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
          >
            <span className="flex items-center gap-1.5">
              <Keyboard size={13} /> Keyboard shortcuts
            </span>
            <span className="rounded-[5px] border border-[var(--border)] bg-[var(--border-soft)] px-[5px] py-0.5 font-[family-name:var(--font-mono)] text-[10px] text-[var(--text-faint)]">
              ?
            </span>
          </button>

          <div className="mx-2 mb-3 rounded-xl border border-[var(--border-soft)] bg-[linear-gradient(160deg,var(--primary-dim),transparent)] p-3">
            <div className="mb-1 text-[11.5px] font-bold">💡 Pro tip</div>
            <div className="mb-2.5 text-[10.5px] leading-[1.5] text-[var(--text-faint)]">
              Use templates to supercharge your workflow creation.
            </div>
            <button
              onClick={goToTemplates}
              className="w-full rounded-md bg-[var(--primary)] py-1.5 text-center text-[11px] font-semibold text-white transition-[filter] duration-150 hover:brightness-[1.08]"
            >
              Browse templates
            </button>
          </div>
        </>
      )}
    </>
  );
}

/**
 * Desktop: fixed-width collapsible aside (unchanged behavior).
 * Mobile (<lg): rendered inside the shared Drawer, opened via MobileHeader's
 * menu action. Used by both /workspace and /workspace/settings (and any
 * other page that needs the same nav), so fixing it here fixes all of them.
 */
export default function NavRail() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <nav
        style={{ width: collapsed ? "64px" : "var(--w-navrail)" }}
        className="z-[40] hidden flex-shrink-0 flex-col overflow-y-auto border-r border-[var(--border-soft)] bg-[var(--bg-elev)] transition-[width] duration-150 lg:flex"
      >
        <NavRailContent collapsed={collapsed} onToggleCollapse={() => setCollapsed((v) => !v)} showCollapseButton />
      </nav>
      <Drawer id={NAV_RAIL_PANEL_ID} title="Menu">
        <NavRailContent collapsed={false} showCollapseButton={false} />
      </Drawer>
    </>
  );
}
