// Node categories intentionally reuse the site's existing --cat-* tokens
// (from app/globals.css) wherever the concept overlaps with a landing-page
// tool category, so a workflow node's color always matches its equivalent
// tool card elsewhere on the site. Only two categories have no landing-page
// equivalent: "flow" (start/end nodes — uses --primary directly, no new
// token) and "text" (needs exactly one new token, --cat-text).
export type NodeCat = "flow" | "data" | "encode" | "web" | "text" | "sec" | "gen";

export const NODE_CAT_COLOR: Record<NodeCat, string> = {
  flow: "var(--primary)",
  data: "var(--cat-data)",
  encode: "var(--cat-encode)",
  web: "var(--cat-web)",
  text: "var(--cat-text)",
  sec: "var(--cat-sec)",
  gen: "var(--cat-gen)",
};

export type NodeTypeId =
  | "input"
  | "json-format"
  | "json-minify"
  | "csv-json"
  | "xml-format"
  | "base64-encode"
  | "base64-decode"
  | "url-encode"
  | "url-decode"
  | "uppercase"
  | "lowercase"
  | "word-count"
  | "hash"
  | "jwt-decode"
  | "password-gen"
  | "export";

export const NODE_TYPES: Record<
  NodeTypeId,
  {
    label: string;
    desc: string;
    badge: string;
    cat: NodeCat;
    noInput?: boolean;
    noOutput?: boolean;
  }
> = {
  input: { label: "Input", desc: "Starting value for the workflow", badge: "▶", cat: "flow", noInput: true },
  "json-format": { label: "JSON Formatter", desc: "Format & validate JSON", badge: "{ }", cat: "data" },
  "json-minify": { label: "JSON Minify", desc: "Strip whitespace", badge: "»", cat: "data" },
  "csv-json": { label: "CSV → JSON", desc: "Convert CSV to JSON", badge: "◫", cat: "data" },
  "xml-format": { label: "XML Formatter", desc: "Pretty-print XML", badge: "</>", cat: "data" },
  "base64-encode": { label: "Base64 Encode", desc: "Encode the input", badge: "64", cat: "encode" },
  "base64-decode": { label: "Base64 Decode", desc: "Decode the input", badge: "64", cat: "encode" },
  "url-encode": { label: "URL Encode", desc: "Percent-encode the input", badge: "%", cat: "web" },
  "url-decode": { label: "URL Decode", desc: "Percent-decode the input", badge: "%", cat: "web" },
  uppercase: { label: "Uppercase", desc: "Convert text to UPPERCASE", badge: "AA", cat: "text" },
  lowercase: { label: "Lowercase", desc: "Convert text to lowercase", badge: "aa", cat: "text" },
  "word-count": { label: "Word Count", desc: "Count chars, words, lines", badge: "#", cat: "text" },
  hash: { label: "Hash Generator", desc: "Generate a checksum", badge: "#", cat: "sec" },
  "jwt-decode": { label: "JWT Decoder", desc: "Decode JWT tokens", badge: "JWT", cat: "sec" },
  "password-gen": { label: "Password Generator", desc: "Create strong passwords", badge: "••", cat: "gen" },
  export: { label: "Export", desc: "Save to Collection", badge: "↓", cat: "flow", noOutput: true },
};

export const PALETTE_GROUPS: { label: string; items: NodeTypeId[] }[] = [
  { label: "Flow", items: ["input", "export"] },
  { label: "Data & Formatting", items: ["json-format", "json-minify", "csv-json", "xml-format"] },
  { label: "Encode / Decode", items: ["base64-encode", "base64-decode"] },
  { label: "Web", items: ["url-encode", "url-decode"] },
  { label: "Text Tools", items: ["uppercase", "lowercase", "word-count"] },
  { label: "Security", items: ["hash", "jwt-decode"] },
  { label: "Generator", items: ["password-gen"] },
];
