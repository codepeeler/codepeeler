"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function formatGraphQL(input: string): string {
  if (!input.trim()) throw new Error("Paste a GraphQL query");
  let depth = 0;
  const lines: string[] = [];
  let current = "";
  const flush = () => {
    const trimmed = current.trim();
    if (trimmed) lines.push("  ".repeat(depth) + trimmed);
    current = "";
  };
  for (const ch of input.replace(/\s+/g, " ").trim()) {
    if (ch === "{") {
      current += " {";
      flush();
      depth++;
    } else if (ch === "}") {
      flush();
      depth = Math.max(0, depth - 1);
      lines.push("  ".repeat(depth) + "}");
    } else {
      current += ch;
    }
  }
  flush();
  return lines.filter(Boolean).join("\n");
}

function minifyGraphQL(input: string): string {
  if (!input.trim()) throw new Error("Paste a GraphQL query");
  return input.replace(/\s+/g, " ").replace(/\s*([{}():,])\s*/g, "$1").trim();
}

export default function GraphqlFormatterPage() {
  const [mode, setMode] = useState("format");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="gql"
        title="GraphQL Formatter / Minifier"
        desc="Pretty-print a GraphQL query for readability, or collapse it to one line for network requests."
      />
      <ToolLab
        inputLabel="GraphQL query"
        outputLabel={mode === "format" ? "Formatted" : "Minified"}
        placeholder={`query { user(id: 1) { name email posts { title } } }`}
        modes={[
          { value: "format", label: "Format" },
          { value: "minify", label: "Minify" },
        ]}
        mode={mode}
        onModeChange={setMode}
        live
        recalcKey={mode}
        emptyHint="Paste a GraphQL query above — the result updates automatically."
        onRun={(input) => (mode === "format" ? formatGraphQL(input) : minifyGraphQL(input))}
      />
    </div>
  );
}
