"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import ModeToggle from "@/components/tools/ModeToggle";
import { NumberField, CheckboxOption } from "@/components/tools/FormFields";
import { runTransform, type CssMode } from "@/lib/transforms";

export default function CssFormatterPage() {
  const [mode, setMode] = useState<CssMode>("format");
  const [indent, setIndent] = useState(2);
  const [removeComments, setRemoveComments] = useState(true);

  const run = async (input: string): Promise<string> => {
    return runTransform("css-format", input, {
      cssMode: mode,
      cssIndent: indent,
      cssRemoveComments: removeComments,
    });
  };

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="{ }"
        title="CSS Formatter / Minify"
        desc="Beautify messy CSS into cleanly indented rules — or strip it down to a single compact line for production. Handles nested at-rules like @media and @supports."
      />
      <ToolLab
        inputLabel="Raw CSS"
        outputLabel={mode === "format" ? "Formatted CSS" : "Minified CSS"}
        placeholder={".card{display:flex;padding:16px;border-radius:8px}.card:hover{box-shadow:0 2px 8px rgba(0,0,0,.1)}"}
        live
        recalcKey={`${mode}-${indent}-${removeComments}`}
        emptyHint="Paste CSS above to format or minify it."
        settingsSlot={
          <>
            <ModeToggle
              options={[
                { value: "format", label: "Format" },
                { value: "minify", label: "Minify" },
              ]}
              value={mode}
              onChange={(m) => setMode(m as CssMode)}
            />
            {mode === "format" ? (
              <NumberField label="Indent" min={1} max={8} value={indent} onChange={setIndent} width="w-14" />
            ) : (
              <CheckboxOption label="Remove comments" checked={removeComments} onChange={setRemoveComments} />
            )}
          </>
        }
        onRun={run}
      />
    </div>
  );
}
