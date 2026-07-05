"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

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
            <label className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-dim)]">
              Indent
              <select
                value={indent}
                onChange={(e) => setIndent(Number(e.target.value))}
                className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[12.5px] text-[var(--text)]"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={0}>Tab</option>
              </select>
            </label>
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
