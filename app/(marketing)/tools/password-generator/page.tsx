"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import ToolHeader from "@/components/tools/ToolHeader";
import CopyButton from "@/components/tools/CopyButton";

function generatePassword(opts: {
  length: number;
  upper: boolean;
  lower: boolean;
  digits: boolean;
  symbols: boolean;
}): string {
  const sets: string[] = [];
  if (opts.upper) sets.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (opts.lower) sets.push("abcdefghijklmnopqrstuvwxyz");
  if (opts.digits) sets.push("0123456789");
  if (opts.symbols) sets.push("!@#$%^&*()-_=+[]{}");
  const all = sets.join("") || "abcdefghijklmnopqrstuvwxyz";
  const arr = new Uint32Array(opts.length);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < opts.length; i++) out += all[arr[i] % all.length];
  return out;
}

function scorePassword(length: number, setCount: number): { label: string; color: string } {
  const bits = length * Math.log2(Math.max(setCount, 1) * 20);
  if (bits < 60) return { label: "Weak", color: "var(--danger)" };
  if (bits < 90) return { label: "Okay", color: "var(--warning)" };
  if (bits < 120) return { label: "Strong", color: "var(--secondary)" };
  return { label: "Very strong", color: "var(--success)" };
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState("");

  const setCount = [upper, lower, digits, symbols].filter(Boolean).length;

  const regenerate = useCallback(() => {
    setPassword(generatePassword({ length, upper, lower, digits, symbols }));
  }, [length, upper, lower, digits, symbols]);

  useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, upper, lower, digits, symbols]);

  const strength = useMemo(() => scorePassword(length, setCount), [length, setCount]);

  const TOGGLES: [string, boolean, (v: boolean) => void][] = [
    ["Uppercase (A–Z)", upper, setUpper],
    ["Lowercase (a–z)", lower, setLower],
    ["Digits (0–9)", digits, setDigits],
    ["Symbols (!@#$...)", symbols, setSymbols],
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="••"
        title="Password Generator"
        desc="Create strong, random passwords locally using the browser's cryptographically secure random generator."
      />

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--bg-elev)]">
        <div className="p-4">
          <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-[family-name:var(--font-mono)] text-[19px] font-semibold tracking-[0.02em] text-[var(--text)]">
              {password || "—"}
            </div>
            <div className="flex flex-shrink-0 items-center gap-1 pl-3">
              <CopyButton value={password} />
              <button
                onClick={regenerate}
                title="Regenerate"
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-faint)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 text-[12px]">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: strength.color }} />
            <span style={{ color: strength.color }} className="font-semibold">
              {strength.label}
            </span>
            <span className="text-[var(--text-faint)]">· {length} characters</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 border-t border-[var(--border-soft)] p-4 md:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center justify-between text-[12.5px] font-semibold text-[var(--text-dim)]">
              Length
              <span className="font-[family-name:var(--font-mono)] text-[var(--text)]">{length}</span>
            </label>
            <input
              type="range"
              min={8}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
          </div>

          <div className="space-y-2.5">
            {TOGGLES.map(([label, value, setter]) => (
              <label key={label} className="flex items-center justify-between text-[13px] text-[var(--text-dim)]">
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setter(e.target.checked)}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
