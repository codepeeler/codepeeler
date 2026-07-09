"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

type HashAlgo = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
const ALGOS: HashAlgo[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

async function hashText(text: string, algo: HashAlgo): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest(algo, enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function HashGeneratorPage() {
  const [algo, setAlgo] = useState<HashAlgo>("SHA-256");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="sec"
        badge="#"
        title="Hash Generator"
        desc="Generate a SHA-1, SHA-256, SHA-384, or SHA-512 checksum for any text, computed locally via Web Crypto."
      />
      <ToolLab
        inputLabel="Text"
        outputLabel={`${algo} Hash`}
        placeholder="Type or paste text to hash..."
        live
        recalcKey={algo}
        emptyHint="Enter text above — the hash updates automatically."
        settingsSlot={
          <label className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-dim)]">
            Algorithm
            <select
              value={algo}
              onChange={(e) => setAlgo(e.target.value as HashAlgo)}
              className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[12.5px] text-[var(--text)]"
            >
              {ALGOS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
        }
        onRun={(input) => hashText(input, algo)}
      />
    </div>
  );
}
