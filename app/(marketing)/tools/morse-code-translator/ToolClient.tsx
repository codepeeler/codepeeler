"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

type Direction = "encode" | "decode";

const MORSE_MAP: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..", "0": "-----", "1": ".----", "2": "..---", "3": "...--",
  "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.",
  "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-",
  "+": ".-.-.", "-": "-....-", "_": "..--.-", '"': ".-..-.", "$": "...-..-", "@": ".--.-.",
};
const MORSE_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([k, v]) => [v, k])
);

function morseEncode(input: string): string {
  return input
    .toUpperCase()
    .split(" ")
    .map((word) =>
      word
        .split("")
        .map((ch) => {
          const code = MORSE_MAP[ch];
          if (!code) throw new Error(`No Morse mapping for "${ch}"`);
          return code;
        })
        .join(" ")
    )
    .join(" / ");
}

function morseDecode(input: string): string {
  const clean = input.trim();
  if (!clean) throw new Error("Enter Morse code, e.g. .... . .-.. .-.. ---");
  return clean
    .split(" / ")
    .map((word) =>
      word
        .trim()
        .split(/\s+/)
        .map((code) => {
          const ch = MORSE_REVERSE[code];
          if (!ch) throw new Error(`Unrecognized Morse token "${code}"`);
          return ch;
        })
        .join("")
    )
    .join(" ");
}

export default function MorseCodeTranslatorPage() {
  const [mode, setMode] = useState<Direction>("encode");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="encode"
        badge="•—"
        title="Morse Code Translator"
        desc="Encode text to Morse code, or decode Morse back to text — words separated by ' / '."
      />
      <ToolLab
        inputLabel={mode === "encode" ? "Text" : "Morse Code"}
        outputLabel={mode === "encode" ? "Morse Code" : "Text"}
        placeholder={mode === "encode" ? "Type or paste text..." : "e.g. .... . .-.. .-.. ---"}
        modes={[
          { value: "encode", label: "Encode" },
          { value: "decode", label: "Decode" },
        ]}
        mode={mode}
        onModeChange={(m) => setMode(m as Direction)}
        live
        recalcKey={mode}
        emptyHint="Enter text above, choose a mode — the result updates automatically."
        onRun={(input) => (mode === "encode" ? morseEncode(input) : morseDecode(input))}
      />
    </div>
  );
}
