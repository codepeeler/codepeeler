"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

async function jwkToPem(input: string): Promise<string> {
  let jwk: JsonWebKey;
  try {
    jwk = JSON.parse(input);
  } catch {
    throw new Error("Enter valid JWK JSON");
  }
  if (!jwk.kty) throw new Error('JWK must include a "kty" field');

  let algorithm: RsaHashedImportParams | EcKeyImportParams;
  if (jwk.kty === "RSA") algorithm = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };
  else if (jwk.kty === "EC") algorithm = { name: "ECDSA", namedCurve: (jwk.crv as string) || "P-256" };
  else throw new Error(`Unsupported key type "${jwk.kty}" — only RSA and EC are supported`);

  const isPrivate = !!jwk.d;
  const usages: KeyUsage[] = isPrivate ? ["sign"] : ["verify"];
  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey("jwk", jwk, algorithm, true, usages);
  } catch (e) {
    throw new Error("Couldn't import this JWK: " + (e instanceof Error ? e.message : ""));
  }

  const format = isPrivate ? "pkcs8" : "spki";
  const exported = await crypto.subtle.exportKey(format, key);
  const b64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
  const lines = b64.match(/.{1,64}/g) || [];
  const label = isPrivate ? "PRIVATE KEY" : "PUBLIC KEY";
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----`;
}

export default function JwkToPemConverterPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="sec"
        badge="pem"
        title="JWK to PEM Converter"
        desc="Paste a JSON Web Key (RSA or EC) and get the equivalent PEM — conversion runs through your browser's built-in Web Crypto API, nothing leaves your device."
      />
      <ToolLab
        inputLabel="JWK"
        outputLabel="PEM"
        placeholder={`{\n  "kty": "RSA",\n  "n": "...",\n  "e": "AQAB"\n}`}
        live
        emptyHint="Paste a JWK above — the PEM output updates automatically."
        onRun={(input) => jwkToPem(input)}
      />
    </div>
  );
}
