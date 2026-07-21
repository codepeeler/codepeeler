"use client";

import { useMemo, useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import FieldBox from "@/components/tools/FieldBox";
import { PanelBody } from "@/components/tools/PanelParts";
import { deepDiff, type DiffEntry } from "@/lib/json-diff";

function fmt(v: unknown): string {
  if (v === undefined) return "—";
  if (typeof v === "string") return `"${v}"`;
  return JSON.stringify(v);
}

export default function JsonDiffPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const { diffs, error } = useMemo((): { diffs: DiffEntry[]; error: string | null } => {
    if (!left.trim() || !right.trim()) return { diffs: [], error: null };
    try {
      const a = JSON.parse(left);
      const b = JSON.parse(right);
      return { diffs: deepDiff(a, b), error: null };
    } catch (e) {
      return { diffs: [], error: e instanceof Error ? e.message : "Invalid JSON in one of the panels" };
    }
  }, [left, right]);

  const badge = (kind: DiffEntry["kind"]) => {
    const map = {
      added: { bg: "var(--success)", label: "+ added" },
      removed: { bg: "var(--danger)", label: "− removed" },
      changed: { bg: "var(--warning)", label: "~ changed" },
    } as const;
    const m = map[kind];
    return (
      <span className="rounded-[4px] px-1.5 py-0.5 text-[10.5px] font-semibold text-white" style={{ background: m.bg }}>
        {m.label}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="⇄"
        title="JSON Diff / Compare"
        desc="Deep-compare two JSON documents and see exactly which keys were added, removed, or changed — by path."
      />

      <ToolPanel>
        <PanelBody className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <FieldBox label="Left (original)" height="220px">
            <textarea
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              spellCheck={false}
              placeholder='{"name": "old"}'
              className="h-full w-full resize-none bg-transparent p-3 font-[family-name:var(--font-mono)] text-[13px] leading-[1.55] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </FieldBox>
          <FieldBox label="Right (updated)" height="220px">
            <textarea
              value={right}
              onChange={(e) => setRight(e.target.value)}
              spellCheck={false}
              placeholder='{"name": "new"}'
              className="h-full w-full resize-none bg-transparent p-3 font-[family-name:var(--font-mono)] text-[13px] leading-[1.55] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </FieldBox>
        </PanelBody>

        <div className="border-t border-[var(--border-soft)] p-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--text-faint)]">
            Differences {diffs.length > 0 && `(${diffs.length})`}
          </div>
          <div className="max-h-[300px] overflow-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)]">
            {diffs.length === 0 ? (
              <p className="p-3.5 text-[13px] text-[var(--text-faint)]">
                {error ?? (left.trim() && right.trim() ? "No differences — the documents are identical." : "Paste JSON in both panels above.")}
              </p>
            ) : (
              <div className="divide-y divide-[var(--border-soft)]">
                {diffs.map((d, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2 px-3.5 py-2 font-[family-name:var(--font-mono)] text-[12.5px]">
                    {badge(d.kind)}
                    <span className="text-[var(--text)]">{d.path}</span>
                    {d.kind === "changed" && (
                      <span className="text-[var(--text-faint)]">
                        {fmt(d.left)} → {fmt(d.right)}
                      </span>
                    )}
                    {d.kind === "added" && <span className="text-[var(--text-faint)]">{fmt(d.right)}</span>}
                    {d.kind === "removed" && <span className="text-[var(--text-faint)]">{fmt(d.left)}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && <div className="border-t border-[var(--border-soft)] px-4 py-2.5 text-[12px] text-[var(--danger)]">{error}</div>}
      </ToolPanel>
    </div>
  );
}
