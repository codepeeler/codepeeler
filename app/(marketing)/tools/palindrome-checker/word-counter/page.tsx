"use client";

import { useMemo, useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import FieldBox from "@/components/tools/FieldBox";
import { PanelBody } from "@/components/tools/PanelParts";
import { StatGrid } from "@/components/tools/StatCard";

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

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="#"
        title="Word Counter"
        desc="Count characters, words, sentences, and lines in real time as you type or paste text."
      />

      <ToolPanel>
        <PanelBody className="grid grid-cols-1 gap-3.5 md:grid-cols-[1.4fr_1fr]">
          <FieldBox label="Text" height="220px">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder="Type or paste text..."
              className="h-full w-full resize-none bg-transparent p-3 text-[13px] leading-[1.6] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </FieldBox>

          <StatGrid
            items={[
              [stats.characters.toLocaleString(), "Characters"],
              [stats.charactersNoSpaces.toLocaleString(), "Characters (no spaces)"],
              [stats.words.toLocaleString(), "Words"],
              [stats.sentences.toLocaleString(), "Sentences"],
              [stats.paragraphs.toLocaleString(), "Paragraphs"],
              [stats.lines.toLocaleString(), "Lines"],
            ]}
          />
        </PanelBody>
      </ToolPanel>
    </div>
  );
}
