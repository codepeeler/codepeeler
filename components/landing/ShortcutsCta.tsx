"use client";

import { SHORTCUTS } from "@/lib/data/tools";
import { useCommandPalette } from "@/providers/command-palette-provider";

export default function ShortcutsCta() {
  const { open } = useCommandPalette();

  return (
    <section className="w-full px-8 pt-11">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="mb-[14px] font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.01em]">
            Built for the keyboard
          </h2>
          <div className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-1.5">
            {SHORTCUTS.map(([label, keys]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-[var(--border-soft)] px-3.5 py-2.5 text-sm text-[var(--text-dim)] last:border-b-0"
              >
                <span>{label}</span>
                <span className="flex gap-1">
                  {keys.split(" ").map((k, i) => (
                    <span
                      key={i}
                      className="rounded-[5px] border border-[var(--border)] bg-[var(--border-soft)] px-[5px] py-0.5 font-[family-name:var(--font-mono)] text-[10.5px] text-[var(--text-faint)]"
                    >
                      {k}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start justify-center rounded-[12px] border border-[var(--border)] bg-[linear-gradient(160deg,rgba(109,93,246,0.12),rgba(79,157,255,0.05))] p-[26px]">
          <div className="mb-2.5 font-[family-name:var(--font-mono)] text-[22px] font-bold text-[var(--primary)]">
            ⌘
          </div>
          <h3 className="mb-1.5 font-[family-name:var(--font-display)] text-[17px] font-semibold">
            Command palette
          </h3>
          <p className="mb-4 text-[13px] leading-[1.5] text-[var(--text-dim)]">
            Search every tool, command and collection from one place. No mouse
            required.
          </p>
          <button
            onClick={open}
            className="inline-flex items-center gap-[7px] rounded-[9px] bg-[var(--primary)] px-5 py-[11px] text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:shadow-[var(--shadow-glow)] hover:brightness-[1.08]"
          >
            Open command palette
            <span className="rounded-[5px] border border-white/20 bg-white/10 px-[5px] py-0.5 font-[family-name:var(--font-mono)] text-[10.5px]">
              ⌘K
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
