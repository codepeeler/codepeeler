"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function httpHeaderParse(input: string): string {
  const lines = input.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) throw new Error("Paste raw HTTP headers, one per line");

  const result: { line: string; header?: string; value?: string }[] = [];
  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx === -1) {
      result.push({ line });
      continue;
    }
    result.push({ line, header: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() });
  }

  return JSON.stringify(
    result.map((r) => (r.header ? { [r.header]: r.value } : r.line)),
    null,
    2
  );
}

export default function HttpHeaderParserPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="web"
        badge="H:"
        title="HTTP Header Parser"
        desc="Paste raw HTTP request or response headers and get them parsed into structured JSON."
      />
      <ToolLab
        inputLabel="Raw Headers"
        outputLabel="Parsed JSON"
        placeholder={"Content-Type: application/json\nAuthorization: Bearer abc123\nCache-Control: no-cache"}
        live
        emptyHint="Paste raw headers above, one per line — the parsed result updates automatically."
        onRun={(input) => httpHeaderParse(input)}
      />
    </div>
  );
}
