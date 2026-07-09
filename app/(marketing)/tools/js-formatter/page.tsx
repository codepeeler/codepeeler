"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import ModeToggle from "@/components/tools/ModeToggle";
import { NumberField, CheckboxOption } from "@/components/tools/FormFields";
import { runTransform, type JsMode } from "@/lib/transforms";

export default function JsFormatterPage() {
  const [mode, setMode] = useState<JsMode>("format");
  const [indent, setIndent] = useState(2);
  const [semi, setSemi] = useState(true);
  const [singleQuote, setSingleQuote] = useState(false);
  const [mangle, setMangle] = useState(true);

  const run = async (input: string): Promise<string> => {
    return runTransform("js-format", input, {
      jsMode: mode,
      jsIndent: indent,
      jsSemi: semi,
      jsSingleQuote: singleQuote,
      jsMangle: mangle,
    });
  };

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="JS"
        title="JS Formatter / Minify"
        desc="Beautify JavaScript with Prettier, or minify it with Terser — real compression including variable renaming and dead-code elimination, not just whitespace removal."
      />
      <ToolLab
        inputLabel="Raw JavaScript"
        outputLabel={mode === "format" ? "Formatted JS" : "Minified JS"}
        placeholder={"function add(a, b) {\n  const sum = a + b;\n  return sum;\n}"}
        live
        recalcKey={`${mode}-${indent}-${semi}-${singleQuote}-${mangle}`}
        emptyHint="Paste JavaScript above to format or minify it."
        settingsSlot={
          <>
            <ModeToggle
              options={[
                { value: "format", label: "Format" },
                { value: "minify", label: "Minify" },
              ]}
              value={mode}
              onChange={(m) => setMode(m as JsMode)}
            />
            {mode === "format" ? (
              <>
                <NumberField label="Indent" min={1} max={8} value={indent} onChange={setIndent} width="w-14" />
                <CheckboxOption label="Semicolons" checked={semi} onChange={setSemi} />
                <CheckboxOption label="Single quotes" checked={singleQuote} onChange={setSingleQuote} />
              </>
            ) : (
              <CheckboxOption label="Mangle variable names" checked={mangle} onChange={setMangle} />
            )}
          </>
        }
        onRun={run}
      />
    </div>
  );
}
