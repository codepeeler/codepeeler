"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useCommandPalette } from "@/providers/command-palette-provider";
import { useToast } from "@/providers/toast-provider";
import { useOptionalWorkflow, CANVAS_W } from "@/providers/workflow-provider";
import { useTheme } from "next-themes";
import { TOOLS } from "@/lib/data/tools";
import { NODE_TYPES, NODE_CAT_COLOR, PALETTE_GROUPS } from "@/lib/data/node-types";
import CategoryBadge from "@/components/ui/CategoryBadge";

type ToolCat = "data" | "encode" | "gen" | "web" | "image" | "sec";

type CmdItem = {
  group: string;
  label: string;
  badge: string;
  shortcut?: string;
  action: () => void;
} & ({ kind: "tool"; cat: ToolCat } | { kind: "plain"; color: string });

export default function CommandPalette() {
  const { isOpen, close } = useCommandPalette();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const wf = useOptionalWorkflow();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const importFromFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !wf) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!Array.isArray(data.nodes) || !Array.isArray(data.conns)) throw new Error();
        wf.importWorkflow(data);
        toast("Workflow imported");
      } catch {
        toast("Couldn't import that file");
      }
    };
    input.click();
  };

  const items: CmdItem[] = useMemo(() => {
    const themeCommand: CmdItem = {
      group: "Commands",
      kind: "plain",
      label: "Toggle theme",
      badge: "⌘",
      color: "var(--secondary)",
      shortcut: "⌘ J",
      action: () => setTheme(theme === "dark" ? "light" : "dark"),
    };

    if (wf) {
      const workspaceCommands: CmdItem[] = [
        {
          group: "Workspace",
          kind: "plain",
          label: "Run all",
          badge: "▶",
          color: "var(--success)",
          action: () => wf.runAll(),
        },
        {
          group: "Workspace",
          kind: "plain",
          label: "Undo",
          badge: "↶",
          color: "var(--text-faint)",
          action: () => wf.undo(),
        },
        {
          group: "Workspace",
          kind: "plain",
          label: "Redo",
          badge: "↷",
          color: "var(--text-faint)",
          action: () => wf.redo(),
        },
        {
          group: "Workspace",
          kind: "plain",
          label: "Fit to screen",
          badge: "⤢",
          color: "var(--text-faint)",
          action: () => wf.setScale(1),
        },
        {
          group: "Workspace",
          kind: "plain",
          label: "Export workflow",
          badge: "↓",
          color: "var(--primary)",
          action: () => wf.exportWorkflow(),
        },
        {
          group: "Workspace",
          kind: "plain",
          label: "Import workflow…",
          badge: "↑",
          color: "var(--primary)",
          action: importFromFile,
        },
        {
          group: "Workspace",
          kind: "plain",
          label: "New workflow",
          badge: "+",
          color: "var(--primary)",
          action: () => wf.createWorkflow(),
        },
      ];

      const workflowItems: CmdItem[] = wf.workflows.map((w) => ({
        group: "Workflows",
        kind: "plain",
        label: w.name,
        badge: w.id === wf.activeWorkflowId ? "●" : "○",
        color: "var(--primary)",
        action: () => wf.switchWorkflow(w.id),
      }));

      const addNodeItems: CmdItem[] = PALETTE_GROUPS.flatMap((g) => g.items).map((id) => {
        const meta = NODE_TYPES[id];
        return {
          group: "Add Node",
          kind: "plain",
          label: meta.label,
          badge: meta.badge,
          color: NODE_CAT_COLOR[meta.cat],
          action: () => wf.addNode(id, CANVAS_W / 4, 200 + Math.random() * 300),
        };
      });

      return [...workspaceCommands, ...workflowItems, ...addNodeItems, themeCommand];
    }

    const toolItems: CmdItem[] = TOOLS.map((t) => ({
      group: "Tools",
      kind: "tool",
      label: t.name,
      badge: t.badge,
      cat: t.cat,
      action: () => {
        if (t.page) router.push(t.page);
        else toast(`${t.name} is coming soon`);
      },
    }));

    return [
      ...toolItems,
      themeCommand,
      {
        group: "Commands",
        kind: "plain",
        label: "Open workspace",
        badge: "→",
        color: "var(--primary)",
        action: () => router.push("/workspace"),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, router, toast, setTheme, wf]);

  const filtered = items.filter((i) => i.label.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  useEffect(() => setActive(0), [query]);

  const selectItem = (idx: number) => {
    const item = filtered[idx];
    if (!item) return;
    close();
    item.action();
  };

  if (!isOpen) return null;

  let lastGroup = "";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-[rgba(5,5,7,0.6)] pt-[12vh] backdrop-blur-[3px]"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-[560px] max-w-[90vw] overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--card)] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center gap-2.5 border-b border-[var(--border-soft)] px-4 py-3.5 text-[var(--text-faint)]">
          <Search size={16} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={wf ? "Add a node, switch workflow, run…" : "Search tools, commands, collections..."}
            autoComplete="off"
            className="flex-1 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)]"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, filtered.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                selectItem(active);
              }
            }}
          />
          <span className="rounded-[5px] border border-[var(--border)] bg-[var(--border-soft)] px-[5px] py-0.5 font-[family-name:var(--font-mono)] text-[10.5px] text-[var(--text-faint)]">
            esc
          </span>
        </div>

        <div className="max-h-[340px] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-[var(--text-faint)]">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
          {filtered.map((item, idx) => {
            const showGroupLabel = item.group !== lastGroup;
            lastGroup = item.group;
            return (
              <div key={`${item.group}-${item.label}`}>
                {showGroupLabel && (
                  <div className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-faint)]">
                    {item.group}
                  </div>
                )}
                <div
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => selectItem(idx)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-[9px] text-[13.5px] ${
                    active === idx ? "bg-[var(--primary-dim)]" : ""
                  }`}
                >
                  {item.kind === "tool" ? (
                    <CategoryBadge cat={item.cat} size="sm">
                      {item.badge}
                    </CategoryBadge>
                  ) : (
                    <span
                      style={{
                        color: item.color,
                        background: `color-mix(in srgb, ${item.color} 14%, transparent)`,
                      }}
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[8px] font-[family-name:var(--font-mono)] text-[10.5px] font-bold"
                    >
                      {item.badge}
                    </span>
                  )}
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <span className="ml-auto rounded-[5px] border border-[var(--border)] bg-[var(--border-soft)] px-[5px] py-0.5 font-[family-name:var(--font-mono)] text-[10.5px] text-[var(--text-faint)]">
                      {item.shortcut}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
