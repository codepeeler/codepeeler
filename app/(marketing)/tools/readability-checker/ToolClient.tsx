"use client";

import { useMemo, useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import FieldBox from "@/components/tools/FieldBox";
import { PanelBody } from "@/components/tools/PanelParts";
import { StatGrid } from "@/components/tools/StatCard";

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const stripped = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const matches = stripped.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function analyze(text: string) {
  const sentences = (text.match(/[^.!?]+[.!?]*/g) ?? []).filter((s) => s.trim().length > 0);
  const words = text.trim().split(/\s+/).filter(Boolean);
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const wordCount = words.length;
  const sentenceCount = Math.max(sentences.length, 1);
  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = wordCount > 0 ? syllables / wordCount : 0;

  const fleschScore = wordCount > 0 ? 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord : 0;
  const gradeLevel = wordCount > 0 ? 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59 : 0;
  const readingTimeSec = (wordCount / 200) * 60;

  return { wordCount, sentenceCount, syllables, avgWordsPerSentence, fleschScore, gradeLevel, readingTimeSec };
}

function fleschLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Very easy (5th grade)", color: "var(--success)" };
  if (score >= 70) return { label: "Easy / conversational", color: "var(--success)" };
  if (score >= 60) return { label: "Standard (8-9th grade)", color: "var(--secondary)" };
  if (score >= 30) return { label: "Fairly difficult (college)", color: "var(--warning)" };
  return { label: "Very difficult (graduate)", color: "var(--danger)" };
}

export default function ReadabilityCheckerPage() {
  const [input, setInput] = useState("");
  const stats = useMemo(() => analyze(input), [input]);
  const flesch = fleschLabel(stats.fleschScore);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="📖"
        title="Readability Checker"
        desc="Analyze text with Flesch Reading Ease and Flesch-Kincaid Grade Level scores, plus estimated reading time."
      />

      <ToolPanel>
        <PanelBody className="grid grid-cols-1 gap-3.5 md:grid-cols-[1.4fr_1fr]">
          <FieldBox label="Text" height="280px">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder="Paste an article, blog post, or paragraph to analyze..."
              className="h-full w-full resize-none bg-transparent p-3 text-[13.5px] leading-[1.6] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </FieldBox>

          <StatGrid
            items={[
              [stats.wordCount.toLocaleString(), "Words"],
              [stats.sentenceCount.toLocaleString(), "Sentences"],
              [stats.avgWordsPerSentence.toFixed(1), "Avg words / sentence"],
              [`${Math.max(1, Math.round(stats.readingTimeSec / 60))} min`, "Reading time"],
              [Math.max(0, stats.gradeLevel).toFixed(1), "Flesch-Kincaid grade"],
              [stats.fleschScore.toFixed(0), "Flesch reading ease"],
            ]}
          />
        </PanelBody>

        {input.trim() && (
          <div className="border-t border-[var(--border-soft)] px-4 py-3">
            <span className="rounded-[6px] px-2.5 py-1 text-[12.5px] font-semibold text-white" style={{ background: flesch.color }}>
              {flesch.label}
            </span>
          </div>
        )}
      </ToolPanel>
    </div>
  );
}
