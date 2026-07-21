"use client";

import { useMemo, useState } from "react";
import { JSONPath } from "jsonpath-plus";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import FieldBox from "@/components/tools/FieldBox";
import { PanelToolbar, PanelBody, PanelFooter } from "@/components/tools/PanelParts";
import { OutlineButton } from "@/components/tools/Buttons";

const SAMPLE_JSON = `{
  "store": {
    "books": [
      { "title": "Refactoring", "price": 45, "author": "Fowler" },
      { "title": "Clean Code", "price": 35, "author": "Martin" },
      { "title": "DDD", "price": 55, "author": "Evans" }
    ]
  }
}`;

export default function JsonPathTesterPage() {
  const [json, setJson] = useState("");
  const [path, setPath] = useState("$.store.books[?(@.price < 50)].title");

  const { result, error } = useMemo(() => {
    if (!json.trim()) return { result: null, error: null };
    try {
      const data = JSON.parse(json);
      const res = JSONPath({ path: path || "$", json: data });
      return { result: res, error: null };
    } catch (e) {
      return { result: null, error: e instanceof Error ? e.message : "Invalid JSON or path" };
    }
  }, [json, path]);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="$."
        title="JSONPath Tester"
        desc="Query JSON with JSONPath expressions and see matches update live — supports filters, wildcards, and recursive descent."
      />

      <ToolPanel>
        <PanelToolbar>
          <div className="flex max-w-[560px] flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-3 py-2">
            <span className="font-[family-name:var(--font-mono)] text-[var(--text-faint)]">$</span>
            <input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              spellCheck={false}
              placeholder="$.store.books[*].title"
              className="flex-1 bg-transparent font-[family-name:var(--font-mono)] text-[13px] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </div>
          <OutlineButton onClick={() => setJson(SAMPLE_JSON)}>Load sample</OutlineButton>
        </PanelToolbar>

        <PanelBody className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <FieldBox label="JSON" height="260px">
            <textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              spellCheck={false}
              placeholder='{"store": {"books": [...]}}'
              className="h-full w-full resize-none bg-transparent p-3 font-[family-name:var(--font-mono)] text-[13px] leading-[1.55] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </FieldBox>
          <FieldBox label="Matches" height="260px" right={Array.isArray(result) ? <span className="text-[11.5px] text-[var(--text-faint)]">{result.length}</span> : undefined}>
            <pre className="h-full overflow-auto whitespace-pre-wrap break-words p-3 font-[family-name:var(--font-mono)] text-[13px] leading-[1.55] text-[var(--text)]">
              {result !== null ? JSON.stringify(result, null, 2) : ""}
            </pre>
          </FieldBox>
        </PanelBody>

        <PanelFooter tone={error ? "danger" : "muted"}>
          {error ?? (json.trim() ? `${Array.isArray(result) ? result.length : 0} match(es) found` : "Paste JSON above and try the sample path.")}
        </PanelFooter>
      </ToolPanel>
    </div>
  );
}
