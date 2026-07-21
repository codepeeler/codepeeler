"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import ModeToggle from "@/components/tools/ModeToggle";
import { SelectField, NumberField } from "@/components/tools/FormFields";
import { runTransform, type SqlMode, type SqlKeywordCase } from "@/lib/transforms";

export default function SqlFormatterPage() {
  const [mode, setMode] = useState<SqlMode>("format");
  const [keywordCase, setKeywordCase] = useState<SqlKeywordCase>("upper");
  const [indent, setIndent] = useState(2);

  const run = async (input: string): Promise<string> => {
    return runTransform("sql-format", input, {
      sqlMode: mode,
      sqlKeywordCase: keywordCase,
      sqlIndent: indent,
    });
  };

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="SQL"
        title="SQL Formatter / Minify"
        desc="Beautify messy SQL into readable, indented queries — or strip it down to a single compact line. Works with SELECT, INSERT, UPDATE, DELETE, JOINs and more."
      />
      <ToolLab
        inputLabel="Raw SQL"
        outputLabel={mode === "format" ? "Formatted SQL" : "Minified SQL"}
        placeholder={"select id, name, email from users where status = 'active' and created_at > '2024-01-01' order by created_at desc limit 50"}
        live
        recalcKey={`${mode}-${keywordCase}-${indent}`}
        emptyHint="Paste a SQL query above to format or minify it."
        settingsSlot={
          <>
            <ModeToggle
              options={[
                { value: "format", label: "Format" },
                { value: "minify", label: "Minify" },
              ]}
              value={mode}
              onChange={(m) => setMode(m as SqlMode)}
            />
            {mode === "format" && (
              <>
                <SelectField
                  label="Keyword case"
                  value={keywordCase}
                  onChange={(v) => setKeywordCase(v as SqlKeywordCase)}
                  options={[
                    { value: "upper", label: "UPPERCASE" },
                    { value: "lower", label: "lowercase" },
                    { value: "preserve", label: "Preserve" },
                  ]}
                />
                <NumberField label="Indent" min={1} max={8} value={indent} onChange={setIndent} width="w-14" />
              </>
            )}
          </>
        }
        onRun={run}
      />
    </div>
  );
}
