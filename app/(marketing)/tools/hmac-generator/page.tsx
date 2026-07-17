"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

type HashAlgo = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
const ALGOS: HashAlgo[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

async function hmacGenerate(input: string, secret: string, algo: HashAlgo): Promise<string> {
  if (!secret) throw new Error("Enter a secret key in the settings above");
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: algo }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(input));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function HmacGeneratorPage() {
  const [algo, setAlgo] = useState<HashAlgo>("SHA-256");
  const [secret, setSecret] = useState("");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="sec"
        badge="HMAC"
        title="HMAC Generator"
        desc="Sign a message with a secret key using HMAC-SHA1/256/384/512, computed locally via Web Crypto."
      />
      <ToolLab
        inputLabel="Message"
        outputLabel={`HMAC-${algo}`}
        placeholder="Type or paste the message to sign..."
        live
        recalcKey={`${algo}-${secret}`}
        emptyHint="Enter a message and secret key above — the HMAC updates automatically."
        settingsSlot={
          <div className="flex flex-wrap items-center gap-4">
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
            <label className="flex flex-1 items-center gap-2 text-[12.5px] font-medium text-[var(--text-dim)]">
              Secret key
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="e.g. my-secret-key"
                className="min-w-[180px] flex-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[12.5px] text-[var(--text)]"
              />
            </label>
          </div>
        }
        onRun={(input) => hmacGenerate(input, secret, algo)}
      />
    </div>
  );
}
