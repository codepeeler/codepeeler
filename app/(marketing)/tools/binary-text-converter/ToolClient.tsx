"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

type Direction = "encode" | "decode";

function binaryEncode(input: string): string {
  return Array.from(new TextEncoder().encode(input))
    .map((b) => b.toString(2).padStart(8, "0"))
    .join(" ");
}

function binaryDecode(input: string): string {
  const clean = input.trim().split(/\s+/).filter(Boolean);
  if (clean.length === 0 || clean.some((b) => !/^[01]{1,8}$/.test(b))) {
    throw new Error("Enter valid 8-bit binary groups, e.g. 01001000 01101001");
  }
  const bytes = new Uint8Array(clean.map((b) => parseInt(b, 2)));
  return new TextDecoder().decode(bytes);
}

export default function BinaryTextConverterPage() {
  const [mode, setMode] = useState<Direction>("encode");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="encode"
        badge="01"
        title="Binary ⇄ Text Converter"
        desc="Convert text to space-separated 8-bit binary bytes, and back — runs entirely in your browser."
      />
      <ToolLab
        inputLabel={mode === "encode" ? "Text" : "Binary"}
        outputLabel={mode === "encode" ? "Binary" : "Text"}
        placeholder={mode === "encode" ? "Type or paste text..." : "e.g. 01001000 01101001"}
        modes={[
          { value: "encode", label: "Encode" },
          { value: "decode", label: "Decode" },
        ]}
        mode={mode}
        onModeChange={(m) => setMode(m as Direction)}
        live
        recalcKey={mode}
        emptyHint="Enter text above, choose a mode — the result updates automatically."
        onRun={(input) => (mode === "encode" ? binaryEncode(input) : binaryDecode(input))}
      />
    </div>
  );
}
