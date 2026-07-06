"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import FieldBox from "@/components/tools/FieldBox";
import { PanelBody, PanelFooter } from "@/components/tools/PanelParts";

export default function CsvDiffPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const { headers, rowsA, rowsB, error } = useMemo(() => {
    if (!left.trim() || !right.trim()) return { headers: [] as string[], rowsA: [], rowsB: [], error: null };
    const a = Papa.parse<Record<string, string>>(left.trim(), { header: true, skipEmptyLines: true });
    const b = Papa.parse<Record<string, string>>(right.trim(), { header: true, skipEmptyLines: true });
    if (a.errors.length > 0) return { headers: [], rowsA: [], rowsB: [], error: a.errors[0].message };
    if (b.errors.length > 0) return { headers: [], rowsA: [], rowsB: [], error: b.errors[0].message };
    const headers = Array.from(new Set([...(a.meta.fields ?? []), ...(b.meta.fields ?? [])]));
    return { headers, rowsA: a.data, rowsB: b.data, error: null };
  }, [left, right]);

  const maxRows = Math.max(rowsA.length, rowsB.length);
  let changedCells = 0;

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="⇅"
        title="CSV Diff"
        desc="Compare two CSVs row by row and cell by cell — changed values are highlighted, missing rows are flagged."
      />

      <ToolPanel>
        <PanelBody className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <FieldBox label="Left CSV" height="140px">
            <textarea
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              spellCheck={false}
              placeholder={"name,age\nAyesha,29"}
              className="h-full w-full resize-none bg-transparent p-3 font-[family-name:var(--font-mono)] text-[13px] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </FieldBox>
          <FieldBox label="Right CSV" height="140px">
            <textarea
              value={right}
              onChange={(e) => setRight(e.target.value)}
              spellCheck={false}
              placeholder={"name,age\nAyesha,30"}
              className="h-full w-full resize-none bg-transparent p-3 font-[family-name:var(--font-mono)] text-[13px] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </FieldBox>
        </PanelBody>

        <div className="overflow-auto border-t border-[var(--border-soft)] p-4">
          {error ? (
            <p className="text-[13px] text-[var(--danger)]">{error}</p>
          ) : headers.length === 0 ? (
            <p className="text-[13px] text-[var(--text-faint)]">Paste two CSVs above (with headers) to compare them.</p>
          ) : (
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  <th className="border-b border-[var(--border)] px-3 py-2 text-left text-[var(--text-faint)]">Row</th>
                  {headers.map((h) => (
                    <th key={h} className="border-b border-[var(--border)] px-3 py-2 text-left font-semibold text-[var(--text-dim)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: maxRows }, (_, i) => {
                  const a = rowsA[i];
                  const b = rowsB[i];
                  const missing = !a || !b;
                  return (
                    <tr key={i} className={missing ? "bg-[color-mix(in_srgb,var(--warning)_10%,transparent)]" : ""}>
                      <td className="whitespace-nowrap border-b border-[var(--border-soft)] px-3 py-2 text-[var(--text-faint)]">{i + 1}</td>
                      {headers.map((h) => {
                        const av = a?.[h] ?? "";
                        const bv = b?.[h] ?? "";
                        const changed = !missing && av !== bv;
                        if (changed) changedCells++;
                        return (
                          <td
                            key={h}
                            className={
                              "whitespace-nowrap border-b border-[var(--border-soft)] px-3 py-2 " +
                              (changed ? "bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] text-[var(--text)]" : "text-[var(--text)]")
                            }
                            title={changed ? `${av} → ${bv}` : undefined}
                          >
                            {missing ? (!a ? "— (added)" : "— (removed)") : changed ? `${av} → ${bv}` : av}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {headers.length > 0 && (
          <PanelFooter>
            {maxRows} rows compared · {changedCells} cell{changedCells === 1 ? "" : "s"} changed
          </PanelFooter>
        )}
      </ToolPanel>
    </div>
  );
}
