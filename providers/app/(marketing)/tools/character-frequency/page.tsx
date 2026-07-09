"use client";

import { useMemo, useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import FieldBox from "@/components/tools/FieldBox";
import ModeToggle from "@/components/tools/ModeToggle";
import { PanelToolbar, PanelBody } from "@/components/tools/PanelParts";
import { CheckboxOption } from "@/components/tools/FormFields";

export default function CharacterFrequencyPage() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"char" | "word">("char");
  const [ignoreCase, setIgnoreCase] = useState(true);

  const freq = useMemo(() => {
    if (!input.trim()) return [] as [string, number][];
    const map = new Map<string, number>();
    if (mode === "char") {
      for (const ch of input) {
        if (/\s/.test(ch)) continue;
        const key = ignoreCase ? ch.toLowerCase() : ch;
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    } else {
      const words = input.trim().split(/\s+/);
      for (const w of words) {
        const key = ignoreCase ? w.toLowerCase() : w;
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [input, mode, ignoreCase]);

  const max = freq.length > 0 ? freq[0][1] : 1;

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="▦#"
        title="Character & Word Frequency"
        desc="Count how often each character or word appears in a block of text, ranked with a visual frequency bar."
      />

      <ToolPanel>
        <PanelToolbar className="justify-start">
          <ModeToggle
            options={[
              { value: "char", label: "Characters" },
              { value: "word", label: "Words" },
            ]}
            value={mode}
            onChange={(m) => setMode(m as typeof mode)}
          />
          <CheckboxOption label="Ignore case" checked={ignoreCase} onChange={setIgnoreCase} />
        </PanelToolbar>

        <PanelBody className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <FieldBox label="Text" height="320px">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder="Type or paste text..."
              className="h-full w-full resize-none bg-transparent p-3 text-[13.5px] leading-[1.6] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </FieldBox>

          <FieldBox label="Frequency" height="320px">
            {freq.length === 0 ? (
              <p className="p-3 text-[13px] text-[var(--text-faint)]">Frequency breakdown will appear here.</p>
            ) : (
              <div className="space-y-1.5 p-3">
                {freq.slice(0, 40).map(([key, count]) => (
                  <div key={key} className="flex items-center gap-2 text-[12.5px]">
                    <span className="w-[60px] flex-shrink-0 truncate font-[family-name:var(--font-mono)] text-[var(--text)]">
                      {key === " " ? "space" : key}
                    </span>
                    <div className="h-4 flex-1 overflow-hidden rounded-[3px] bg-[var(--card-hover)]">
                      <div className="h-full rounded-[3px] bg-[var(--primary)]" style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                    <span className="w-8 flex-shrink-0 text-right font-[family-name:var(--font-mono)] text-[var(--text-faint)]">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </FieldBox>
        </PanelBody>
      </ToolPanel>
    </div>
  );
}
