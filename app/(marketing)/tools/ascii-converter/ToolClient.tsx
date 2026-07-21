"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function asciiEncode(input: string): string {
  if (!input) throw new Error("Enter text to convert");
  return Array.from(input)
    .map((c) => c.codePointAt(0))
    .join(" ");
}

function asciiDecode(input: string): string {
  const parts = input.trim().split(/[\s,]+/).filter(Boolean);
  if (!parts.length) throw new Error("Enter ASCII/Unicode codes separated by spaces");
  return parts
    .map((p) => {
      const n = Number(p);
      if (isNaN(n)) throw new Error(`"${p}" isn't a valid code`);
      return String.fromCodePoint(n);
    })
    .join("");
}

export default function AsciiConverterPage() {
  const [mode, setMode] = useState("encode");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="encode"
        badge="AS"
        title="ASCII ⇄ Text Converter"
        desc="Convert text to decimal character codes, or decode a list of codes back to text."
      />
      <ToolLab
        inputLabel={mode === "encode" ? "Text" : "Codes"}
        outputLabel={mode === "encode" ? "Codes" : "Text"}
        placeholder={mode === "encode" ? "Hello, world!" : "72 101 108 108 111"}
        modes={[
          { value: "encode", label: "Encode" },
          { value: "decode", label: "Decode" },
        ]}
        mode={mode}
        onModeChange={setMode}
        live
        recalcKey={mode}
        emptyHint="Enter text above, choose a mode — the result updates automatically."
        onRun={(input) => (mode === "encode" ? asciiEncode(input) : asciiDecode(input))}
      />
    </div>
  );
}
