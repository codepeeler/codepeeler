"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import ModeToggle from "@/components/tools/ModeToggle";
import { PanelToolbar, PanelBody } from "@/components/tools/PanelParts";
import { CheckboxOption, NumberField } from "@/components/tools/FormFields";
import { PrimaryButton } from "@/components/tools/Buttons";
import CopyButton from "@/components/tools/CopyButton";

const WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");

function randWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function makeSentence(startWithLorem: boolean): string {
  const len = 6 + Math.floor(Math.random() * 10);
  const words = Array.from({ length: len }, () => randWord());
  if (startWithLorem) {
    words[0] = "Lorem";
    words[1] = "ipsum";
    words[2] = "dolor";
    words[3] = "sit";
    words[4] = "amet,";
  } else {
    words[0] = words[0][0].toUpperCase() + words[0].slice(1);
  }
  return words.join(" ") + ".";
}

function makeParagraph(sentenceCount: number, startWithLorem: boolean): string {
  return Array.from({ length: sentenceCount }, (_, i) => makeSentence(startWithLorem && i === 0)).join(" ");
}

function generate(unit: "words" | "sentences" | "paragraphs", count: number, startWithLorem: boolean): string {
  if (unit === "words") {
    const words = Array.from({ length: count }, () => randWord());
    if (startWithLorem) {
      words[0] = "Lorem";
      if (words.length > 1) words[1] = "ipsum";
    }
    return words.join(" ");
  }
  if (unit === "sentences") {
    return Array.from({ length: count }, (_, i) => makeSentence(startWithLorem && i === 0)).join(" ");
  }
  return Array.from({ length: count }, (_, i) => makeParagraph(4 + Math.floor(Math.random() * 3), startWithLorem && i === 0)).join("\n\n");
}

export default function LoremIpsumPage() {
  const [unit, setUnit] = useState<"words" | "sentences" | "paragraphs">("paragraphs");
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState("");

  const regenerate = () => setOutput(generate(unit, count, startWithLorem));

  useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, count, startWithLorem]);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="¶"
        title="Lorem Ipsum Generator"
        desc="Generate placeholder text by words, sentences, or paragraphs — for mockups and layout testing."
      />

      <ToolPanel>
        <PanelToolbar>
          <div className="flex flex-wrap items-center gap-4">
            <ModeToggle
              options={[
                { value: "words", label: "Words" },
                { value: "sentences", label: "Sentences" },
                { value: "paragraphs", label: "Paragraphs" },
              ]}
              value={unit}
              onChange={(u) => setUnit(u as typeof unit)}
            />
            <NumberField label="Count" min={1} max={50} value={count} onChange={setCount} />
            <CheckboxOption label='Start with "Lorem ipsum"' checked={startWithLorem} onChange={setStartWithLorem} />
          </div>
          <div className="flex items-center gap-2">
            <CopyButton value={output} />
            <PrimaryButton onClick={regenerate}>
              <RefreshCw size={13} /> Regenerate
            </PrimaryButton>
          </div>
        </PanelToolbar>

        <PanelBody>
          <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-4 text-[13.5px] leading-[1.65] text-[var(--text)]">
            {output}
          </pre>
        </PanelBody>
      </ToolPanel>
    </div>
  );
}
