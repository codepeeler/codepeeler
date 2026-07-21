"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

const PC_BASE = 36,
  PC_TMIN = 1,
  PC_TMAX = 26,
  PC_SKEW = 38,
  PC_DAMP = 700,
  PC_INITIAL_BIAS = 72,
  PC_INITIAL_N = 128;

function pcAdapt(delta: number, numPoints: number, firstTime: boolean): number {
  let d = firstTime ? Math.floor(delta / PC_DAMP) : Math.floor(delta / 2);
  d += Math.floor(d / numPoints);
  let k = 0;
  while (d > ((PC_BASE - PC_TMIN) * PC_TMAX) >> 1) {
    d = Math.floor(d / (PC_BASE - PC_TMIN));
    k += PC_BASE;
  }
  return k + Math.floor(((PC_BASE - PC_TMIN + 1) * d) / (d + PC_SKEW));
}

function pcDigitToChar(d: number): string {
  return d < 26 ? String.fromCharCode(d + 97) : String.fromCharCode(d - 26 + 48);
}

function pcCharToDigit(c: string): number {
  const code = c.charCodeAt(0);
  if (code >= 48 && code <= 57) return code - 22;
  if (code >= 97 && code <= 122) return code - 97;
  if (code >= 65 && code <= 90) return code - 65;
  throw new Error(`Invalid punycode character "${c}"`);
}

function punycodeEncodeLabel(label: string): string {
  const input = Array.from(label).map((c) => c.codePointAt(0)!);
  const output: string[] = [];
  const basic = input.filter((c) => c < 0x80);
  basic.forEach((c) => output.push(String.fromCharCode(c)));
  let h = basic.length;
  const b = h;
  if (b > 0) output.push("-");

  let n = PC_INITIAL_N,
    delta = 0,
    bias = PC_INITIAL_BIAS;

  while (h < input.length) {
    let m = Infinity;
    for (const c of input) if (c >= n && c < m) m = c;
    delta += (m - n) * (h + 1);
    n = m;
    for (const c of input) {
      if (c < n) delta++;
      if (c === n) {
        let q = delta;
        for (let k = PC_BASE; ; k += PC_BASE) {
          const t = k <= bias ? PC_TMIN : k >= bias + PC_TMAX ? PC_TMAX : k - bias;
          if (q < t) break;
          output.push(pcDigitToChar(t + ((q - t) % (PC_BASE - t))));
          q = Math.floor((q - t) / (PC_BASE - t));
        }
        output.push(pcDigitToChar(q));
        bias = pcAdapt(delta, h + 1, h === b);
        delta = 0;
        h++;
      }
    }
    delta++;
    n++;
  }
  return "xn--" + output.join("");
}

function punycodeDecodeLabel(label: string): string {
  if (!label.toLowerCase().startsWith("xn--")) return label;
  const rest = label.slice(4);
  const lastDash = rest.lastIndexOf("-");
  const basic = lastDash >= 0 ? rest.slice(0, lastDash) : "";
  const codePart = lastDash >= 0 ? rest.slice(lastDash + 1) : rest;
  let output: number[] = basic ? Array.from(basic).map((c) => c.charCodeAt(0)) : [];

  let n = PC_INITIAL_N,
    i = 0,
    bias = PC_INITIAL_BIAS,
    idx = 0;

  while (idx < codePart.length) {
    const oldI = i;
    let w = 1;
    for (let k = PC_BASE; ; k += PC_BASE) {
      if (idx >= codePart.length) throw new Error("Invalid punycode input");
      const digit = pcCharToDigit(codePart[idx++]);
      i += digit * w;
      const t = k <= bias ? PC_TMIN : k >= bias + PC_TMAX ? PC_TMAX : k - bias;
      if (digit < t) break;
      w *= PC_BASE - t;
    }
    bias = pcAdapt(i - oldI, output.length + 1, oldI === 0);
    n += Math.floor(i / (output.length + 1));
    i %= output.length + 1;
    output.splice(i, 0, n);
    i++;
  }
  return output.map((c) => String.fromCodePoint(c)).join("");
}

function punycodeEncode(input: string): string {
  if (!input.trim()) throw new Error("Enter a domain name");
  return input
    .trim()
    .split(".")
    .map((label) => (/^[\x00-\x7F]*$/.test(label) ? label : punycodeEncodeLabel(label)))
    .join(".");
}

function punycodeDecode(input: string): string {
  if (!input.trim()) throw new Error("Enter a punycode domain (e.g. xn--...)");
  return input.trim().split(".").map(punycodeDecodeLabel).join(".");
}

export default function PunycodeConverterPage() {
  const [mode, setMode] = useState("encode");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="encode"
        badge="IDN"
        title="Punycode (IDN) Converter"
        desc="Encode internationalized domain names to Punycode (xn--...), or decode them back to Unicode."
      />
      <ToolLab
        inputLabel={mode === "encode" ? "Unicode domain" : "Punycode domain"}
        outputLabel={mode === "encode" ? "Punycode domain" : "Unicode domain"}
        placeholder={mode === "encode" ? "münchen.de" : "xn--mnchen-3ya.de"}
        modes={[
          { value: "encode", label: "Encode" },
          { value: "decode", label: "Decode" },
        ]}
        mode={mode}
        onModeChange={setMode}
        live
        recalcKey={mode}
        emptyHint="Enter a domain above, choose a mode — the result updates automatically."
        onRun={(input) => (mode === "encode" ? punycodeEncode(input) : punycodeDecode(input))}
      />
    </div>
  );
}
