"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

type Direction = "encode" | "decode";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let bits = "";
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, "0");
    out += BASE32_ALPHABET[parseInt(chunk, 2)];
  }
  while (out.length % 8 !== 0) out += "=";
  return out;
}

function base32Decode(input: string): string {
  const clean = input.trim().toUpperCase().replace(/=+$/, "");
  if (!/^[A-Z2-7]*$/.test(clean) || clean.length === 0) {
    throw new Error("Enter a valid Base32 string (A-Z, 2-7)");
  }
  let bits = "";
  for (const ch of clean) {
    const idx = BASE32_ALPHABET.indexOf(ch);
    if (idx === -1) throw new Error(`Invalid Base32 character "${ch}"`);
    bits += idx.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

export default function Base32EncoderPage() {
  const [mode, setMode] = useState<Direction>("encode");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="encode"
        badge="32"
        title="Base32 Encode/Decode"
        desc="Encode text to Base32 (RFC 4648) or decode a Base32 string back to text."
      />
      <ToolLab
        inputLabel={mode === "encode" ? "Text" : "Base32"}
        outputLabel={mode === "encode" ? "Base32" : "Text"}
        placeholder={mode === "encode" ? "Type or paste text..." : "e.g. NBSWY3DP"}
        modes={[
          { value: "encode", label: "Encode" },
          { value: "decode", label: "Decode" },
        ]}
        mode={mode}
        onModeChange={(m) => setMode(m as Direction)}
        live
        recalcKey={mode}
        emptyHint="Enter text above, choose a mode — the result updates automatically."
        onRun={(input) => (mode === "encode" ? base32Encode(input) : base32Decode(input))}
      />
    </div>
  );
}
