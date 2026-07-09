"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { CheckboxOption } from "@/components/tools/FormFields";

export default function RemoveEmptyLinesPage() {
  const [treatWhitespaceAsEmpty, setTreatWhitespaceAsEmpty] = useState(true);

  const run = (input: string): string => {
    const lines = input.split(/\r\n|\r|\n/);
    const out = lines.filter((l) => (treatWhitespaceAsEmpty ? l.trim() !== "" : l !== ""));
    return out.join("\n");
  };

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="⌫"
        title="Remove Empty Lines"
        desc="Strip blank lines from text — optionally treating whitespace-only lines as empty too."
      />
      <ToolLab
        inputLabel="Text"
        outputLabel="Cleaned"
        placeholder={"line one\n\nline two\n   \nline three"}
        live
        recalcKey={treatWhitespaceAsEmpty ? 1 : 0}
        emptyHint="Paste text with blank lines above."
        settingsSlot={
          <CheckboxOption
            label="Treat whitespace-only lines as empty"
            checked={treatWhitespaceAsEmpty}
            onChange={setTreatWhitespaceAsEmpty}
          />
        }
        onRun={(input) => run(input)}
      />
    </div>
  );
}
