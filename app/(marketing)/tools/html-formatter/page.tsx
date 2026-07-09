"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import ModeToggle from "@/components/tools/ModeToggle";
import { NumberField, CheckboxOption } from "@/components/tools/FormFields";
import { runTransform, type HtmlMode } from "@/lib/transforms";

export default function HtmlFormatterPage() {
  const [mode, setMode] = useState<HtmlMode>("format");
  const [indent, setIndent] = useState(2);
  const [collapseWhitespace, setCollapseWhitespace] = useState(true);
  const [removeComments, setRemoveComments] = useState(true);

  const run = async (input: string): Promise<string> => {
    return runTransform("html-format", input, {
      htmlMode: mode,
      htmlIndent: indent,
      htmlCollapseWhitespace: collapseWhitespace,
      htmlRemoveComments: removeComments,
    });
  };

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="<>"
        title="HTML Formatter / Minify"
        desc="Beautify messy HTML into cleanly indented markup — or strip it down to a single compact line for production. Preserves script, style, and pre content exactly as written."
      />
      <ToolLab
        inputLabel="Raw HTML"
        outputLabel={mode === "format" ? "Formatted HTML" : "Minified HTML"}
        placeholder={'<div class="card"><h2>Title</h2><p>Some text with <a href="#">a link</a>.</p></div>'}
        live
        recalcKey={`${mode}-${indent}-${collapseWhitespace}-${removeComments}`}
        emptyHint="Paste HTML above to format or minify it."
        settingsSlot={
          <>
            <ModeToggle
              options={[
                { value: "format", label: "Format" },
                { value: "minify", label: "Minify" },
              ]}
              value={mode}
              onChange={(m) => setMode(m as HtmlMode)}
            />
            {mode === "format" ? (
              <NumberField label="Indent" min={1} max={8} value={indent} onChange={setIndent} width="w-14" />
            ) : (
              <>
                <CheckboxOption label="Collapse whitespace" checked={collapseWhitespace} onChange={setCollapseWhitespace} />
                <CheckboxOption label="Remove comments" checked={removeComments} onChange={setRemoveComments} />
              </>
            )}
          </>
        }
        onRun={run}
      />
    </div>
  );
}
