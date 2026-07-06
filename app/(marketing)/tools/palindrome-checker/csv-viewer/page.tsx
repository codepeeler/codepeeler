"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";
import { ArrowUp, ArrowDown } from "lucide-react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import FieldBox from "@/components/tools/FieldBox";
import { PanelToolbar, PanelBody, PanelFooter } from "@/components/tools/PanelParts";
import { OutlineButton } from "@/components/tools/Buttons";

const SAMPLE = "name,role,city\nAyesha,Engineer,Mumbai\nRohan,Designer,Pune\nMeera,PM,Bengaluru";

export default function CsvViewerPage() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const { headers, rows, error } = useMemo(() => {
    if (!input.trim()) return { headers: [] as string[], rows: [] as Record<string, string>[], error: null };
    const result = Papa.parse<Record<string, string>>(input.trim(), { header: true, skipEmptyLines: true });
    if (result.errors.length > 0) return { headers: [], rows: [], error: result.errors[0].message };
    return { headers: result.meta.fields ?? [], rows: result.data, error: null };
  }, [input]);

  const filteredSorted = useMemo(() => {
    let out = rows;
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
    }
    if (sortCol) {
      out = [...out].sort((a, b) => {
        const av = a[sortCol] ?? "";
        const bv = b[sortCol] ?? "";
        const cmp = isNaN(Number(av)) || isNaN(Number(bv)) ? av.localeCompare(bv) : Number(av) - Number(bv);
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return out;
  }, [rows, search, sortCol, sortDir]);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="▤"
        title="CSV Viewer"
        desc="Paste CSV and browse it as a real, sortable, searchable table — no upload, everything stays in your browser."
      />

      <ToolPanel>
        <PanelBody className="border-b border-[var(--border-soft)]">
          <FieldBox label="CSV" height="100px" right={<OutlineButton onClick={() => setInput(SAMPLE)}>Load sample</OutlineButton>}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder="name,role,city&#10;Ayesha,Engineer,Mumbai"
              className="h-full w-full resize-none bg-transparent p-3 font-[family-name:var(--font-mono)] text-[13px] leading-[1.5] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </FieldBox>
        </PanelBody>

        {headers.length > 0 && (
          <PanelToolbar className="justify-start">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rows..."
              className="w-full max-w-[280px] rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[13px] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </PanelToolbar>
        )}

        <PanelBody className="overflow-auto">
          {error ? (
            <p className="text-[13px] text-[var(--danger)]">{error}</p>
          ) : headers.length === 0 ? (
            <p className="text-[13px] text-[var(--text-faint)]">Paste CSV above to see it rendered as a table.</p>
          ) : (
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {headers.map((h) => (
                    <th
                      key={h}
                      onClick={() => toggleSort(h)}
                      className="cursor-pointer select-none whitespace-nowrap border-b border-[var(--border)] px-3 py-2 text-left font-semibold text-[var(--text-dim)] hover:text-[var(--text)]"
                    >
                      <span className="flex items-center gap-1">
                        {h}
                        {sortCol === h && (sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSorted.map((row, i) => (
                  <tr key={i} className="hover:bg-[var(--card-hover)]">
                    {headers.map((h) => (
                      <td key={h} className="whitespace-nowrap border-b border-[var(--border-soft)] px-3 py-2 text-[var(--text)]">
                        {row[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </PanelBody>

        {headers.length > 0 && (
          <PanelFooter>
            {filteredSorted.length} of {rows.length} rows
          </PanelFooter>
        )}
      </ToolPanel>
    </div>
  );
}
