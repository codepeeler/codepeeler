"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const SCALES = ["", "thousand", "million", "billion", "trillion"];

function threeDigitsToWords(n: number): string {
  const parts: string[] = [];
  if (n >= 100) {
    parts.push(ONES[Math.floor(n / 100)] + " hundred");
    n %= 100;
  }
  if (n >= 20) {
    parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : ""));
  } else if (n > 0) {
    parts.push(ONES[n]);
  }
  return parts.join(" ");
}

function numberToWords(input: string): string {
  const n = Number(input.trim().replace(/,/g, ""));
  if (!Number.isFinite(n) || !Number.isInteger(n)) throw new Error("Enter a whole number");
  if (n === 0) return "zero";
  if (Math.abs(n) >= 10 ** 15) throw new Error("Number is too large to convert");
  const negative = n < 0;
  let abs = Math.abs(n);
  const groups: string[] = [];
  let scaleIdx = 0;
  while (abs > 0) {
    const chunk = abs % 1000;
    if (chunk) groups.unshift(threeDigitsToWords(chunk) + (SCALES[scaleIdx] ? " " + SCALES[scaleIdx] : ""));
    abs = Math.floor(abs / 1000);
    scaleIdx++;
  }
  return (negative ? "negative " : "") + groups.join(" ");
}

const WORD_NUMBERS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  hundred: 100, thousand: 1000, million: 1000000, billion: 1000000000,
};

function wordsToNumber(input: string): string {
  const words = input
    .trim()
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/,/g, " ")
    .replace(/\band\b/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) throw new Error("Enter a number in words, e.g. 'one hundred twenty three'");
  let negative = false;
  if (words[0] === "negative" || words[0] === "minus") {
    negative = true;
    words.shift();
  }
  let total = 0;
  let current = 0;
  for (const w of words) {
    const val = WORD_NUMBERS[w];
    if (val === undefined) throw new Error(`"${w}" isn't a recognized number word`);
    if (val === 100) current *= val;
    else if (val >= 1000) {
      total += current * val;
      current = 0;
    } else current += val;
  }
  const result = total + current;
  return String(negative ? -result : result);
}

export default function NumberToWordsConverterPage() {
  const [mode, setMode] = useState("toWords");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="123"
        title="Number ⇄ Words Converter"
        desc="Spell out a number in English words, or parse number words back into digits."
      />
      <ToolLab
        inputLabel={mode === "toWords" ? "Number" : "Words"}
        outputLabel={mode === "toWords" ? "Words" : "Number"}
        placeholder={mode === "toWords" ? "1234" : "one thousand two hundred thirty-four"}
        modes={[
          { value: "toWords", label: "Number → Words" },
          { value: "toNumber", label: "Words → Number" },
        ]}
        mode={mode}
        onModeChange={setMode}
        live
        recalcKey={mode}
        emptyHint="Enter a value above, choose a direction — the result updates automatically."
        onRun={(input) => (mode === "toWords" ? numberToWords(input) : wordsToNumber(input))}
      />
    </div>
  );
}
