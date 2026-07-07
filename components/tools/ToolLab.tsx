"use client";

import { useEffect, useMemo, useState } from "react";
import CopyButton from "@/components/tools/CopyButton";
import { cn } from "@/lib/utils";

export type ToolMode = { value: string; label: string };

type ToolLabProps = {
  /** Label above the input textarea, e.g. "Text" */
  inputLabel?: string;
  /** Label above the output block, e.g. "Base64" */
  outputLabel?: string;
  placeholder?: string;
  /** Optional pill toggle group, e.g. Encode / Decode */
  modes?: ToolMode[];
  mode?: string;
  onModeChange?: (mode: string) => void;
  /** Primary action button label, e.g. "Convert". Omit for live/auto mode. */
  actionLabel?: string;
  /** Runs on every keystroke (debounced) instead of waiting for the action button */
  live?: boolean;
  /** The actual transform. Throw to surface an error in the status row. */
  onRun: (input: string) => string | Promise<string>;
  /** Extra controls rendered above the input/output grid (selects, sliders, checkboxes...) */
  settingsSlot?: React.ReactNode;
  /** Render output as multiple lines / stat block instead of code — pass a custom renderer */
  renderOutput?: (output: string) => React.ReactNode;
  emptyHint?: string;
  monospaceInput?: boolean;
  /** Bump this (e.g. a settings value) to force a re-run in live mode without touching input */
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
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--bg-elev)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-soft)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          {modes && modes.length > 0 && (
            <div className="flex rounded-[8px] border border-[var(--border)] bg-[var(--card)] p-0.5">
              {modes.map((m) => (
                <button
                  key={m.value}
                  onClick={() => onModeChange?.(m.value)}
                  className={cn(
                    "rounded-[6px] px-3 py-1.5 text-[12.5px] font-semibold transition-colors duration-150",
                    mode === m.value
                      ? "bg-[var(--primary)] text-white"
                      : "text-[var(--text-dim)] hover:text-[var(--text)]"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="rounded-[7px] border border-[var(--border)] bg-[var(--card)] px-3 py-[7px] text-[12.5px] font-semibold text-[var(--text-dim)] transition-colors duration-150 hover:border-[var(--text-faint)] hover:text-[var(--text)]"
          >
            Clear
          </button>
          {!live && (
            <button
              onClick={() => execute(input)}
              className="rounded-[7px] bg-[var(--primary)] px-3.5 py-[7px] text-[12.5px] font-semibold text-white transition-all duration-150 hover:brightness-[1.08]"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>

      {settingsSlot && (
        <div className="flex flex-wrap items-center gap-4 border-b border-[var(--border-soft)] px-4 py-3">
          {settingsSlot}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3.5 p-4 md:grid-cols-2">
        <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--text-faint)]">
              {inputLabel}
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder={placeholder}
            className={cn(
              "h-[180px] w-full resize-none bg-transparent p-3 text-[13px] leading-[1.55] text-[var(--text)] placeholder:text-[var(--text-faint)]",
              monospaceInput && "font-[family-name:var(--font-mono)]"
            )}
          />
        </div>

        <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--text-faint)]">
              {outputLabel}
            </span>
            <CopyButton value={output} />
          </div>
          <div className="h-[180px] overflow-auto p-3">
            {renderOutput ? (
              renderOutput(output)
            ) : (
              <pre className="whitespace-pre-wrap break-words font-[family-name:var(--font-mono)] text-[13px] leading-[1.55] text-[var(--text)]">
                {output}
              </pre>
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-[var(--border-soft)] px-4 py-2.5 text-[12px]",
          error ? "text-[var(--danger)]" : "text-[var(--text-faint)]"
        )}
      >
        {statusText}
      </div>
    </div>
  );
}
