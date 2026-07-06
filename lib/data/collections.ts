import {
  Braces,
  ShieldCheck,
  Globe2,
  Image as ImageIcon,
  Code2,
  Type,
  Package,
  Rocket,
  Plus,
  type LucideIcon,
} from "lucide-react";

export type CollectionOwner = "me" | "shared" | "public";

export type CollectionWorkflow = {
  id: string;
  name: string;
  status: "active" | "draft" | "paused";
  lastRun: string;
  steps: number;
};

export type CollectionActivityItem = {
  id: string;
  text: string;
  time: string;
};

export type Collection = {
  id: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  tags: string[];
  workflows: number;
  tools: number;
  dataSize: string;
  executions: number;
  owner: CollectionOwner;
  visibility: "Private" | "Shared" | "Public";
  starred?: boolean;
  createdAgo: string;
  updatedAgo: string;
  autoUpdate?: boolean;
  allowDuplicate?: boolean;
  toolIds: string[];
  workflowsList: CollectionWorkflow[];
  activity: CollectionActivityItem[];
};

export const COLLECTIONS: Collection[] = [
  {
    id: "json-tools",
    name: "JSON Tools Collection",
    desc: "Essential JSON formatting, validation, conversion and manipulation tools",
    icon: Braces,
    color: "var(--cat-data)",
    tags: ["json", "formatting", "data", "conversion", "validation"],
    workflows: 18,
    tools: 24,
    dataSize: "2.45 MB",
    executions: 156,
    owner: "me",
    visibility: "Private",
    starred: true,
    createdAgo: "2 days ago",
    updatedAgo: "1 hour ago",
    autoUpdate: true,
    allowDuplicate: true,
    toolIds: ["json", "csv-json", "xml", "case", "words"],
    workflowsList: [
      { id: "wf-1", name: "Clean & Validate JSON", status: "active", lastRun: "1 hour ago", steps: 3 },
      { id: "wf-2", name: "CSV to JSON Batch Import", status: "active", lastRun: "yesterday", steps: 4 },
      { id: "wf-3", name: "JSON Schema Validator", status: "draft", lastRun: "3 days ago", steps: 2 },
      { id: "wf-4", name: "Minify for Production", status: "active", lastRun: "1 hour ago", steps: 2 },
    ],
    activity: [
      { id: "a-1", text: "Auto-update refreshed 3 workflows", time: "1 hour ago" },
      { id: "a-2", text: "You added \"JSON Schema Validator\"", time: "3 days ago" },
      { id: "a-3", text: "Shared read access with the Backend team", time: "4 days ago" },
      { id: "a-4", text: "Collection created", time: "2 days ago" },
    ],
  },
  {
    id: "security-toolkit",
    name: "Security Toolkit",
    desc: "Password, hash, JWT, and encryption tools for security professionals",
    icon: ShieldCheck,
    color: "var(--secondary)",
    tags: ["security", "encryption", "auth"],
    workflows: 12,
    tools: 18,
    dataSize: "1.1 MB",
    executions: 89,
    owner: "me",
    visibility: "Private",
    starred: true,
    createdAgo: "5 days ago",
    updatedAgo: "3 hours ago",
    autoUpdate: true,
    allowDuplicate: true,
    toolIds: ["password", "hash", "jwt", "uuid"],
    workflowsList: [
      { id: "wf-1", name: "Rotate & Hash Secrets", status: "active", lastRun: "3 hours ago", steps: 3 },
      { id: "wf-2", name: "JWT Audit Chain", status: "active", lastRun: "yesterday", steps: 4 },
      { id: "wf-3", name: "Bulk Password Generator", status: "paused", lastRun: "1 week ago", steps: 2 },
    ],
    activity: [
      { id: "a-1", text: "Auto-update refreshed 2 workflows", time: "3 hours ago" },
      { id: "a-2", text: "You ran \"JWT Audit Chain\"", time: "yesterday" },
      { id: "a-3", text: "Paused \"Bulk Password Generator\"", time: "1 week ago" },
      { id: "a-4", text: "Collection created", time: "5 days ago" },
    ],
  },
  {
    id: "web-dev-suite",
    name: "Web Developer Suite",
    desc: "Web utilities, URL tools, HTTP clients and development helpers",
    icon: Globe2,
    color: "var(--cat-web)",
    tags: ["web", "http", "url"],
    workflows: 13,
    tools: 22,
    dataSize: "980 KB",
    executions: 64,
    owner: "me",
    visibility: "Private",
    createdAgo: "1 week ago",
    updatedAgo: "yesterday",
    autoUpdate: false,
    allowDuplicate: true,
    toolIds: ["url", "regex", "case", "words"],
    workflowsList: [
      { id: "wf-1", name: "URL Query Sanitizer", status: "active", lastRun: "yesterday", steps: 3 },
      { id: "wf-2", name: "Regex Pattern Test Suite", status: "active", lastRun: "2 days ago", steps: 5 },
      { id: "wf-3", name: "Slug Generator", status: "draft", lastRun: "1 week ago", steps: 2 },
    ],
    activity: [
      { id: "a-1", text: "You ran \"URL Query Sanitizer\"", time: "yesterday" },
      { id: "a-2", text: "Updated \"Regex Pattern Test Suite\"", time: "2 days ago" },
      { id: "a-3", text: "Collection created", time: "1 week ago" },
    ],
  },
  {
    id: "image-processing",
    name: "Image Processing",
    desc: "Image conversion, optimization, metadata and analysis tools",
    icon: ImageIcon,
    color: "var(--cat-image)",
    tags: ["image", "convert", "optimize"],
    workflows: 10,
    tools: 16,
    dataSize: "4.8 MB",
    executions: 41,
    owner: "shared",
    visibility: "Shared",
    createdAgo: "2 weeks ago",
    updatedAgo: "2 days ago",
    autoUpdate: true,
    allowDuplicate: false,
    toolIds: ["color"],
    workflowsList: [
      { id: "wf-1", name: "Batch Image Optimizer", status: "active", lastRun: "2 days ago", steps: 3 },
      { id: "wf-2", name: "Palette Extractor", status: "draft", lastRun: "5 days ago", steps: 2 },
    ],
    activity: [
      { id: "a-1", text: "Auto-update refreshed 1 workflow", time: "2 days ago" },
      { id: "a-2", text: "Shared with the Design team", time: "1 week ago" },
      { id: "a-3", text: "Collection created", time: "2 weeks ago" },
    ],
  },
  {
    id: "developer-utilities",
    name: "Developer Utilities",
    desc: "Code formatters, minifiers, encoders and developer productivity tools",
    icon: Code2,
    color: "var(--warning)",
    tags: ["developer", "code", "utility"],
    workflows: 20,
    tools: 28,
    dataSize: "3.2 MB",
    executions: 212,
    owner: "me",
    visibility: "Private",
    createdAgo: "3 weeks ago",
    updatedAgo: "4 hours ago",
    autoUpdate: true,
    allowDuplicate: true,
    toolIds: ["json", "base64", "case", "words", "uuid", "regex"],
    workflowsList: [
      { id: "wf-1", name: "Code Formatter Chain", status: "active", lastRun: "4 hours ago", steps: 4 },
      { id: "wf-2", name: "Base64 Asset Encoder", status: "active", lastRun: "yesterday", steps: 2 },
      { id: "wf-3", name: "UUID Batch Generator", status: "active", lastRun: "2 days ago", steps: 2 },
      { id: "wf-4", name: "Regex Refactor Helper", status: "draft", lastRun: "1 week ago", steps: 3 },
    ],
    activity: [
      { id: "a-1", text: "Auto-update refreshed 4 workflows", time: "4 hours ago" },
      { id: "a-2", text: "You added \"Regex Refactor Helper\"", time: "1 week ago" },
      { id: "a-3", text: "Exported collection as backup", time: "2 weeks ago" },
      { id: "a-4", text: "Collection created", time: "3 weeks ago" },
    ],
  },
  {
    id: "text-processing",
    name: "Text Processing",
    desc: "Text manipulation, case conversion, analysis and transformation tools",
    icon: Type,
    color: "var(--cat-text)",
    tags: ["text", "manipulation", "convert"],
    workflows: 14,
    tools: 20,
    dataSize: "610 KB",
    executions: 77,
    owner: "public",
    visibility: "Public",
    createdAgo: "1 month ago",
    updatedAgo: "5 days ago",
    autoUpdate: false,
    allowDuplicate: true,
    toolIds: ["case", "words"],
    workflowsList: [
      { id: "wf-1", name: "Bulk Case Converter", status: "active", lastRun: "5 days ago", steps: 2 },
      { id: "wf-2", name: "Word & Character Report", status: "paused", lastRun: "2 weeks ago", steps: 2 },
    ],
    activity: [
      { id: "a-1", text: "You ran \"Bulk Case Converter\"", time: "5 days ago" },
      { id: "a-2", text: "Made public for the community", time: "3 weeks ago" },
      { id: "a-3", text: "Collection created", time: "1 month ago" },
    ],
  },
  {
    id: "data-converter",
    name: "Data Converter",
    desc: "Convert between different data formats and structures",
    icon: Package,
    color: "var(--cat-sec)",
    tags: ["convert", "transform", "data"],
    workflows: 16,
    tools: 19,
    dataSize: "1.7 MB",
    executions: 103,
    owner: "me",
    visibility: "Private",
    createdAgo: "1 month ago",
    updatedAgo: "6 days ago",
    autoUpdate: true,
    allowDuplicate: true,
    toolIds: ["json", "csv-json", "xml", "base64"],
    workflowsList: [
      { id: "wf-1", name: "Multi-format Converter", status: "active", lastRun: "6 days ago", steps: 4 },
      { id: "wf-2", name: "XML to JSON Bridge", status: "active", lastRun: "1 week ago", steps: 3 },
      { id: "wf-3", name: "Legacy Data Migrator", status: "draft", lastRun: "3 weeks ago", steps: 5 },
    ],
    activity: [
      { id: "a-1", text: "Auto-update refreshed 3 workflows", time: "6 days ago" },
      { id: "a-2", text: "You added \"Legacy Data Migrator\"", time: "3 weeks ago" },
      { id: "a-3", text: "Collection created", time: "1 month ago" },
    ],
  },
  {
    id: "api-testing",
    name: "API & Testing",
    desc: "API testing, mock servers, and network debugging tools",
    icon: Rocket,
    color: "var(--primary)",
    tags: ["api", "testing", "debug"],
    workflows: 11,
    tools: 17,
    dataSize: "2.0 MB",
    executions: 58,
    owner: "shared",
    visibility: "Shared",
    createdAgo: "2 months ago",
    updatedAgo: "1 week ago",
    autoUpdate: false,
    allowDuplicate: true,
    toolIds: ["url", "jwt", "regex"],
    workflowsList: [
      { id: "wf-1", name: "Mock Server Smoke Test", status: "active", lastRun: "1 week ago", steps: 4 },
      { id: "wf-2", name: "JWT Auth Debugger", status: "paused", lastRun: "3 weeks ago", steps: 3 },
    ],
    activity: [
      { id: "a-1", text: "You ran \"Mock Server Smoke Test\"", time: "1 week ago" },
      { id: "a-2", text: "Shared with the QA team", time: "1 month ago" },
      { id: "a-3", text: "Collection created", time: "2 months ago" },
    ],
  },
];

export const FILTER_TABS: { key: "all" | CollectionOwner; label: string; count: number }[] = [
  { key: "all", label: "All Collections", count: 12 },
  { key: "me", label: "My Collections", count: 8 },
  { key: "shared", label: "Shared with me", count: 4 },
  { key: "public", label: "Public", count: 56 },
];

export type CollectionTemplate = {
  id: string;
  label: string;
  meta: string;
  icon: LucideIcon;
  color: string;
};

export const COLLECTION_TEMPLATES: CollectionTemplate[] = [
  { id: "blank", label: "Start from Scratch", meta: "Create an empty collection", icon: Plus, color: "var(--text-dim)" },
  { id: "web-dev", label: "Web Development", meta: "15+ workflows · 25+ tools", icon: Globe2, color: "var(--cat-web)" },
  { id: "security", label: "Security Analysis", meta: "10+ workflows · 20+ tools", icon: ShieldCheck, color: "var(--cat-sec)" },
  { id: "data-processing", label: "Data Processing", meta: "12+ workflows · 18+ tools", icon: Package, color: "var(--warning)" },
  { id: "api-testing", label: "API Testing", meta: "8+ workflows · 15+ tools", icon: Rocket, color: "var(--primary)" },
];
