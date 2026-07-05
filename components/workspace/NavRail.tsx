"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Database, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_RAIL_ITEMS } from "@/lib/data/workspace-shell";
import { useWorkflow } from "@/providers/workflow-provider";

export default function NavRail() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { nodes, conns, workflows, activeWorkflowId, switchWorkflow, createWorkflow } = useWorkflow();

  return (
    <nav
      style={{ width: collapsed ? "64px" : "var(--w-navrail)" }}
      className="z-[40] flex flex-shrink-0 flex-col overflow-y-auto border-r border-[var(--border-soft)] bg-[var(--bg-elev)] transition-[width] duration-150"
    >
      <div className="flex items-center justify-between px-2.5 pb-1 pt-2.5">
        {!collapsed && (
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--text-faint)]">
            Workspace
          </span>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          title="Collapse sidebar"
          className="ml-auto flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[var(--text-faint)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
        >
          <ChevronLeft size={14} className={cn("transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

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
              <div className="h-full w-[2%] rounded-full bg-[var(--primary)]" />
            </div>
            <div className="mt-1.5 text-[10.5px] text-[var(--text-faint)]">0 KB / 5 MB</div>
          </div>

          <button className="mx-2 mb-3 flex items-center justify-between rounded-lg border border-[var(--border-soft)] px-2.5 py-2 text-[11px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]">
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
            <button className="w-full rounded-md bg-[var(--primary)] py-1.5 text-center text-[11px] font-semibold text-white transition-[filter] duration-150 hover:brightness-[1.08]">
              Browse templates
            </button>
          </div>
        </>
      )}
    </nav>
  );
}
