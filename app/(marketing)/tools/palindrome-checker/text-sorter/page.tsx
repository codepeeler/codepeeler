"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { CheckboxOption } from "@/components/tools/FormFields";

type SortKey = "alpha" | "alpha-desc" | "length" | "length-desc" | "numeric" | "reverse-order";

function sortLines(input: string, key: SortKey, caseSensitive: boolean, dedupe: boolean): string {
  let lines = input.split(/\r\n|\r|\n/);

  switch (key) {
    case "alpha":
      lines = lines.sort((a, b) => (caseSensitive ? a.localeCompare(b) : a.toLowerCase().localeCompare(b.toLowerCase())));
      break;
    case "alpha-desc":
      lines = lines.sort((a, b) => (caseSensitive ? b.localeCompare(a) : b.toLowerCase().localeCompare(a.toLowerCase())));
      break;
    case "length":
      lines = lines.sort((a, b) => a.length - b.length);
      break;
    case "length-desc":
      lines = lines.sort((a, b) => b.length - a.length);
      break;
    case "numeric":
      lines = lines.sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0));
      break;
    case "reverse-order":
      lines = lines.reverse();
      break;
  }

  if (dedupe) {
    const seen = new Set<string>();
    lines = lines.filter((l) => {
      const key = caseSensitive ? l : l.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return lines.join("\n");
}

const MODES = [
  { value: "alpha", label: "A → Z" },
  { value: "alpha-desc", label: "Z → A" },
  { value: "length", label: "Shortest first" },
  { value: "length-desc", label: "Longest first" },
  { value: "numeric", label: "Numeric" },
  { value: "reverse-order", label: "Reverse order" },
];

export default function TextSorterPage() {
  const [mode, setMode] = useState<SortKey>("alpha");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [dedupe, setDedupe] = useState(false);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="↕"
        title="Text Sorter"
        desc="Sort lines alphabetically, numerically, by length, or reverse their order — with optional dedupe."
      />
      <ToolLab
        inputLabel="Lines"
        outputLabel="Sorted"
        placeholder={"banana\napple\ncherry"}
        modes={MODES}
        mode={mode}
        onModeChange={(m) => setMode(m as SortKey)}
        recalcKey={`${caseSensitive}-${dedupe}`}
        live
        emptyHint="Enter one item per line above."
        settingsSlot={
          <>
            <CheckboxOption label="Case-sensitive" checked={caseSensitive} onChange={setCaseSensitive} />
            <CheckboxOption label="Remove duplicates" checked={dedupe} onChange={setDedupe} />
          </>
        }
        onRun={(input) => sortLines(input, mode, caseSensitive, dedupe)}
      />
    </div>
  );
}
