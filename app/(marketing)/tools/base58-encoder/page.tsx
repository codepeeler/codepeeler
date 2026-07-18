"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

const B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function base58Encode(input: string): string {
  if (!input) throw new Error("Enter text to encode");
  const bytes = new TextEncoder().encode(input);
  let num = 0n;
  for (const b of bytes) num = num * 256n + BigInt(b);
  let out = "";
  while (num > 0n) {
    const rem = num % 58n;
    out = B58_ALPHABET[Number(rem)] + out;
    num /= 58n;
  }
  let leadingZeros = 0;
  for (const b of bytes) {
    if (b === 0) leadingZeros++;
    else break;
  }
  return B58_ALPHABET[0].repeat(leadingZeros) + out;
}

function base58Decode(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Enter Base58 text to decode");
  let num = 0n;
  for (const ch of trimmed) {
    const idx = B58_ALPHABET.indexOf(ch);
    if (idx === -1) throw new Error(`"${ch}" is not a valid Base58 character`);
    num = num * 58n + BigInt(idx);
  }
  const bytes: number[] = [];
  while (num > 0n) {
    bytes.unshift(Number(num % 256n));
    num /= 256n;
  }
  let leadingOnes = 0;
  for (const ch of trimmed) {
    if (ch === B58_ALPHABET[0]) leadingOnes++;
    else break;
  }
  const finalBytes = [...Array(leadingOnes).fill(0), ...bytes];
  return new TextDecoder().decode(new Uint8Array(finalBytes));
}

export default function Base58EncoderPage() {
  const [mode, setMode] = useState("encode");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="encode"
        badge="58"
        title="Base58 Encode/Decode"
        desc="Encode and decode text using the Bitcoin Base58 alphabet — avoids visually ambiguous characters like 0, O, I, and l."
      />
      <ToolLab
        inputLabel={mode === "encode" ? "Text" : "Base58"}
        outputLabel={mode === "encode" ? "Base58" : "Text"}
        placeholder={mode === "encode" ? "Type or paste text..." : "e.g. JxF12TrwUP45BMd"}
        modes={[
          { value: "encode", label: "Encode" },
          { value: "decode", label: "Decode" },
        ]}
        mode={mode}
        onModeChange={setMode}
        live
        recalcKey={mode}
        emptyHint="Enter text above, choose a mode — the result updates automatically."
        onRun={(input) => (mode === "encode" ? base58Encode(input) : base58Decode(input))}
      />
    </div>
  );
}
