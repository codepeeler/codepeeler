"use client";

import { useMemo, useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import FieldBox from "@/components/tools/FieldBox";
import { PanelBody } from "@/components/tools/PanelParts";

function parseEnvFile(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  text.split("\n").forEach((raw) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const eq = line.indexOf("=");
    if (eq === -1) return;
    result[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  });
  return result;
}

export default function EnvDiffCheckerPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const { onlyA, onlyB, different } = useMemo(() => {
    const a = parseEnvFile(left);
    const b = parseEnvFile(right);
    const allKeys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).sort();
    const onlyA: string[] = [];
    const onlyB: string[] = [];
    const different: string[] = [];
    for (const key of allKeys) {
      const inA = key in a;
      const inB = key in b;
      if (inA && !inB) onlyA.push(key);
      else if (!inA && inB) onlyB.push(key);
      else if (a[key] !== b[key]) different.push(`${key}: "${a[key]}" ≠ "${b[key]}"`);
    }
    return { onlyA, onlyB, different };
  }, [left, right]);

  const hasContent = left.trim() || right.trim();

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge=".env"
        title=".env Diff Checker"
        desc="Compare two .env files to spot keys that are missing on one side or have different values."
      />

      <ToolPanel>
        <PanelBody className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <FieldBox label="File A" height="220px">
            <textarea
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              spellCheck={false}
              placeholder={"DATABASE_URL=postgres://localhost/db\nPORT=3000"}
              className="h-full w-full resize-none bg-transparent p-3 font-[family-name:var(--font-mono)] text-[13px] leading-[1.55] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </FieldBox>
          <FieldBox label="File B" height="220px">
            <textarea
              value={right}
              onChange={(e) => setRight(e.target.value)}
              spellCheck={false}
              placeholder={"DATABASE_URL=postgres://prod-host/db\nPORT=8080\nDEBUG=true"}
              className="h-full w-full resize-none bg-transparent p-3 font-[family-name:var(--font-mono)] text-[13px] leading-[1.55] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </FieldBox>
        </PanelBody>

        <div className="border-t border-[var(--border-soft)] p-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--text-faint)]">Diff</div>
          {!hasContent ? (
            <p className="text-[13px] text-[var(--text-faint)]">Paste both .env files above to see the diff.</p>
          ) : (
            <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap break-words rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-3 font-[family-name:var(--font-mono)] text-[13px] leading-[1.6] text-[var(--text)]">
              {[
                onlyA.length ? `Only in File A:\n${onlyA.map((k) => `  + ${k}`).join("\n")}` : "Only in File A: (none)",
                onlyB.length ? `\nOnly in File B:\n${onlyB.map((k) => `  + ${k}`).join("\n")}` : "\nOnly in File B: (none)",
                different.length ? `\nDifferent values:\n${different.map((d) => `  ≠ ${d}`).join("\n")}` : "\nDifferent values: (none)",
              ].join("\n")}
            </pre>
          )}
        </div>
      </ToolPanel>
    </div>
  );
}
