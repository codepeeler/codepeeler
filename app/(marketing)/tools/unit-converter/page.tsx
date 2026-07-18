"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { SelectField } from "@/components/tools/FormFields";

type Category = "length" | "weight" | "data";

const UNIT_FACTORS: Record<Category, Record<string, number>> = {
  length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254 },
  weight: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.45359237, oz: 0.028349523125, t: 1000 },
  data: { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4, bit: 0.125 },
};

const UNIT_LABELS: Record<string, string> = {
  m: "Meters", km: "Kilometers", cm: "Centimeters", mm: "Millimeters", mi: "Miles", yd: "Yards", ft: "Feet", in: "Inches",
  kg: "Kilograms", g: "Grams", mg: "Milligrams", lb: "Pounds", oz: "Ounces", t: "Metric tons",
  B: "Bytes", KB: "Kilobytes", MB: "Megabytes", GB: "Gigabytes", TB: "Terabytes", bit: "Bits",
};

function unitConvertValue(input: string, category: Category, from: string, to: string): string {
  const value = Number(input.trim());
  if (isNaN(value)) throw new Error("Enter a number to convert");
  const table = UNIT_FACTORS[category];
  const base = value * table[from];
  const result = base / table[to];
  return `${result.toLocaleString("en-US", { maximumFractionDigits: 8 })} ${to}`;
}

export default function UnitConverterPage() {
  const [category, setCategory] = useState<Category>("length");
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("ft");

  const units = Object.keys(UNIT_FACTORS[category]);

  const changeCategory = (c: Category) => {
    setCategory(c);
    const keys = Object.keys(UNIT_FACTORS[c]);
    setFrom(keys[0]);
    setTo(keys[1]);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="⇌"
        title="Unit Converter"
        desc="Convert between length, weight, and data-size units — all conversions run locally in your browser."
      />
      <ToolLab
        inputLabel="Value"
        outputLabel="Result"
        placeholder="e.g. 42"
        live
        recalcKey={`${category}-${from}-${to}`}
        settingsSlot={
          <>
            <SelectField
              label="Category"
              value={category}
              onChange={(v) => changeCategory(v as Category)}
              options={[
                { value: "length", label: "Length" },
                { value: "weight", label: "Weight" },
                { value: "data", label: "Data size" },
              ]}
            />
            <SelectField
              label="From"
              value={from}
              onChange={setFrom}
              options={units.map((u) => ({ value: u, label: UNIT_LABELS[u] ?? u }))}
            />
            <SelectField
              label="To"
              value={to}
              onChange={setTo}
              options={units.map((u) => ({ value: u, label: UNIT_LABELS[u] ?? u }))}
            />
          </>
        }
        emptyHint="Enter a value above — the converted result updates automatically."
        onRun={(input) => unitConvertValue(input, category, from, to)}
      />
    </div>
  );
}
