"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import ModeToggle from "@/components/tools/ModeToggle";
import { CheckboxOption, NumberField, TextField } from "@/components/tools/FormFields";

export default function TextTruncatorPage() {
  const [mode, setMode] = useState<"chars" | "words">("chars");
  const [limit, setLimit] = useState(100);
  const [suffix, setSuffix] = useState("...");
  const [wordBoundary, setWordBoundary] = useState(true);

  const run = (input: string): string => {
    if (mode === "words") {
      const words = input.trim().split(/\s+/);
      if (words.length <= limit) return input;
      return words.slice(0, limit).join(" ") + suffix;
    }
    if (input.length <= limit) return input;
    let sliced = input.slice(0, limit);
    if (wordBoundary) {
      const lastSpace = sliced.lastIndexOf(" ");
      if (lastSpace > limit * 0.6) sliced = sliced.slice(0, lastSpace);
    }
    return sliced + suffix;
  };

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="…"
        title="Text Truncator"
        desc="Truncate text to a character or word limit — with word-boundary awareness and a custom suffix like an ellipsis."
      />
      <ToolLab
        inputLabel="Text"
        outputLabel="Truncated"
        placeholder="Paste a long paragraph or description here to see how it gets truncated..."
        live
        recalcKey={`${mode}-${limit}-${suffix}-${wordBoundary}`}
        emptyHint="Paste text above."
        settingsSlot={
          <>
            <ModeToggle
              options={[
                { value: "chars", label: "Characters" },
                { value: "words", label: "Words" },
              ]}
              value={mode}
              onChange={(m) => setMode(m as typeof mode)}
            />
            <NumberField label="Limit" min={1} value={limit} onChange={setLimit} />
            <TextField label="Suffix" value={suffix} onChange={setSuffix} />
            {mode === "chars" && (
              <CheckboxOption label="Break at word boundary" checked={wordBoundary} onChange={setWordBoundary} />
            )}
          </>
        }
        onRun={(input) => run(input)}
      />
    </div>
  );
}
