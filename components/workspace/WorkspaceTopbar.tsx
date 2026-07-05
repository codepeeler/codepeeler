"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, Bell, Settings, MoreVertical } from "lucide-react";
import ThemeToggle from "@/components/core/ThemeToggle";
import { useCommandPalette } from "@/providers/command-palette-provider";
import { useWorkflow } from "@/providers/workflow-provider";

export default function WorkspaceTopbar() {
  const { open } = useCommandPalette();
  const { activeWorkflowId, workflowName, renameWorkflow } = useWorkflow();
  const [draft, setDraft] = useState(workflowName);

  useEffect(() => setDraft(workflowName), [workflowName]);

  return (
    <header className="relative z-[80] flex h-14 flex-shrink-0 items-center gap-4 border-b border-[var(--border-soft)] bg-[var(--bg)]/88 px-4 backdrop-blur-md">
      <Link href="/" className="flex flex-shrink-0 items-center gap-[9px]">
        <div className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-[linear-gradient(140deg,var(--primary),var(--secondary))] font-[family-name:var(--font-mono)] text-xs font-bold text-white">
          {"{ }"}
        </div>
        <span className="font-[family-name:var(--font-display)] text-base font-bold tracking-[-0.02em]">
          CodePeeler
        </span>
      </Link>

      <span className="flex-shrink-0 text-[13px] text-[var(--text-faint)]">/</span>

      <input
        value={draft}
        spellCheck={false}
        title="Workflow name"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => renameWorkflow(activeWorkflowId, draft)}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        className="min-w-[120px] max-w-[260px] rounded-[7px] border border-transparent px-[9px] py-1.5 font-[family-name:var(--font-display)] text-sm font-semibold transition-colors duration-150 hover:border-[var(--border)] hover:bg-[var(--card)] focus:border-[var(--primary)] focus:bg-[var(--card)]"
      />

      <span className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[color-mix(in_srgb,var(--success)_14%,transparent)] py-1 pl-[7px] pr-[9px] text-[11px] font-semibold text-[var(--success)]">
        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current" />
        Saved locally
      </span>

      <button
        onClick={open}
        className="mx-auto flex h-[34px] max-w-[380px] flex-1 items-center gap-2 rounded-[9px] border border-[var(--border)] bg-[var(--card)] py-0 pl-[11px] pr-2 text-[var(--text-faint)] transition-colors duration-150 hover:border-[var(--text-faint)]"
      >
        <Search size={14} className="flex-shrink-0" />
        <span className="flex-1 text-left text-[12.5px] text-[var(--text-faint)]">
          Search tools, workflows, actions…
        </span>
        <span className="rounded-[5px] border border-[var(--border)] bg-[var(--border-soft)] px-[5px] py-0.5 font-[family-name:var(--font-mono)] text-[10px] text-[var(--text-faint)]">
          ⌘K
        </span>
      </button>

      <div className="ml-auto flex flex-shrink-0 items-center gap-1.5">
        <ThemeToggle />
        <button
          title="Notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
        >
          <Bell size={17} />
        </button>
        <button
          title="Settings"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
        >
          <Settings size={17} />
        </button>
        <button
          title="More"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
        >
          <MoreVertical size={17} />
        </button>
        <div className="flex h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-[linear-gradient(140deg,var(--secondary),var(--primary))] font-[family-name:var(--font-mono)] text-[10.5px] font-bold text-white">
          JD
        </div>
      </div>
    </header>
  );
}
