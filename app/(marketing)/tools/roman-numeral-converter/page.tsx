"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

type RomanDirection = "toRoman" | "toNumber";

const ROMAN_MAP: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

function toRoman(num: number): string {
  if (!Number.isInteger(num) || num < 1 || num > 3999) {
    throw new Error("Enter a whole number between 1 and 3999");
  }
  let result = "";
  let n = num;
  for (const [value, symbol] of ROMAN_MAP) {
    while (n >= value) {
      result += symbol;
      n -= value;
    }
  }
  return result;
}

function fromRoman(str: string): number {
  const clean = str.trim().toUpperCase();
  if (!/^[MDCLXVI]+$/.test(clean)) throw new Error("Enter valid Roman numerals (M, D, C, L, X, V, I)");
  const values: Record<string, number> = { M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1 };
  let total = 0;
  for (let i = 0; i < clean.length; i++) {
    const cur = values[clean[i]];
    const next = values[clean[i + 1]];
    if (next && cur < next) total -= cur;
    else total += cur;
  }
  if (toRoman(total) !== clean) throw new Error("That's not a valid canonical Roman numeral");
  return total;
}

function romanNumeral(input: string, direction: RomanDirection): string {
  const raw = input.trim();
  if (!raw) throw new Error("Enter a value");
  if (direction === "toRoman") return toRoman(parseInt(raw, 10));
  return String(fromRoman(raw));
}

export default function RomanNumeralConverterPage() {
  const [direction, setDirection] = useState<RomanDirection>("toRoman");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="MCM"
        title="Roman Numeral Converter"
        desc="Convert numbers to Roman numerals and back — supports values from 1 to 3999."
      />
      <ToolLab
        inputLabel={direction === "toRoman" ? "Number" : "Roman Numeral"}
        outputLabel={direction === "toRoman" ? "Roman Numeral" : "Number"}
        placeholder={direction === "toRoman" ? "e.g. 1994" : "e.g. MCMXCIV"}
        modes={[
          { value: "toRoman", label: "Number → Roman" },
          { value: "toNumber", label: "Roman → Number" },
        ]}
        mode={direction}
        onModeChange={(m) => setDirection(m as RomanDirection)}
        live
        recalcKey={direction}
        monospaceInput={false}
        emptyHint="Enter a value above, choose a direction — the result updates automatically."
        onRun={(input) => romanNumeral(input, direction)}
      />
    </div>
  );
}
