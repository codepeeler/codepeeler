"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { NumberField, SelectField } from "@/components/tools/FormFields";

const SEPARATORS: { value: string; label: string }[] = [
  { value: "\\n", label: "New line" },
  { value: " ", label: "Space" },
  { value: ",", label: "Comma" },
  { value: "", label: "None" },
];

export default function TextRepeaterPage() {
  const [count, setCount] = useState(5);
  const [separator, setSeparator] = useState("\\n");

  const run = (input: string): string => {
    const sep = separator === "\\n" ? "\n" : separator;
    return Array.from({ length: Math.min(count, 1000) }, () => input).join(sep);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="×N"
        title="Text Repeater"
        desc="Repeat a word, line, or block of text N times, joined by a separator of your choice."
      />
      <ToolLab
        inputLabel="Text"
        outputLabel="Repeated"
        placeholder="Hello!"
        live
        recalcKey={`${count}-${separator}`}
        emptyHint="Enter text above — it repeats automatically."
        settingsSlot={
          <>
            <NumberField label="Repeat" min={1} max={1000} value={count} onChange={setCount} suffix="times" />
            <SelectField label="Separator" value={separator} onChange={setSeparator} options={SEPARATORS} />
          </>
        }
        onRun={(input) => run(input)}
      />
    </div>
  );
}
