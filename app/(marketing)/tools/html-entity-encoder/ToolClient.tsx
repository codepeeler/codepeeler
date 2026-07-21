"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

type Direction = "encode" | "decode";

const HTML_ENTITY_MAP: [string, string][] = [
  ["&", "&amp;"], ["<", "&lt;"], [">", "&gt;"], ['"', "&quot;"], ["'", "&#39;"],
];

function htmlEntityEncode(input: string): string {
  let out = input;
  for (const [ch, ent] of HTML_ENTITY_MAP) out = out.split(ch).join(ent);
  return out;
}

function htmlEntityDecode(input: string): string {
  let out = input;
  for (const [ch, ent] of [...HTML_ENTITY_MAP].reverse()) out = out.split(ent).join(ch);
  out = out.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
  out = out.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  return out;
}

export default function HtmlEntityEncoderPage() {
  const [mode, setMode] = useState<Direction>("encode");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="encode"
        badge="&;"
        title="HTML Entity Encode/Decode"
        desc="Escape special characters for safe HTML output, or decode entities back to plain text."
      />
      <ToolLab
        inputLabel={mode === "encode" ? "Text" : "HTML"}
        outputLabel={mode === "encode" ? "HTML" : "Text"}
        placeholder={mode === "encode" ? 'e.g. <b>Tom & Jerry</b>' : "e.g. &lt;b&gt;Tom &amp; Jerry&lt;/b&gt;"}
        modes={[
          { value: "encode", label: "Encode" },
          { value: "decode", label: "Decode" },
        ]}
        mode={mode}
        onModeChange={(m) => setMode(m as Direction)}
        live
        recalcKey={mode}
        emptyHint="Enter text above, choose a mode — the result updates automatically."
        onRun={(input) => (mode === "encode" ? htmlEntityEncode(input) : htmlEntityDecode(input))}
      />
    </div>
  );
}
