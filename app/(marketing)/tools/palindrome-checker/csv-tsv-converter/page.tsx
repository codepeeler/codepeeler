"use client";

import { useState } from "react";
import Papa from "papaparse";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

export default function CsvTsvConverterPage() {
  const [mode, setMode] = useState("csv-tsv");

  const run = (input: string): string => {
    const fromDelim = mode === "csv-tsv" ? "," : "\t";
    const toDelim = mode === "csv-tsv" ? "\t" : ",";
    const parsed = Papa.parse<string[]>(input.trim(), { delimiter: fromDelim, skipEmptyLines: true });
    if (parsed.errors.length > 0) throw new Error(parsed.errors[0].message);
    return Papa.unparse(parsed.data, { delimiter: toDelim });
  };

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="⇥"
        title="CSV ↔ TSV Converter"
        desc="Convert comma-separated values to tab-separated (and back), respecting quoted fields."
      />
      <ToolLab
        inputLabel={mode === "csv-tsv" ? "CSV" : "TSV"}
        outputLabel={mode === "csv-tsv" ? "TSV" : "CSV"}
        placeholder={mode === "csv-tsv" ? "name,age,city\nAyesha,29,Mumbai" : "name\tage\tcity\nAyesha\t29\tMumbai"}
        modes={[
          { value: "csv-tsv", label: "CSV → TSV" },
          { value: "tsv-csv", label: "TSV → CSV" },
        ]}
        mode={mode}
        onModeChange={setMode}
        recalcKey={mode}
        live
        emptyHint="Paste data above matching the selected input format."
        onRun={(input) => run(input)}
      />
    </div>
  );
}
