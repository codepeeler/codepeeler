"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function csvToJson(input: string): string {
  const lines = input.trim().split(/\r\n|\r|\n/).filter(Boolean);
  if (lines.length === 0) return "[]";
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
  return JSON.stringify(rows, null, 2);
}

export default function CsvToJsonPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="◫"
        title="CSV to JSON"
        desc="Convert comma-separated values into a clean, formatted JSON array — first row is treated as the header."
      />
      <ToolLab
        inputLabel="CSV"
        outputLabel="JSON"
        placeholder={"name,age,city\nAyesha,29,Mumbai\nRohan,34,Pune"}
        live
        emptyHint="Paste CSV above, first row is used as column headers."
        onRun={(input) => csvToJson(input)}
      />
    </div>
  );
}
