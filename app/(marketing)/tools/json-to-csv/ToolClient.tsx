"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function csvEscapeVal(val: unknown): string {
  const s = val === null || val === undefined ? "" : typeof val === "object" ? JSON.stringify(val) : String(val);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function jsonToCsvConvert(input: string): string {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    throw new Error("Enter valid JSON");
  }
  const arr = Array.isArray(data) ? data : [data];
  if (!arr.length) throw new Error("JSON array is empty");
  const columns = Array.from(
    new Set(arr.flatMap((row) => (row && typeof row === "object" ? Object.keys(row as object) : ["value"])))
  );
  const lines = [columns.map(csvEscapeVal).join(",")];
  for (const row of arr) {
    const obj: Record<string, unknown> =
      row && typeof row === "object" ? (row as Record<string, unknown>) : { value: row };
    lines.push(columns.map((c) => csvEscapeVal(obj[c])).join(","));
  }
  return lines.join("\n");
}

export default function JsonToCsvPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="CSV"
        title="JSON to CSV"
        desc="Convert a JSON array of objects into CSV rows — columns are inferred automatically from all keys."
      />
      <ToolLab
        inputLabel="JSON"
        outputLabel="CSV"
        placeholder={`[\n  { "name": "Ada", "age": 30 },\n  { "name": "Grace", "age": 45 }\n]`}
        live
        emptyHint="Paste a JSON array above — the CSV updates automatically."
        onRun={(input) => jsonToCsvConvert(input)}
      />
    </div>
  );
}
