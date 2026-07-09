"use client";

import { useState } from "react";
import Papa from "papaparse";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { CheckboxOption } from "@/components/tools/FormFields";

export default function CsvCleanerPage() {
  const [trimCells, setTrimCells] = useState(true);
  const [removeEmptyRows, setRemoveEmptyRows] = useState(true);
  const [removeEmptyCols, setRemoveEmptyCols] = useState(true);
  const [dedupeRows, setDedupeRows] = useState(false);

  const run = (input: string): string => {
    const parsed = Papa.parse<string[]>(input.trim(), { skipEmptyLines: false });
    if (parsed.errors.length > 0) throw new Error(parsed.errors[0].message);

    let rows = parsed.data as string[][];

    if (trimCells) rows = rows.map((r) => r.map((c) => (c ?? "").trim()));
    if (removeEmptyRows) rows = rows.filter((r) => r.some((c) => c !== ""));

    if (removeEmptyCols && rows.length > 0) {
      const colCount = Math.max(...rows.map((r) => r.length));
      const keep: number[] = [];
      for (let c = 0; c < colCount; c++) {
        if (rows.some((r) => (r[c] ?? "") !== "")) keep.push(c);
      }
      rows = rows.map((r) => keep.map((c) => r[c] ?? ""));
    }

    if (dedupeRows) {
      const seen = new Set<string>();
      rows = rows.filter((r) => {
        const key = JSON.stringify(r);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    return Papa.unparse(rows);
  };

  const recalc = [trimCells, removeEmptyRows, removeEmptyCols, dedupeRows].join(",");

  const TOGGLES: [string, boolean, (v: boolean) => void][] = [
    ["Trim whitespace in cells", trimCells, setTrimCells],
    ["Remove empty rows", removeEmptyRows, setRemoveEmptyRows],
    ["Remove empty columns", removeEmptyCols, setRemoveEmptyCols],
    ["Remove duplicate rows", dedupeRows, setDedupeRows],
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="✓"
        title="CSV Cleaner"
        desc="Trim whitespace, strip empty rows/columns, and remove duplicate rows from messy CSV data."
      />
      <ToolLab
        inputLabel="Raw CSV"
        outputLabel="Cleaned CSV"
        placeholder={"name, age ,city\nAyesha,29,Mumbai\n,,\nAyesha,29,Mumbai"}
        live
        recalcKey={recalc}
        emptyHint="Paste messy CSV above."
        settingsSlot={
          <>
            {TOGGLES.map(([label, value, setter]) => (
              <CheckboxOption key={label} label={label} checked={value} onChange={setter} />
            ))}
          </>
        }
        onRun={(input) => run(input)}
      />
    </div>
  );
}
