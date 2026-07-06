"use client";

import { useMemo, useState } from "react";
import { diffLines, diffWords, type Change } from "diff";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import FieldBox from "@/components/tools/FieldBox";
import ModeToggle from "@/components/tools/ModeToggle";
import { PanelToolbar, PanelBody } from "@/components/tools/PanelParts";
import { cn } from "@/lib/utils";

export default function TextDiffPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [mode, setMode] = useState<"line" | "word">("line");

  const changes: Change[] = useMemo(() => {
    if (!left && !right) return [];
    return mode === "line" ? diffLines(left, right) : diffWords(left, right);
  }, [left, right, mode]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    changes.forEach((c) => {
      const unit = mode === "line" ? (c.value.match(/\n/g)?.length ?? (c.value ? 1 : 0)) : c.value.split(/\s+/).filter(Boolean).length;
      if (c.added) added += unit;
      if (c.removed) removed += unit;
    });
    return { added, removed };
  }, [changes, mode]);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="≠"
        title="Text Diff Checker"
        desc="Compare two blocks of text line-by-line or word-by-word — additions and removals are highlighted inline."
      />

      <ToolPanel>
        <PanelToolbar>
          <ModeToggle
            options={[
              { value: "line", label: "Line-level" },
              { value: "word", label: "Word-level" },
            ]}
            value={mode}
            onChange={(m) => setMode(m as typeof mode)}
          />
          <div className="flex items-center gap-3 text-[12px]">
            <span className="text-[var(--success)]">+{stats.added}</span>
            <span className="text-[var(--danger)]">-{stats.removed}</span>
          </div>
        </PanelToolbar>

        <PanelBody className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <FieldBox label="Original" height="220px">
            <textarea
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              spellCheck={false}
              placeholder="Paste original text..."
              className="h-full w-full resize-none bg-transparent p-3 font-[family-name:var(--font-mono)] text-[13px] leading-[1.55] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </FieldBox>
          <FieldBox label="Changed" height="220px">
            <textarea
              value={right}
              onChange={(e) => setRight(e.target.value)}
              spellCheck={false}
              placeholder="Paste changed text..."
              className="h-full w-full resize-none bg-transparent p-3 font-[family-name:var(--font-mono)] text-[13px] leading-[1.55] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </FieldBox>
        </PanelBody>

        <div className="border-t border-[var(--border-soft)] p-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--text-faint)]">Diff</div>
          <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap break-words rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-3 font-[family-name:var(--font-mono)] text-[13px] leading-[1.6]">
            {changes.length === 0 ? (
              <span className="text-[var(--text-faint)]">Paste text in both panels above to see the diff.</span>
            ) : (
              changes.map((c, i) => (
                <span
                  key={i}
                  className={cn(
                    c.added && "bg-[color-mix(in_srgb,var(--success)_22%,transparent)] text-[var(--text)]",
                    c.removed && "bg-[color-mix(in_srgb,var(--danger)_22%,transparent)] text-[var(--text)] line-through decoration-[var(--danger)]",
                    !c.added && !c.removed && "text-[var(--text-dim)]"
                  )}
                >
                  {c.value}
                </span>
              ))
            )}
          </pre>
        </div>
      </ToolPanel>
    </div>
  );
}
