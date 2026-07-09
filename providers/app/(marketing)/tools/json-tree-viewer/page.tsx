"use client";

import { useMemo, useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import JsonTree from "@/components/tools/JsonTree";
import ToolPanel from "@/components/tools/ToolPanel";
import FieldBox from "@/components/tools/FieldBox";
import { PanelToolbar, PanelBody, PanelFooter } from "@/components/tools/PanelParts";
import { OutlineButton } from "@/components/tools/Buttons";

const SAMPLE = `{
  "name": "CodePeeler",
  "version": 1,
  "active": true,
  "tags": ["dev", "tools", "json"],
  "meta": { "author": "you", "rating": 4.9 }
}`;

export default function JsonTreeViewerPage() {
  const [input, setInput] = useState("");

  const { data, error } = useMemo(() => {
    if (!input.trim()) return { data: null, error: null };
    try {
      return { data: JSON.parse(input), error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : "Invalid JSON" };
    }
  }, [input]);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="⌂"
        title="JSON Tree Viewer"
        desc="Explore JSON as a collapsible, type-colored tree — click any object or array to expand or collapse it."
      />

      <ToolPanel>
        <PanelToolbar>
          <OutlineButton onClick={() => setInput(SAMPLE)}>Load sample</OutlineButton>
          <OutlineButton onClick={() => setInput("")}>Clear</OutlineButton>
        </PanelToolbar>

        <PanelBody className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <FieldBox label="Raw JSON" height="420px">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder='{"hello": "world"}'
              className="h-full w-full resize-none bg-transparent p-3 font-[family-name:var(--font-mono)] text-[13px] leading-[1.55] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </FieldBox>

          <FieldBox label="Tree" height="420px">
            <div className="p-2">
              {data !== null ? (
                <JsonTree data={data} />
              ) : (
                <p className="p-2 text-[13px] text-[var(--text-faint)]">
                  {input.trim() ? "Fix the JSON to see the tree." : "Paste JSON on the left to explore it here."}
                </p>
              )}
            </div>
          </FieldBox>
        </PanelBody>

        <PanelFooter tone={error ? "danger" : "muted"}>
          {error ?? (data !== null ? "Valid JSON" : "Waiting for input...")}
        </PanelFooter>
      </ToolPanel>
    </div>
  );
}
