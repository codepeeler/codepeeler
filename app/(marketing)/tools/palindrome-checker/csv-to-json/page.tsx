"use client";

import { useState } from "react";
import Papa from "papaparse";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { CheckboxOption } from "@/components/tools/FormFields";

export default function CsvToJsonPage() {
  const [hasHeader, setHasHeader] = useState(true);

  const run = (input: string): string => {
    const result = Papa.parse(input.trim(), {
      header: hasHeader,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    if (result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }
    return JSON.stringify(result.data, null, 2);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="◫"
        title="CSV to JSON"
        desc="Convert CSV into a clean JSON array — handles quoted fields, embedded commas, and type detection via PapaParse."
      />
      <ToolLab
        inputLabel="CSV"
        outputLabel="JSON"
        placeholder={"name,age,city\nAyesha,29,Mumbai\nRohan,34,Pune"}
        live
        recalcKey={hasHeader ? 1 : 0}
        emptyHint="Paste CSV above."
        settingsSlot={<CheckboxOption label="First row is header" checked={hasHeader} onChange={setHasHeader} />}
        onRun={(input) => run(input)}
      />
    </div>
  );
}
