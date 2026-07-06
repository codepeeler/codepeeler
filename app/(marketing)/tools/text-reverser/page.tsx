"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

type Mode = "chars" | "words" | "lines";

function reverseText(input: string, mode: Mode): string {
  if (mode === "chars") return [...input].reverse().join("");
  if (mode === "words") return input.split(/(\s+)/).reverse().join("");
  return input.split(/\r\n|\r|\n/).reverse().join("\n");
}

export default function TextReverserPage() {
  const [mode, setMode] = useState<Mode>("chars");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="⇋"
        title="Text Reverser"
        desc="Reverse text by character, word order, or line order."
      />
      <ToolLab
        inputLabel="Text"
        outputLabel="Reversed"
        placeholder="Type or paste text..."
        modes={[
          { value: "chars", label: "Characters" },
          { value: "words", label: "Words" },
          { value: "lines", label: "Lines" },
        ]}
        mode={mode}
        onModeChange={(m) => setMode(m as Mode)}
        live
        emptyHint="Enter text above — the reversed result updates automatically."
        onRun={(input) => reverseText(input, mode)}
      />
    </div>
  );
}
