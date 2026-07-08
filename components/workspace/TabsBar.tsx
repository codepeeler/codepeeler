"use client";

import { useRef, useState } from "react";
import { Undo2, Redo2, Scan, Upload } from "lucide-react";
import { useWorkflow } from "@/providers/workflow-provider";
import { useToast } from "@/providers/toast-provider";
import type { WorkflowSnapshot } from "@/lib/types/workflow";

export default function TabsBar() {
  const {
    scale,
    setScale,
    canUndo,
    canRedo,
    undo,
    redo,
    runAll,
    isRunning,
    exportWorkflow,
    importWorkflow,
    activeWorkflowId,
    workflowName,
    renameWorkflow,
  } = useWorkflow();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(workflowName);

  // re-sync the draft only when switching to a different workflow, without
  // calling setState from inside a useEffect (which would cascade renders)
  const [syncedWorkflowId, setSyncedWorkflowId] = useState(activeWorkflowId);
  if (activeWorkflowId !== syncedWorkflowId) {
    setSyncedWorkflowId(activeWorkflowId);
    setDraft(workflowName);
  }

  const handleRunAll = async () => {
    const result = await runAll();
    if (!result.ok && result.error === "cycle") {
      toast("Can't run — the workflow has a circular connection");
    } else {
      toast("Workflow finished running");
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as WorkflowSnapshot;
      if (!Array.isArray(data.nodes) || !Array.isArray(data.conns)) {
        throw new Error("Not a valid workflow file");
      }
      importWorkflow(data);
      toast("Workflow imported");
    } catch {
      toast("Couldn't import that file");
    }
  };

  return (
    <div className="flex h-11 flex-shrink-0 flex-wrap items-center gap-2 border-b border-[var(--border-soft)] bg-[var(--bg-elev)] px-3">
      <input
        value={draft}
        spellCheck={false}
        title="Workflow name"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => renameWorkflow(activeWorkflowId, draft)}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        className="min-w-[100px] max-w-[200px] flex-shrink-0 rounded-[7px] border border-transparent bg-transparent px-[9px] py-1.5 font-[family-name:var(--font-display)] text-[13px] font-semibold transition-colors duration-150 hover:border-[var(--border)] hover:bg-[var(--card)] focus:border-[var(--primary)] focus:bg-[var(--card)]"
      />

      <span className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[color-mix(in_srgb,var(--success)_14%,transparent)] py-1 pl-[7px] pr-[9px] text-[11px] font-semibold text-[var(--success)]">
        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current" />
        Saved locally
      </span>

      <div className="ml-auto flex items-center gap-1">
        <button
          title="Undo (Ctrl+Z)"
          onClick={undo}
          disabled={!canUndo}
          className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-[var(--border)] bg-[var(--card)] text-[var(--text-dim)] transition-colors duration-150 hover:border-[var(--text-faint)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Undo2 size={14} />
        </button>
        <button
          title="Redo (Ctrl+Shift+Z)"
          onClick={redo}
          disabled={!canRedo}
          className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-[var(--border)] bg-[var(--card)] text-[var(--text-dim)] transition-colors duration-150 hover:border-[var(--text-faint)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Redo2 size={14} />
        </button>

        <div className="mx-1 h-5 w-px flex-shrink-0 bg-[var(--border-soft)]" />

        <div className="flex items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--card)] p-0.5">
          <button
            onClick={() => setScale((s) => s - 0.1)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-sm text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
          >
            −
          </button>
          <span className="w-[38px] text-center font-[family-name:var(--font-mono)] text-[11px] font-semibold text-[var(--text-dim)]">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => s + 0.1)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-sm text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
          >
            +
          </button>
        </div>

        <button
          title="Fit to screen"
          onClick={() => setScale(1)}
          className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-[var(--border)] bg-[var(--card)] text-[var(--text-dim)] transition-colors duration-150 hover:border-[var(--text-faint)] hover:text-[var(--text)]"
        >
          <Scan size={14} />
        </button>

        <div className="mx-1 h-5 w-px flex-shrink-0 bg-[var(--border-soft)]" />

        <button
          onClick={() => toast("Saved locally")}
          className="rounded-[7px] border border-[var(--border)] bg-[var(--card)] px-3 py-[7px] text-xs font-semibold text-[var(--text-dim)] transition-colors duration-150 hover:border-[var(--text-faint)] hover:text-[var(--text)]"
        >
          Save
        </button>
        <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFileChange} className="hidden" />
        <button
          onClick={handleImportClick}
          title="Import a workflow.json file"
          className="flex items-center gap-1.5 rounded-[7px] border border-[var(--border)] bg-[var(--card)] px-3 py-[7px] text-xs font-semibold text-[var(--text-dim)] transition-colors duration-150 hover:border-[var(--text-faint)] hover:text-[var(--text)]"
        >
          <Upload size={12} /> Import
        </button>
        <button
          onClick={exportWorkflow}
          className="rounded-[7px] border border-[var(--border)] bg-[var(--card)] px-3 py-[7px] text-xs font-semibold text-[var(--text-dim)] transition-colors duration-150 hover:border-[var(--text-faint)] hover:text-[var(--text)]"
        >
          Export
        </button>
        <button
          disabled={isRunning}
          onClick={handleRunAll}
          className="flex items-center gap-1.5 rounded-[7px] bg-[linear-gradient(135deg,var(--primary),#7C4CF0)] px-3 py-[7px] text-xs font-semibold text-white transition-all duration-150 hover:brightness-[1.08] hover:shadow-[var(--shadow-glow)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRunning ? "Running…" : "▶ Run All"}
        </button>
      </div>
    </div>
  );
}
