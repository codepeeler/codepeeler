"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function parseCsvLineForMd(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') inQuotes = false;
      else cur += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") {
        result.push(cur);
        cur = "";
      } else cur += c;
    }
  }
  result.push(cur);
  return result;
}

function csvToMarkdownTable(input: string): string {
  const lines = input.trim().split("\n").filter((l) => l.trim());
  if (lines.length < 1) throw new Error("Paste CSV content");
  const rows = lines.map(parseCsvLineForMd);
  const header = rows[0];
  const body = rows.slice(1);
  const out = [`| ${header.join(" | ")} |`, `| ${header.map(() => "---").join(" | ")} |`, ...body.map((r) => `| ${r.join(" | ")} |`)];
  return out.join("\n");
}

export default function CsvToMarkdownTablePage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="|--|"
        title="CSV to Markdown Table"
        desc="Paste CSV data and get a ready-to-paste Markdown table — handy for READMEs and docs."
      />
      <ToolLab
        inputLabel="CSV"
        outputLabel="Markdown table"
        placeholder={`name,age\nAda,30\nGrace,45`}
        live
        emptyHint="Paste CSV content above — the Markdown table updates automatically."
        onRun={(input) => csvToMarkdownTable(input)}
      />
    </div>
  );
}
