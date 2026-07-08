"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function hexEncode(input: string): string {
  return Array.from(new TextEncoder().encode(input))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");
}

function hexDecode(input: string): string {
  const clean = input.trim().replace(/0x/gi, "").replace(/\s+/g, "");
  if (clean.length === 0 || clean.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(clean)) {
    throw new Error("Enter valid hex bytes (e.g. 48 65 6c 6c 6f)");
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return new TextDecoder().decode(bytes);
}

export default function HexEncoderPage() {
  const [mode, setMode] = useState("encode");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="encode"
        badge="0x"
        title="Hex Encode/Decode"
        desc="Convert text to and from hexadecimal byte notation — runs entirely in your browser."
      />
      <ToolLab
        inputLabel={mode === "encode" ? "Text" : "Hex Bytes"}
        outputLabel={mode === "encode" ? "Hex Bytes" : "Text"}
        placeholder={mode === "encode" ? "Type or paste text..." : "e.g. 48 65 6c 6c 6f"}
        modes={[
          { value: "encode", label: "Encode" },
          { value: "decode", label: "Decode" },
        ]}
        mode={mode}
        onModeChange={setMode}
        live
        recalcKey={mode}
        emptyHint="Enter text above, choose a mode — the result updates automatically."
        onRun={(input) => (mode === "encode" ? hexEncode(input) : hexDecode(input))}
      />
    </div>
  );
}
