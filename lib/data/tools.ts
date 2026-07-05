export type CatKey = "data" | "encode" | "gen" | "web" | "image" | "sec";

export type Tool = {
  id: string;
  name: string;
  desc: string;
  badge: string;
  cat: CatKey;
  page: string | null;
};

export const TOOLS: Tool[] = [
  { id: "json", name: "JSON Formatter / Minify", desc: "Format, validate & minify JSON", badge: "{ }", cat: "data", page: "/tools/json-formatter" },
  { id: "csv-json", name: "CSV to JSON", desc: "Convert CSV rows to JSON", badge: "◫", cat: "data", page: "/tools/csv-to-json" },
  { id: "xml", name: "XML Formatter", desc: "Pretty-print XML", badge: "</>", cat: "data", page: "/tools/xml-formatter" },
  { id: "base64", name: "Base64 Encode/Decode", desc: "Encode & decode strings", badge: "64", cat: "encode", page: "/tools/base64-encoder" },
  { id: "url", name: "URL Encode/Decode", desc: "Percent-encode & decode", badge: "%", cat: "web", page: "/tools/url-encoder" },
  { id: "case", name: "Case Converter", desc: "UPPER, lower, Title, Sentence", badge: "AA", cat: "data", page: "/tools/case-converter" },
  { id: "words", name: "Word Counter", desc: "Chars, words, lines & more", badge: "#", cat: "data", page: "/tools/word-counter" },
  { id: "hash", name: "Hash Generator", desc: "SHA-1 / SHA-256 / SHA-512", badge: "#", cat: "sec", page: "/tools/hash-generator" },
  { id: "jwt", name: "JWT Decoder", desc: "Decode JWT tokens", badge: "JWT", cat: "sec", page: "/tools/jwt-decoder" },
  { id: "uuid", name: "UUID Generator", desc: "Generate random UUIDs", badge: "id", cat: "gen", page: "/tools/uuid-generator" },
  { id: "password", name: "Password Generator", desc: "Create strong passwords", badge: "••", cat: "gen", page: "/tools/password-generator" },
  { id: "regex", name: "Regex Tester", desc: "Test & debug patterns", badge: ".*", cat: "web", page: "/tools/regex-tester" },
  { id: "qr", name: "QR Generator", desc: "Generate QR codes", badge: "▦", cat: "gen", page: "/tools/qr-generator" },
  { id: "color", name: "Color Picker", desc: "Pick & convert colors", badge: "◐", cat: "image", page: null },
];

export const CAT_META: Record<CatKey, { label: string; color: string; count: string }> = {
  data: { label: "Data & Formatting", color: "var(--cat-data)", count: "18 tools" },
  encode: { label: "Encode / Decode", color: "var(--cat-encode)", count: "12 tools" },
  gen: { label: "Generators", color: "var(--cat-gen)", count: "15 tools" },
  web: { label: "Web Dev Tools", color: "var(--cat-web)", count: "20 tools" },
  image: { label: "Image Tools", color: "var(--cat-image)", count: "8 tools" },
  sec: { label: "Security & API", color: "var(--cat-sec)", count: "10 tools" },
};

export const SHORTCUTS: [string, string][] = [
  ["Open search", "⌘ K"],
  ["Command palette", "⌘ /"],
  ["New workspace", "⌘ N"],
  ["Save current file", "⌘ S"],
  ["Duplicate tool tab", "⌘ D"],
  ["Toggle theme", "⌘ J"],
];

export type FlowStep = {
  badge: string;
  cat: CatKey;
  label: string;
  hint: string;
};

export const FLOW: FlowStep[] = [
  { badge: "{ }", cat: "data", label: "JSON Formatter", hint: "Clean up raw JSON" },
  { badge: "»", cat: "data", label: "JSON Minify", hint: "Strip whitespace" },
  { badge: "64", cat: "encode", label: "Base64 Encode", hint: "Encode the result" },
  { badge: "#", cat: "sec", label: "Hash Generator", hint: "Generate a checksum" },
  { badge: "↓", cat: "gen", label: "Export", hint: "Save to Collection" },
];
