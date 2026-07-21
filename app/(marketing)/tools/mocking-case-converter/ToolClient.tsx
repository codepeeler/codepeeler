"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function mockingCase(input: string): string {
  if (!input) throw new Error("Enter text to convert");
  let upper = false;
  return Array.from(input)
    .map((ch) => {
      if (!/[a-zA-Z]/.test(ch)) return ch;
      const out = upper ? ch.toUpperCase() : ch.toLowerCase();
      upper = !upper;
      return out;
    })
    .join("");
}

export default function MockingCaseConverterPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="Aa"
        title="Mocking Case Converter"
        desc="tHe cLaSsIc aLtErNaTiNg cAsE meme text, generated instantly — great for sarcastic replies."
      />
      <ToolLab
        inputLabel="Text"
        outputLabel="mOcKiNg cAsE"
        placeholder="Type or paste text..."
        live
        emptyHint="Enter text above — the mocking case version updates automatically."
        onRun={(input) => mockingCase(input)}
      />
    </div>
  );
}
