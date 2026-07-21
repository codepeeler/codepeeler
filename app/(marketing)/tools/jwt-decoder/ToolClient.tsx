"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function base64UrlDecode(str: string): string {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return decodeURIComponent(escape(atob(s)));
}

function jwtDecode(token: string): string {
  const parts = token.trim().split(".");
  if (parts.length < 2) throw new Error("Not a valid JWT (expected 3 dot-separated parts)");
  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));
  return JSON.stringify({ header, payload }, null, 2);
}

export default function JwtDecoderPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="sec"
        badge="JWT"
        title="JWT Decoder"
        desc="Decode a JSON Web Token's header and payload locally — the signature is never verified or sent anywhere."
      />
      <ToolLab
        inputLabel="JWT"
        outputLabel="Header & Payload"
        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        live
        emptyHint="Paste a JWT above to see its decoded header and payload."
        onRun={(input) => jwtDecode(input)}
      />
    </div>
  );
}
