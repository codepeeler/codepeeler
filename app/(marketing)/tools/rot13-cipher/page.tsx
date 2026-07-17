"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function caesarCipher(input: string, shift: number): string {
  const s = ((shift % 26) + 26) % 26;
  return input.replace(/[a-zA-Z]/g, (ch) => {
    const base = ch <= "Z" ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + s) % 26) + base);
  });
}

export default function Rot13CipherPage() {
  const [shift, setShift] = useState(13);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="encode"
        badge="R13"
        title="ROT13 / Caesar Cipher"
        desc="Shift letters by any amount — defaults to ROT13, the classic self-inverse cipher."
      />
      <ToolLab
        inputLabel="Text"
        outputLabel="Shifted Text"
        placeholder="Type or paste text..."
        live
        recalcKey={shift}
        emptyHint="Enter text above — the shifted result updates automatically. Use the same shift to reverse it."
        settingsSlot={
          <label className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-dim)]">
            Shift
            <input
              type="number"
              value={shift}
              onChange={(e) => setShift(Number(e.target.value) || 0)}
              className="w-16 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[12.5px] text-[var(--text)]"
            />
            <button
              type="button"
              onClick={() => setShift(13)}
              className="rounded-md border border-[var(--border)] px-2 py-1 text-[12px] text-[var(--text-dim)] hover:text-[var(--text)]"
            >
              Reset to ROT13
            </button>
          </label>
        }
        onRun={(input) => caesarCipher(input, shift)}
      />
    </div>
  );
}
