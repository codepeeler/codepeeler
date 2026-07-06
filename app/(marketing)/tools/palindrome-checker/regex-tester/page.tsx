"use client";

import { useMemo, useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import FieldBox from "@/components/tools/FieldBox";
import { PanelBody, PanelFooter } from "@/components/tools/PanelParts";
import { cn } from "@/lib/utils";

const FLAGS: { key: string; label: string }[] = [
  { key: "g", label: "Global" },
  { key: "i", label: "Ignore case" },
  { key: "m", label: "Multiline" },
  { key: "s", label: "Dot-all" },
];

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState<string[]>(["g"]);
  const [testString, setTestString] = useState("");

  const toggleFlag = (key: string) => {
    setFlags((prev) => (prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]));
  };

  const { regex, error, matches } = useMemo(() => {
    if (!pattern) return { regex: null, error: null, matches: [] as RegExpMatchArray[] };
    try {
      const re = new RegExp(pattern, flags.join(""));
      const all: RegExpMatchArray[] = [];
      if (flags.includes("g")) {
        for (const m of testString.matchAll(re)) all.push(m);
      } else {
        const m = testString.match(re);
        if (m) all.push(m);
      }
      return { regex: re, error: null, matches: all };
    } catch (e) {
      return { regex: null, error: e instanceof Error ? e.message : "Invalid pattern", matches: [] };
    }
  }, [pattern, flags, testString]);

  const highlighted = useMemo(() => {
    if (!testString) return null;
    if (!regex || matches.length === 0) return testString;
    const parts: React.ReactNode[] = [];
    let last = 0;
    matches.forEach((m, i) => {
      const start = m.index ?? 0;
      const end = start + m[0].length;
      if (start > last) parts.push(testString.slice(last, start));
      parts.push(
        <mark key={i} className="rounded-[3px] bg-[color-mix(in_srgb,var(--primary)_35%,transparent)] px-0.5 text-[var(--text)]">
          {m[0]}
        </mark>
      );
      last = end;
    });
    if (last < testString.length) parts.push(testString.slice(last));
    return parts;
  }, [testString, regex, matches]);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="web"
        badge=".*"
        title="Regex Tester"
        desc="Test and debug regular expressions against sample text with live match highlighting."
      />

      <ToolPanel>
        <div className="space-y-3 border-b border-[var(--border-soft)] p-4">
          <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-3 py-2">
            <span className="font-[family-name:var(--font-mono)] text-[var(--text-faint)]">/</span>
            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
              spellCheck={false}
              className="flex-1 bg-transparent font-[family-name:var(--font-mono)] text-[13px] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
            <span className="font-[family-name:var(--font-mono)] text-[var(--text-faint)]">/{flags.join("")}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {FLAGS.map((f) => (
              <button
                key={f.key}
                onClick={() => toggleFlag(f.key)}
                className={cn(
                  "rounded-[7px] border px-3 py-1.5 text-[12px] font-semibold transition-colors duration-150",
                  flags.includes(f.key)
                    ? "border-[var(--primary)] bg-[var(--primary-dim)] text-[var(--primary)]"
                    : "border-[var(--border)] bg-[var(--card)] text-[var(--text-dim)] hover:text-[var(--text)]"
                )}
              >
                {f.label} ({f.key})
              </button>
            ))}
          </div>
        </div>

        <PanelBody className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <FieldBox label="Test string" height="200px">
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              spellCheck={false}
              placeholder="Paste text to test your pattern against..."
              className="h-full w-full resize-none bg-transparent p-3 font-[family-name:var(--font-mono)] text-[13px] leading-[1.6] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </FieldBox>

          <FieldBox label="Matches" height="200px" right={<span className="text-[11.5px] text-[var(--text-faint)]">{matches.length}</span>}>
            <div className="whitespace-pre-wrap break-words p-3 font-[family-name:var(--font-mono)] text-[13px] leading-[1.6] text-[var(--text)]">
              {highlighted}
            </div>
          </FieldBox>
        </PanelBody>

        <PanelFooter tone={error ? "danger" : "muted"}>
          {error
            ? error
            : !pattern
            ? "Enter a pattern above to start matching."
            : `${matches.length} match${matches.length === 1 ? "" : "es"} found`}
        </PanelFooter>
      </ToolPanel>
    </div>
  );
}
