// Node categories intentionally reuse the site's existing --cat-* tokens
// (from app/globals.css) wherever the concept overlaps with a landing-page
// tool category, so a workflow node's color always matches its equivalent
// tool card elsewhere on the site. Only two categories have no landing-page
// equivalent: "flow" (start/end nodes — uses --primary directly, no new
// token) and "text" (needs exactly one new token, --cat-text).
export type NodeCat = "flow" | "data" | "encode" | "web" | "text" | "sec" | "gen" | "image";

export const NODE_CAT_COLOR: Record<NodeCat, string> = {
  flow: "var(--primary)",
  data: "var(--cat-data)",
  encode: "var(--cat-encode)",
  web: "var(--cat-web)",
  text: "var(--cat-text)",
  sec: "var(--cat-sec)",
  gen: "var(--cat-gen)",
  image: "var(--cat-image)",
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
  | "export"
  // --- newly added node types (bring workspace up to parity with the 42 tool pages) ---
  | "title-case"
  | "sentence-case"
  | "uuid-gen"
  | "regex-test"
  | "qr-gen"
  | "json-tree"
  | "csv-view"
  | "csv-clean"
  | "csv-tsv"
  | "jsonpath"
  | "markdown-preview"
  | "json-yaml"
  | "yaml-lint"
  | "text-sort"
  | "dedupe-lines"
  | "remove-empty-lines"
  | "whitespace-clean"
  | "find-replace"
  | "text-reverse"
  | "slug-gen"
  | "palindrome-check"
  | "text-repeat"
  | "char-freq"
  | "line-number"
  | "text-truncate"
  | "line-shuffle"
  | "readability"
  | "smart-quotes"
  | "random-pick"
  | "lorem-gen"
  // --- new tools ---
  | "unix-timestamp"
  | "cron-parse"
  | "color-convert"
  | "hex-encode"
  | "hex-decode"
  | "css-unit-convert"
  | "http-header-parse"
  | "base-convert"
  | "sql-format"
  | "html-format"
  | "css-format"
  | "js-format"
  // --- batch 2 tools ---
  | "percentage-calc"
  | "timezone-convert"
  | "iso8601-format"
  | "date-diff"
  | "roman-numeral"
  | "caesar-cipher"
  | "morse-code"
  | "html-entity"
  | "unicode-escape"
  | "binary-text"
  | "base32"
  | "hmac-gen"
  | "url-parse"
  | "querystring-json"
  | "ua-parse"
  // --- batch 3 node types ---
  | "json-to-ts"
  | "markdown-to-html"
  | "html-to-markdown"
  | "curl-convert"
  | "random-number"
  | "unit-convert"
  | "env-parse"
  | "json-to-csv"
  | "nanoid-gen"
  | "prime-check"
  | "prime-list"
  | "stats-calc"
  | "ascii-encode"
  | "ascii-decode"
  | "random-color"
  | "punycode-encode"
  | "punycode-decode"
  | "base58-encode"
  | "base58-decode"
  | "robots-validate"
  | "crc32"
  | "git-branch-gen"
  | "svg-datauri-base64"
  | "svg-datauri-url"
  // --- batch 4 node types ---
  | "toml-to-json"
  | "json-to-toml"
  | "ini-to-json"
  | "json-to-ini"
  | "password-strength"
  | "regex-to-code"
  | "commit-msg-gen"
  | "package-json-validate"
  | "dockerfile-lint"
  | "semver-parse"
  | "semver-compare"
  | "css-specificity"
  | "ip-subnet-calc"
  | "mime-ext-to-type"
  | "mime-type-to-ext"
  | "http-status-lookup"
  | "number-to-words"
  | "words-to-number"
  | "base36-encode"
  | "base36-decode"
  | "mocking-case"
  // --- batch 5 node types ---
  | "tailwind-sort"
  | "regex-explain"
  | "json-to-zod"
  | "json-to-graphql"
  | "json-to-openapi"
  | "graphql-format"
  | "graphql-minify"
  | "passphrase-gen"
  | "ulid-gen"
  | "color-palette-gen"
  | "fluid-type-calc"
  | "emoji-encode"
  | "emoji-decode"
  | "htaccess-to-nginx"
  | "docker-compose-validate"
  | "jwk-to-pem"
  | "env-diff"
  | "md-to-slack"
  | "md-to-discord"
  | "csv-to-md-table"
  | "rate-limit-calc";

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

  // --- newly added ---
  "title-case": { label: "Title Case", desc: "Capitalize Each Word", badge: "Aa", cat: "text" },
  "sentence-case": { label: "Sentence case", desc: "Capitalize the first letter of each sentence", badge: "A.", cat: "text" },
  "uuid-gen": { label: "UUID Generator", desc: "Generate a random UUID v4", badge: "id", cat: "gen", noInput: true },
  "regex-test": { label: "Regex Tester", desc: "Test a pattern against the input", badge: ".*", cat: "web" },
  "qr-gen": { label: "QR Generator", desc: "Generate a QR code (data URI)", badge: "▦", cat: "gen" },
  "json-tree": { label: "JSON Tree Viewer", desc: "Explore JSON as an indented tree", badge: "⌂", cat: "data" },
  "csv-view": { label: "CSV Viewer", desc: "Render CSV as an aligned table", badge: "▤", cat: "data" },
  "csv-clean": { label: "CSV Cleaner", desc: "Trim, dedupe & strip empty rows/cols", badge: "✓", cat: "data" },
  "csv-tsv": { label: "CSV ↔ TSV Converter", desc: "Convert between CSV and TSV", badge: "⇥", cat: "data" },
  jsonpath: { label: "JSONPath Tester", desc: "Query JSON with a JSONPath expression", badge: "$.", cat: "data" },
  "markdown-preview": { label: "Markdown Previewer", desc: "Convert Markdown to HTML", badge: "M↓", cat: "data" },
  "json-yaml": { label: "JSON ⇄ YAML", desc: "Convert between JSON and basic YAML", badge: "⇄", cat: "data" },
  "yaml-lint": { label: "YAML Formatter", desc: "Validate & re-indent basic YAML", badge: "Y", cat: "data" },
  "text-sort": { label: "Text Sorter", desc: "Sort lines alphabetically, numerically & more", badge: "↕", cat: "text" },
  "dedupe-lines": { label: "Remove Duplicate Lines", desc: "Strip repeated lines, keep first occurrence", badge: "≠=", cat: "text" },
  "remove-empty-lines": { label: "Remove Empty Lines", desc: "Strip blank/whitespace-only lines", badge: "⌫", cat: "text" },
  "whitespace-clean": { label: "Whitespace Cleaner", desc: "Trim & collapse extra spaces/tabs/blank lines", badge: "⎵", cat: "text" },
  "find-replace": { label: "Find & Replace", desc: "Bulk replace text, with optional regex", badge: "⇄", cat: "text" },
  "text-reverse": { label: "Text Reverser", desc: "Reverse by character, word, or line", badge: "⇋", cat: "text" },
  "slug-gen": { label: "Slug Generator", desc: "Turn titles into URL-safe slugs", badge: "/-/", cat: "text" },
  "palindrome-check": { label: "Palindrome Checker", desc: "Check if text reads the same backwards", badge: "◫◫", cat: "text" },
  "text-repeat": { label: "Text Repeater", desc: "Repeat text N times with a separator", badge: "×N", cat: "text" },
  "char-freq": { label: "Character & Word Frequency", desc: "Rank how often each char/word appears", badge: "▦#", cat: "text" },
  "line-number": { label: "Line Numberer", desc: "Add sequential numbers to each line", badge: "1.", cat: "text" },
  "text-truncate": { label: "Text Truncator", desc: "Truncate by chars or words with a suffix", badge: "…", cat: "text" },
  "line-shuffle": { label: "Line / Word Shuffle", desc: "Randomly shuffle lines or words", badge: "⤨", cat: "text" },
  readability: { label: "Readability Checker", desc: "Flesch score, grade level & reading time", badge: "📖", cat: "text" },
  "smart-quotes": { label: "Typographic Quotes", desc: "Straight ↔ curly quotes, dashes & ellipses", badge: "“”", cat: "text" },
  "random-pick": { label: "Random Line Picker", desc: "Pick one or more random lines", badge: "🎲", cat: "gen" },
  "lorem-gen": { label: "Lorem Ipsum Generator", desc: "Placeholder text by word, sentence or paragraph", badge: "¶", cat: "gen", noInput: true },

  // --- new tools ---
  "unix-timestamp": { label: "Unix Timestamp Converter", desc: "Convert between Unix time and readable dates", badge: "⏱", cat: "gen" },
  "cron-parse": { label: "Cron Parser", desc: "Explain a cron expression & show upcoming runs", badge: "⏲", cat: "gen" },
  "color-convert": { label: "Color Format Converter", desc: "Convert between HEX, RGB & HSL", badge: "◐", cat: "image" },
  "hex-encode": { label: "Hex Encode", desc: "Encode text as hex bytes", badge: "0x", cat: "encode" },
  "hex-decode": { label: "Hex Decode", desc: "Decode hex bytes back to text", badge: "0x", cat: "encode" },
  "css-unit-convert": { label: "CSS Unit Converter", desc: "Convert between px, rem, em & pt", badge: "px", cat: "web" },
  "http-header-parse": { label: "HTTP Header Parser", desc: "Parse raw headers into structured JSON", badge: "H:", cat: "web" },
  "base-convert": { label: "Base Converter", desc: "Convert between binary, octal, decimal & hex", badge: "10₂", cat: "data" },
  "sql-format": { label: "SQL Formatter / Minify", desc: "Beautify or minify a SQL query", badge: "SQL", cat: "data" },
  "html-format": { label: "HTML Formatter / Minify", desc: "Beautify or minify HTML markup", badge: "<>", cat: "data" },
  "css-format": { label: "CSS Formatter / Minify", desc: "Beautify or minify CSS rules", badge: "{ }", cat: "data" },
  "js-format": { label: "JS Formatter / Minify", desc: "Beautify with Prettier or minify with Terser", badge: "JS", cat: "data" },
  "percentage-calc": { label: "Percentage Calculator", desc: "Percent-of, what-percent & percent change", badge: "%", cat: "gen" },
  "timezone-convert": { label: "Timezone Converter", desc: "Convert a date/time between timezones", badge: "🌐", cat: "gen" },
  "iso8601-format": { label: "ISO 8601 Formatter", desc: "Validate & format a date as ISO 8601", badge: "📅", cat: "gen" },
  "date-diff": { label: "Date Difference", desc: "Difference between two dates", badge: "Δd", cat: "gen" },
  "roman-numeral": { label: "Roman Numeral Converter", desc: "Convert between numbers and Roman numerals", badge: "MCM", cat: "data" },
  "caesar-cipher": { label: "ROT13 / Caesar Cipher", desc: "Shift letters by N positions", badge: "R13", cat: "encode" },
  "morse-code": { label: "Morse Code", desc: "Encode & decode Morse code", badge: "•—", cat: "encode" },
  "html-entity": { label: "HTML Entity Encode/Decode", desc: "Encode & decode HTML entities", badge: "&;", cat: "encode" },
  "unicode-escape": { label: "Unicode Escape/Unescape", desc: "\\uXXXX escape & unescape text", badge: "\\u", cat: "encode" },
  "binary-text": { label: "Binary ⇄ Text", desc: "Convert text to and from binary bytes", badge: "01", cat: "encode" },
  base32: { label: "Base32 Encode/Decode", desc: "Encode & decode Base32", badge: "32", cat: "encode" },
  "hmac-gen": { label: "HMAC Generator", desc: "Sign a message with a secret key", badge: "HMAC", cat: "sec" },
  "url-parse": { label: "URL Parser", desc: "Break a URL into its components", badge: "URL", cat: "web" },
  "querystring-json": { label: "Query String ⇄ JSON", desc: "Convert between a query string and JSON", badge: "?=", cat: "web" },
  "ua-parse": { label: "User-Agent Parser", desc: "Parse browser, OS & device from a UA string", badge: "UA", cat: "web" },

  // --- batch 3 ---
  "json-to-ts": { label: "JSON to TypeScript", desc: "Generate a TS interface from a JSON sample", badge: "TS", cat: "data" },
  "markdown-to-html": { label: "Markdown → HTML", desc: "Convert Markdown source to HTML markup", badge: "M→H", cat: "data" },
  "html-to-markdown": { label: "HTML → Markdown", desc: "Convert HTML markup to Markdown source", badge: "H→M", cat: "data" },
  "curl-convert": { label: "cURL → Fetch/Axios", desc: "Turn a curl command into JS request code", badge: "sh", cat: "web" },
  "random-number": { label: "Random Number Generator", desc: "Cryptographically random integers in a range", badge: "0-9", cat: "gen", noInput: true },
  "unit-convert": { label: "Unit Converter", desc: "Convert length, weight & data-size units", badge: "⇌", cat: "gen" },
  "env-parse": { label: ".env Parser / Validator", desc: "Parse .env content into JSON & flag issues", badge: ".env", cat: "data" },
  "json-to-csv": { label: "JSON to CSV", desc: "Convert a JSON array of objects to CSV", badge: "CSV", cat: "data" },
  "nanoid-gen": { label: "Nanoid Generator", desc: "Generate compact, URL-safe unique IDs", badge: "nid", cat: "gen", noInput: true },
  "prime-check": { label: "Prime Checker", desc: "Check if a number is prime & show factors", badge: "P?", cat: "gen" },
  "prime-list": { label: "Prime Generator", desc: "List all primes within a range", badge: "P…", cat: "gen" },
  "stats-calc": { label: "Statistics Calculator", desc: "Mean, median, mode & standard deviation", badge: "σ", cat: "gen" },
  "ascii-encode": { label: "Text → ASCII Codes", desc: "Convert text to decimal character codes", badge: "AS", cat: "encode" },
  "ascii-decode": { label: "ASCII Codes → Text", desc: "Convert decimal character codes to text", badge: "AS", cat: "encode" },
  "random-color": { label: "Random Color Generator", desc: "Generate random HEX, RGB or HSL colors", badge: "🎨", cat: "image", noInput: true },
  "punycode-encode": { label: "Punycode Encode", desc: "Encode a Unicode domain to Punycode (IDN)", badge: "IDN", cat: "encode" },
  "punycode-decode": { label: "Punycode Decode", desc: "Decode a Punycode (xn--) domain to Unicode", badge: "IDN", cat: "encode" },
  "base58-encode": { label: "Base58 Encode", desc: "Encode text using the Bitcoin Base58 alphabet", badge: "58", cat: "encode" },
  "base58-decode": { label: "Base58 Decode", desc: "Decode Base58 text back to the original", badge: "58", cat: "encode" },
  "robots-validate": { label: "robots.txt Validator", desc: "Check robots.txt syntax for common mistakes", badge: "/rb", cat: "web" },
  crc32: { label: "CRC32 Checksum", desc: "Compute a CRC32 checksum of the input", badge: "CRC", cat: "sec" },
  "git-branch-gen": { label: "Git Branch Name Generator", desc: "Turn a ticket title into a clean branch name", badge: "⎇", cat: "gen" },
  "svg-datauri-base64": { label: "SVG → Base64 Data URI", desc: "Convert SVG markup into a CSS-ready base64 data URI", badge: "svg", cat: "web" },
  "svg-datauri-url": { label: "SVG → URL-Encoded Data URI", desc: "Convert SVG markup into a lean URL-encoded data URI", badge: "svg", cat: "web" },

  // --- batch 4 ---
  "toml-to-json": { label: "TOML → JSON", desc: "Convert TOML config into JSON", badge: "T→J", cat: "data" },
  "json-to-toml": { label: "JSON → TOML", desc: "Convert JSON into TOML config", badge: "J→T", cat: "data" },
  "ini-to-json": { label: "INI → JSON", desc: "Convert INI config into JSON", badge: "I→J", cat: "data" },
  "json-to-ini": { label: "JSON → INI", desc: "Convert JSON into INI config", badge: "J→I", cat: "data" },
  "password-strength": { label: "Password Strength Checker", desc: "Score a password's strength & get suggestions", badge: "pw", cat: "sec" },
  "regex-to-code": { label: "Regex → Code Snippet", desc: "Turn a regex pattern into ready-to-use code", badge: "re", cat: "web" },
  "commit-msg-gen": { label: "Commit Message Formatter", desc: "Format a Conventional Commits message", badge: "git", cat: "gen" },
  "package-json-validate": { label: "package.json Validator", desc: "Validate & format a package.json file", badge: "pkg", cat: "data" },
  "dockerfile-lint": { label: "Dockerfile Linter", desc: "Catch common Dockerfile mistakes", badge: "🐳", cat: "web" },
  "semver-parse": { label: "Semver Parser", desc: "Break a semver version into its parts", badge: "semv", cat: "gen" },
  "semver-compare": { label: "Semver Comparator", desc: "Compare two semver versions", badge: "semv", cat: "gen" },
  "css-specificity": { label: "CSS Specificity Calculator", desc: "Score the specificity of CSS selectors", badge: "css", cat: "web" },
  "ip-subnet-calc": { label: "IP Subnet / CIDR Calculator", desc: "Get network, broadcast & usable host range from a CIDR", badge: "IP", cat: "web" },
  "mime-ext-to-type": { label: "Extension → MIME Type", desc: "Look up the MIME type for a file extension", badge: "mime", cat: "web" },
  "mime-type-to-ext": { label: "MIME Type → Extension", desc: "Look up file extensions for a MIME type", badge: "mime", cat: "web" },
  "http-status-lookup": { label: "HTTP Status Code Lookup", desc: "Look up the meaning of an HTTP status code", badge: "4xx", cat: "web" },
  "number-to-words": { label: "Number → Words", desc: "Spell out a number in English words", badge: "123", cat: "gen" },
  "words-to-number": { label: "Words → Number", desc: "Parse English number words back into digits", badge: "abc", cat: "gen" },
  "base36-encode": { label: "Base36 Encode", desc: "Encode text using Base36 (0-9, a-z)", badge: "36", cat: "encode" },
  "base36-decode": { label: "Base36 Decode", desc: "Decode Base36 text back to the original", badge: "36", cat: "encode" },
  "mocking-case": { label: "Mocking Case Converter", desc: "aLtErNaTiNg CaSe, meme-style", badge: "Aa", cat: "text" },

  // --- batch 5 ---
  "tailwind-sort": { label: "Tailwind Class Sorter", desc: "Sort Tailwind classes into recommended order", badge: "tw", cat: "web" },
  "regex-explain": { label: "Regex Explainer", desc: "Turn a regex pattern into a plain-English breakdown", badge: "re", cat: "web" },
  "json-to-zod": { label: "JSON to Zod Schema", desc: "Generate a Zod schema from a JSON sample", badge: "zod", cat: "data" },
  "json-to-graphql": { label: "JSON to GraphQL SDL", desc: "Generate GraphQL type definitions from a JSON sample", badge: "gql", cat: "data" },
  "json-to-openapi": { label: "JSON to OpenAPI Schema", desc: "Generate an OpenAPI schema fragment from a JSON sample", badge: "oapi", cat: "data" },
  "graphql-format": { label: "GraphQL Formatter", desc: "Pretty-print a GraphQL query", badge: "gql", cat: "data" },
  "graphql-minify": { label: "GraphQL Minifier", desc: "Collapse a GraphQL query to one line", badge: "gql", cat: "data" },
  "passphrase-gen": { label: "Passphrase Generator", desc: "Diceware-style memorable multi-word passphrases", badge: "pass", cat: "gen", noInput: true },
  "ulid-gen": { label: "ULID Generator", desc: "Generate sortable, timestamp-based unique IDs", badge: "ulid", cat: "gen", noInput: true },
  "color-palette-gen": { label: "Color Palette Generator", desc: "Generate a palette from a base color", badge: "🎨", cat: "image" },
  "fluid-type-calc": { label: "CSS Fluid Type Calculator", desc: "Generate a responsive clamp() font-size rule", badge: "clmp", cat: "web" },
  "emoji-encode": { label: "Shortcode → Emoji", desc: "Convert :shortcode: patterns into emoji", badge: "😄", cat: "text" },
  "emoji-decode": { label: "Emoji → Shortcode", desc: "Convert emoji into :shortcode: patterns", badge: "😄", cat: "text" },
  "htaccess-to-nginx": { label: ".htaccess → Nginx", desc: "Convert common Apache directives to Nginx config", badge: "ngx", cat: "web" },
  "docker-compose-validate": { label: "Docker Compose Validator", desc: "Check docker-compose.yml for common mistakes", badge: "🐳", cat: "web" },
  "jwk-to-pem": { label: "JWK → PEM Converter", desc: "Convert a JSON Web Key into PEM format", badge: "pem", cat: "sec" },
  "env-diff": { label: ".env Diff Checker", desc: "Compare two .env files for missing or differing keys", badge: ".env", cat: "data" },
  "md-to-slack": { label: "Markdown → Slack", desc: "Convert Markdown into Slack's message formatting", badge: "#", cat: "text" },
  "md-to-discord": { label: "Markdown → Discord", desc: "Convert Markdown into Discord-friendly formatting", badge: "#", cat: "text" },
  "csv-to-md-table": { label: "CSV → Markdown Table", desc: "Convert CSV rows into a Markdown table", badge: "|--|", cat: "data" },
  "rate-limit-calc": { label: "API Rate Limit Calculator", desc: "Work out remaining requests & a safe request pace", badge: "rl", cat: "gen" },
};

export const PALETTE_GROUPS: { label: string; items: NodeTypeId[] }[] = [
  { label: "Flow", items: ["input", "export"] },
  {
    label: "Data & Formatting",
    items: [
      "json-format",
      "json-minify",
      "csv-json",
      "xml-format",
      "json-tree",
      "csv-view",
      "csv-clean",
      "csv-tsv",
      "jsonpath",
      "markdown-preview",
      "json-yaml",
      "yaml-lint",
      "base-convert",
      "sql-format",
      "html-format",
      "css-format",
      "js-format",
      "roman-numeral",
      "json-to-ts",
      "markdown-to-html",
      "html-to-markdown",
      "env-parse",
      "json-to-csv",
      "toml-to-json",
      "json-to-toml",
      "ini-to-json",
      "json-to-ini",
      "package-json-validate",
      "json-to-zod",
      "json-to-graphql",
      "json-to-openapi",
      "graphql-format",
      "graphql-minify",
      "env-diff",
      "csv-to-md-table",
    ],
  },
  {
    label: "Encode / Decode",
    items: [
      "base64-encode",
      "base64-decode",
      "hex-encode",
      "hex-decode",
      "caesar-cipher",
      "morse-code",
      "html-entity",
      "unicode-escape",
      "binary-text",
      "base32",
      "ascii-encode",
      "ascii-decode",
      "punycode-encode",
      "punycode-decode",
      "base58-encode",
      "base58-decode",
      "base36-encode",
      "base36-decode",
    ],
  },
  {
    label: "Web",
    items: [
      "url-encode",
      "url-decode",
      "regex-test",
      "css-unit-convert",
      "http-header-parse",
      "url-parse",
      "querystring-json",
      "ua-parse",
      "curl-convert",
      "robots-validate",
      "svg-datauri-base64",
      "svg-datauri-url",
      "regex-to-code",
      "dockerfile-lint",
      "css-specificity",
      "ip-subnet-calc",
      "mime-ext-to-type",
      "mime-type-to-ext",
      "http-status-lookup",
      "tailwind-sort",
      "regex-explain",
      "fluid-type-calc",
      "htaccess-to-nginx",
      "docker-compose-validate",
    ],
  },
  {
    label: "Text Tools",
    items: [
      "uppercase",
      "lowercase",
      "title-case",
      "sentence-case",
      "word-count",
      "text-sort",
      "dedupe-lines",
      "remove-empty-lines",
      "whitespace-clean",
      "find-replace",
      "text-reverse",
      "slug-gen",
      "palindrome-check",
      "text-repeat",
      "char-freq",
      "line-number",
      "text-truncate",
      "line-shuffle",
      "readability",
      "smart-quotes",
      "mocking-case",
      "emoji-encode",
      "emoji-decode",
      "md-to-slack",
      "md-to-discord",
    ],
  },
  { label: "Security", items: ["hash", "jwt-decode", "hmac-gen", "crc32", "password-strength", "jwk-to-pem"] },
  {
    label: "Generator",
    items: [
      "password-gen",
      "uuid-gen",
      "qr-gen",
      "lorem-gen",
      "random-pick",
      "percentage-calc",
      "random-number",
      "nanoid-gen",
      "random-color",
      "prime-check",
      "prime-list",
      "stats-calc",
      "unit-convert",
      "git-branch-gen",
      "commit-msg-gen",
      "semver-parse",
      "semver-compare",
      "number-to-words",
      "words-to-number",
      "passphrase-gen",
      "ulid-gen",
      "rate-limit-calc",
    ],
  },
  { label: "Time & Date", items: ["unix-timestamp", "cron-parse", "timezone-convert", "iso8601-format", "date-diff"] },
  { label: "Image", items: ["color-convert", "color-palette-gen"] },
];
