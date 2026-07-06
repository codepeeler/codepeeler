"use client";

import { useEffect, useMemo, useState } from "react";
import CopyButton from "@/components/tools/CopyButton";
import ToolPanel from "@/components/tools/ToolPanel";
import FieldBox from "@/components/tools/FieldBox";
import ModeToggle, { type ModeOption } from "@/components/tools/ModeToggle";
import { PanelToolbar, PanelSettings, PanelBody, PanelFooter } from "@/components/tools/PanelParts";
import { OutlineButton, PrimaryButton } from "@/components/tools/Buttons";
import { cn } from "@/lib/utils";

export type ToolMode = ModeOption;

type ToolLabProps = {
  inputLabel?: string;
  outputLabel?: string;
  placeholder?: string;
  modes?: ToolMode[];
  mode?: string;
  onModeChange?: (mode: string) => void;
  actionLabel?: string;
  live?: boolean;
  onRun: (input: string) => string | Promise<string>;
  settingsSlot?: React.ReactNode;
  renderOutput?: (output: string) => React.ReactNode;
  emptyHint?: string;
  monospaceInput?: boolean;
  recalcKey?: string | number;
};

export default function ToolLab({
  inputLabel = "Input",
  outputLabel = "Output",
  placeholder = "Type or paste content...",
  modes,
  mode,
  onModeChange,
  actionLabel = "Run",
  live = false,
  onRun,
  settingsSlot,
  renderOutput,
  emptyHint = "Enter a value above to see the result here.",
  monospaceInput = true,
  recalcKey,
}: ToolLabProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ranOnce, setRanOnce] = useState(false);

  const execute = useMemo(
    () => async (value: string) => {
      if (!value.trim()) {
        setOutput("");
        setError(null);
        return;
      }
      try {
        const result = await onRun(value);
        setOutput(result);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
        setOutput("");
      }
      setRanOnce(true);
    },
    [onRun]
  );

  useEffect(() => {
    if (!live) return;
    const t = setTimeout(() => {
      execute(input);
    }, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, live, mode, recalcKey]);

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  const statusText = error
    ? error
    : !input.trim()
    ? emptyHint
    : output
    ? `${output.length.toLocaleString()} characters`
    : ranOnce
    ? "No output"
    : emptyHint;

  return (
    <ToolPanel>
      <PanelToolbar>
        <div>{modes && modes.length > 0 && <ModeToggle options={modes} value={mode ?? ""} onChange={(v) => onModeChange?.(v)} />}</div>
        <div className="flex items-center gap-2">
          <OutlineButton onClick={handleClear}>Clear</OutlineButton>
          {!live && <PrimaryButton onClick={() => execute(input)}>{actionLabel}</PrimaryButton>}
        </div>
      </PanelToolbar>

      {settingsSlot && <PanelSettings>{settingsSlot}</PanelSettings>}

      <PanelBody className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <FieldBox label={inputLabel} height="180px">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder={placeholder}
            className={cn(
              "h-full w-full resize-none bg-transparent p-3 text-[13px] leading-[1.55] text-[var(--text)] placeholder:text-[var(--text-faint)]",
              monospaceInput && "font-[family-name:var(--font-mono)]"
            )}
          />
        </FieldBox>

        <FieldBox label={outputLabel} height="180px" right={<CopyButton value={output} />}>
          <div className="h-full p-3">
            {renderOutput ? (
              renderOutput(output)
            ) : (
              <pre className="whitespace-pre-wrap break-words font-[family-name:var(--font-mono)] text-[13px] leading-[1.55] text-[var(--text)]">
                {output}
              </pre>
            )}
          </div>
        </FieldBox>
      </PanelBody>

      <PanelFooter tone={error ? "danger" : "muted"}>{statusText}</PanelFooter>
    </ToolPanel>
  );
}
