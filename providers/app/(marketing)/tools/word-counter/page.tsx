"use client";

import { useMemo, useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";

export default function WordCounterPage() {
  const [input, setInput] = useState("");

  const stats = useMemo(() => {
    const characters = input.length;
    const charactersNoSpaces = input.replace(/\s/g, "").length;
    const words = input.trim() ? input.trim().split(/\s+/).length : 0;
    const lines = input ? input.split(/\r\n|\r|\n/).length : 0;
    const sentences = input.trim() ? (input.match(/[^.!?]+[.!?]+/g)?.length ?? (input.trim() ? 1 : 0)) : 0;
    const paragraphs = input.trim() ? input.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
    return { characters, charactersNoSpaces, words, lines, sentences, paragraphs };
  }, [input]);

  const STAT_ITEMS: [string, number][] = [
    ["Characters", stats.characters],
    ["Characters (no spaces)", stats.charactersNoSpaces],
    ["Words", stats.words],
    ["Sentences", stats.sentences],
    ["Paragraphs", stats.paragraphs],
    ["Lines", stats.lines],
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="#"
        title="Word Counter"
        desc="Count characters, words, sentences, and lines in real time as you type or paste text."
      />

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--bg-elev)]">
        <div className="grid grid-cols-1 gap-3.5 p-4 md:grid-cols-[1.4fr_1fr]">
          <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border-soft)] px-3 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--text-faint)]">
                Text
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder="Type or paste text..."
              className="h-[220px] w-full resize-none bg-transparent p-3 text-[13px] leading-[1.6] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 content-start">
            {STAT_ITEMS.map(([label, value]) => (
              <div
                key={label}
                className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-3.5"
              >
                <div className="font-[family-name:var(--font-mono)] text-[22px] font-bold text-[var(--text)]">
                  {value.toLocaleString()}
                </div>
                <div className="mt-0.5 text-[11.5px] text-[var(--text-faint)]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
