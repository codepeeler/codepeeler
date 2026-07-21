"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

type Algo = "HS256" | "HS384" | "HS512";
const ALGOS: Algo[] = ["HS256", "HS384", "HS512"];
const HASH_BY_ALGO: Record<Algo, string> = {
  HS256: "SHA-256",
  HS384: "SHA-384",
  HS512: "SHA-512",
};

function base64UrlEncode(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlEncodeString(str: string): string {
  return base64UrlEncode(new TextEncoder().encode(str));
}

async function signJwt(payloadInput: string, algo: Algo, secret: string): Promise<string> {
  if (!secret) throw new Error("Enter a secret key to sign the token");

  let payloadObj: unknown;
  try {
    payloadObj = JSON.parse(payloadInput);
  } catch {
    throw new Error("Payload must be valid JSON");
  }

  const header = { alg: algo, typ: "JWT" };
  const encodedHeader = base64UrlEncodeString(JSON.stringify(header));
  const encodedPayload = base64UrlEncodeString(JSON.stringify(payloadObj));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: HASH_BY_ALGO[algo] },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signingInput));
  const signature = base64UrlEncode(new Uint8Array(sigBuf));

  return `${signingInput}.${signature}`;
}

export default function JwtEncoderPage() {
  const [algo, setAlgo] = useState<Algo>("HS256");
  const [secret, setSecret] = useState("");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="sec"
        badge="JWT"
        title="JWT Encoder"
        desc="Sign a JSON payload into a JSON Web Token using HMAC (HS256/HS384/HS512) — computed locally, the secret never leaves your browser."
      />
      <ToolLab
        inputLabel="Payload (JSON)"
        outputLabel="JWT"
        placeholder={'{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}'}
        live
        recalcKey={`${algo}:${secret}`}
        emptyHint="Enter a JSON payload and a secret key above to generate a signed JWT."
        settingsSlot={
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-dim)]">
              Algorithm
              <select
                value={algo}
                onChange={(e) => setAlgo(e.target.value as Algo)}
                className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[12.5px] text-[var(--text)]"
              >
                {ALGOS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-dim)]">
              Secret
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="your-256-bit-secret"
                className="w-56 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[12.5px] text-[var(--text)]"
              />
            </label>
          </div>
        }
        onRun={(input) => signJwt(input, algo, secret)}
      />
    </div>
  );
}
