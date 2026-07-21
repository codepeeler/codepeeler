"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

type Direction = "encode" | "decode";

function unicodeEscape(input: string): string {
  return Array.from(input)
    .map((ch) => {
      const cp = ch.codePointAt(0)!;
      if (cp < 128) return ch;
      return cp > 0xffff ? `\\u{${cp.toString(16)}}` : `\\u${cp.toString(16).padStart(4, "0")}`;
    })
    .join("");
}

function unicodeUnescape(input: string): string {
  return input
    .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export default function UnicodeEscapePage() {
  const [mode, setMode] = useState<Direction>("encode");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="encode"
        badge="\\u"
        title="Unicode Escape/Unescape"
        desc="Convert non-ASCII characters to \\uXXXX escapes, or unescape them back to plain text."
      />
      <ToolLab
        inputLabel={mode === "encode" ? "Text" : "Escaped Text"}
        outputLabel={mode === "encode" ? "Escaped Text" : "Text"}
        placeholder={mode === "encode" ? "e.g. héllo 世界" : "e.g. h\\u00e9llo \\u4e16\\u754c"}
        modes={[
          { value: "encode", label: "Escape" },
          { value: "decode", label: "Unescape" },
        ]}
        mode={mode}
        onModeChange={(m) => setMode(m as Direction)}
        live
        recalcKey={mode}
        emptyHint="Enter text above, choose a mode — the result updates automatically."
        onRun={(input) => (mode === "encode" ? unicodeEscape(input) : unicodeUnescape(input))}
      />
    </div>
  );
}
