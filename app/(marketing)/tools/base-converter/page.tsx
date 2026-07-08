"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

type BaseFrom = "bin" | "oct" | "dec" | "hex";

function baseConvert(input: string, from: BaseFrom): string {
  const trimmed = input.trim().replace(/^0[bxo]/i, "");
  if (!trimmed) throw new Error("Enter a number to convert");

  const valid = {
    bin: /^[01]+$/,
    oct: /^[0-7]+$/,
    dec: /^\d+$/,
    hex: /^[0-9a-fA-F]+$/,
  }[from];

  if (!valid.test(trimmed)) throw new Error(`That isn't a valid ${from} number`);

  const dec = BigInt(
    from === "dec" ? trimmed : `0${from === "bin" ? "b" : from === "oct" ? "o" : "x"}${trimmed}`
  );

  return [
    `Binary:  ${dec.toString(2)}`,
    `Octal:   ${dec.toString(8)}`,
    `Decimal: ${dec.toString(10)}`,
    `Hex:     ${dec.toString(16)}`,
  ].join("\n");
}

export default function BaseConverterPage() {
  const [from, setFrom] = useState<BaseFrom>("dec");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="10₂"
        title="Base Converter"
        desc="Convert numbers between binary, octal, decimal, and hexadecimal."
      />
      <ToolLab
        inputLabel={`Number (${from})`}
        outputLabel="All bases"
        placeholder={from === "dec" ? "e.g. 255" : from === "hex" ? "e.g. ff" : from === "bin" ? "e.g. 11111111" : "e.g. 377"}
        modes={[
          { value: "bin", label: "Binary" },
          { value: "oct", label: "Octal" },
          { value: "dec", label: "Decimal" },
          { value: "hex", label: "Hex" },
        ]}
        mode={from}
        onModeChange={(m) => setFrom(m as BaseFrom)}
        live
        recalcKey={from}
        emptyHint="Enter a number above, choose its base — all equivalents update automatically."
        onRun={(input) => baseConvert(input, from)}
      />
    </div>
  );
}
