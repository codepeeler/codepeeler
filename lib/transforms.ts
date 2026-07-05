import type { NodeTypeId } from "@/lib/data/node-types";

export type HashAlgo = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

export interface NodeSettings {
  indent?: number; // json-format
  algo?: HashAlgo; // hash
  length?: number; // password-gen
  upper?: boolean;
  lower?: boolean;
  digits?: boolean;
  symbols?: boolean;
}

export const DEFAULT_SETTINGS: Partial<Record<NodeTypeId, NodeSettings>> = {
  "json-format": { indent: 2 },
  hash: { algo: "SHA-256" },
  "password-gen": { length: 16, upper: true, lower: true, digits: true, symbols: true },
};

function base64UrlDecode(str: string): string {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return decodeURIComponent(escape(atob(s)));
}

function csvToJson(input: string): string {
  const lines = input.trim().split(/\r\n|\r|\n/).filter(Boolean);
  if (lines.length === 0) return "[]";
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
  return JSON.stringify(rows, null, 2);
}

function formatXML(xml: string): string {
  const trimmed = xml.replace(/>\s*</g, "><").trim();
  const PAD = "  ";
  let pad = 0;
  let out = "";
  trimmed.split(/(?=<)/).forEach((chunk) => {
    if (!chunk) return;
    const isClosing = /^<\/\w/.test(chunk);
    const isSelfClosing = /\/>\s*$/.test(chunk) || /^<\?/.test(chunk) || /^<!--/.test(chunk);
    if (isClosing) pad = Math.max(0, pad - 1);
    out += PAD.repeat(pad) + chunk.trim() + "\n";
    if (!isClosing && !isSelfClosing && /^<\w/.test(chunk)) pad += 1;
  });
  return out.trim();
}

function wordCount(text: string): string {
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
  return `Characters: ${chars}\nWords: ${words}\nLines: ${lines}`;
}

async function hashText(text: string, algo: HashAlgo): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest(algo, enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function jwtDecode(token: string): string {
  const parts = token.trim().split(".");
  if (parts.length < 2) throw new Error("Not a valid JWT (expected 3 dot-separated parts)");
  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));
  return JSON.stringify({ header, payload }, null, 2);
}

function generatePassword(settings: NodeSettings): string {
  const length = settings.length ?? 16;
  const sets: string[] = [];
  if (settings.upper !== false) sets.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (settings.lower !== false) sets.push("abcdefghijklmnopqrstuvwxyz");
  if (settings.digits !== false) sets.push("0123456789");
  if (settings.symbols !== false) sets.push("!@#$%^&*()-_=+[]{}");
  const all = sets.join("") || "abcdefghijklmnopqrstuvwxyz";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < length; i++) out += all[arr[i] % all.length];
  return out;
}

export async function runTransform(
  type: NodeTypeId,
  input: string,
  settings: NodeSettings = {}
): Promise<string> {
  switch (type) {
    case "input":
      return input;
    case "export":
      return input;
    case "json-format":
      return JSON.stringify(JSON.parse(input), null, settings.indent ?? 2);
    case "json-minify":
      return JSON.stringify(JSON.parse(input));
    case "csv-json":
      return csvToJson(input);
    case "xml-format":
      return formatXML(input);
    case "base64-encode":
      return btoa(unescape(encodeURIComponent(input)));
    case "base64-decode":
      return decodeURIComponent(escape(atob(input)));
    case "url-encode":
      return encodeURIComponent(input);
    case "url-decode":
      return decodeURIComponent(input);
    case "uppercase":
      return input.toUpperCase();
    case "lowercase":
      return input.toLowerCase();
    case "word-count":
      return wordCount(input);
    case "hash":
      return hashText(input, settings.algo ?? "SHA-256");
    case "jwt-decode":
      return jwtDecode(input);
    case "password-gen":
      return generatePassword(settings);
    default:
      return input;
  }
}
