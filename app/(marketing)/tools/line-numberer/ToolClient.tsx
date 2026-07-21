"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { CheckboxOption, NumberField, TextField } from "@/components/tools/FormFields";

export default function LineNumbererPage() {
  const [start, setStart] = useState(1);
  const [separator, setSeparator] = useState(". ");
  const [padZeros, setPadZeros] = useState(false);

  const run = (input: string): string => {
    const lines = input.split(/\r\n|\r|\n/);
    const width = String(lines.length + start - 1).length;
    return lines
      .map((line, i) => {
        const num = start + i;
        const label = padZeros ? String(num).padStart(width, "0") : String(num);
        return `${label}${separator}${line}`;
      })
      .join("\n");
  };

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="1."
        title="Line Numberer"
        desc="Add sequential line numbers to any block of text — custom starting number, separator, and zero-padding."
      />
      <ToolLab
        inputLabel="Text"
        outputLabel="Numbered"
        placeholder={"first line\nsecond line\nthird line"}
        live
        recalcKey={`${start}-${separator}-${padZeros}`}
        emptyHint="Paste text above to number each line."
        settingsSlot={
          <>
            <NumberField label="Start at" value={start} onChange={setStart} />
            <TextField label="Separator" value={separator} onChange={setSeparator} />
            <CheckboxOption label="Zero-pad numbers" checked={padZeros} onChange={setPadZeros} />
          </>
        }
        onRun={(input) => run(input)}
      />
    </div>
  );
}
