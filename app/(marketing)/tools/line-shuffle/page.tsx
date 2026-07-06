"use client";

import { useEffect, useState } from "react";
import { Shuffle } from "lucide-react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import FieldBox from "@/components/tools/FieldBox";
import ModeToggle from "@/components/tools/ModeToggle";
import { PanelToolbar, PanelBody, PanelFooter } from "@/components/tools/PanelParts";
import { PrimaryButton } from "@/components/tools/Buttons";
import CopyButton from "@/components/tools/CopyButton";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LineShufflePage() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"lines" | "words">("lines");
  const [output, setOutput] = useState("");

  const run = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    if (mode === "lines") setOutput(shuffle(input.split(/\r\n|\r|\n/)).join("\n"));
    else setOutput(shuffle(input.trim().split(/\s+/)).join(" "));
  };

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="⤨"
        title="Line / Word Shuffle"
        desc="Randomly shuffle the lines or words in a block of text — useful for quiz options, playlists, or randomized lists."
      />

      <ToolPanel>
        <PanelToolbar>
          <ModeToggle
            options={[
              { value: "lines", label: "Lines" },
              { value: "words", label: "Words" },
            ]}
            value={mode}
            onChange={(m) => setMode(m as typeof mode)}
          />
          <PrimaryButton onClick={run}>
            <Shuffle size={13} /> Shuffle
          </PrimaryButton>
        </PanelToolbar>

        <PanelBody className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <FieldBox label="Input" height="220px">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onBlur={run}
              spellCheck={false}
              placeholder={"apple\nbanana\ncherry"}
              className="h-full w-full resize-none bg-transparent p-3 font-[family-name:var(--font-mono)] text-[13px] leading-[1.55] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </FieldBox>
          <FieldBox label="Shuffled" height="220px" right={<CopyButton value={output} />}>
            <pre className="h-full overflow-auto whitespace-pre-wrap break-words p-3 font-[family-name:var(--font-mono)] text-[13px] leading-[1.55] text-[var(--text)]">
              {output}
            </pre>
          </FieldBox>
        </PanelBody>

        <PanelFooter>Click &quot;Shuffle&quot; again for a new random order — each click is a fresh shuffle.</PanelFooter>
      </ToolPanel>
    </div>
  );
}
