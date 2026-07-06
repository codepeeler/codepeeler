"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { CheckboxOption } from "@/components/tools/FormFields";

export default function RemoveDuplicateLinesPage() {
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [trimBeforeCompare, setTrimBeforeCompare] = useState(true);

  const run = (input: string): string => {
    const lines = input.split(/\r\n|\r|\n/);
    const seen = new Set<string>();
    const out: string[] = [];
    for (const line of lines) {
      let key = trimBeforeCompare ? line.trim() : line;
      if (!caseSensitive) key = key.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(line);
    }
    return out.join("\n");
  };

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="≠="
        title="Remove Duplicate Lines"
        desc="Strip repeated lines from a block of text while preserving the original order of first occurrence."
      />
      <ToolLab
        inputLabel="Text"
        outputLabel="Unique lines"
        placeholder={"apple\nbanana\napple\ncherry"}
        live
        recalcKey={`${caseSensitive}-${trimBeforeCompare}`}
        emptyHint="Enter one item per line above."
        settingsSlot={
          <>
            <CheckboxOption label="Case-sensitive" checked={caseSensitive} onChange={setCaseSensitive} />
            <CheckboxOption label="Ignore leading/trailing spaces" checked={trimBeforeCompare} onChange={setTrimBeforeCompare} />
          </>
        }
        onRun={(input) => run(input)}
      />
    </div>
  );
}
