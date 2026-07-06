"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { SelectField } from "@/components/tools/FormFields";

export default function JsonFormatterPage() {
  const [mode, setMode] = useState("format");
  const [indent, setIndent] = useState(2);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="{ }"
        title="JSON Formatter"
        desc="Format, validate, and minify JSON — pretty-print with custom indentation or strip it down to a single line."
      />
      <ToolLab
        inputLabel="Raw JSON"
        outputLabel={mode === "format" ? "Formatted JSON" : "Minified JSON"}
        placeholder='{"hello":"world","nested":{"a":1,"b":[1,2,3]}}'
        modes={[
          { value: "format", label: "Format" },
          { value: "minify", label: "Minify" },
        ]}
        mode={mode}
        onModeChange={setMode}
        live
        recalcKey={indent}
        emptyHint="Paste some JSON above — it's validated and formatted automatically."
        settingsSlot={
          mode === "format" ? (
            <SelectField
              label="Indent"
              value={String(indent)}
              onChange={(v) => setIndent(Number(v))}
              options={[
                { value: "2", label: "2 spaces" },
                { value: "4", label: "4 spaces" },
                { value: "0", label: "Tab" },
              ]}
            />
          ) : undefined
        }
        onRun={(input) => {
          const parsed = JSON.parse(input);
          return mode === "format"
            ? JSON.stringify(parsed, null, indent === 0 ? "\t" : indent)
            : JSON.stringify(parsed);
        }}
      />
    </div>
  );
}
