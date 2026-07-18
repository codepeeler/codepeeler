"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function base36Encode(input: string): string {
  if (!input) throw new Error("Enter text to encode");
  const bytes = new TextEncoder().encode(input);
  let num = 0n;
  for (const b of bytes) num = num * 256n + BigInt(b);
  return num.toString(36);
}

function base36Decode(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed || !/^[0-9a-z]+$/.test(trimmed)) throw new Error("Enter valid Base36 text (0-9, a-z)");
  let num = 0n;
  for (const ch of trimmed) num = num * 36n + BigInt(parseInt(ch, 36));
  const bytes: number[] = [];
  while (num > 0n) {
    bytes.unshift(Number(num % 256n));
    num /= 256n;
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

export default function Base36EncodeDecodePage() {
  const [mode, setMode] = useState("encode");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="encode"
        badge="36"
        title="Base36 Encode/Decode"
        desc="Encode and decode text using Base36 — digits 0-9 and lowercase letters a-z, handy for compact IDs."
      />
      <ToolLab
        inputLabel={mode === "encode" ? "Text" : "Base36"}
        outputLabel={mode === "encode" ? "Base36" : "Text"}
        placeholder={mode === "encode" ? "Type or paste text..." : "e.g. 4evgt"}
        modes={[
          { value: "encode", label: "Encode" },
          { value: "decode", label: "Decode" },
        ]}
        mode={mode}
        onModeChange={setMode}
        live
        recalcKey={mode}
        emptyHint="Enter text above, choose a mode — the result updates automatically."
        onRun={(input) => (mode === "encode" ? base36Encode(input) : base36Decode(input))}
      />
    </div>
  );
}
