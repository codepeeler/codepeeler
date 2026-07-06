import type {
  ApiRequest,
  ApiResponse,
  AuthConfig,
  Collection,
  Environment,
  GlobalVariable,
  HistoryEntry,
  KVRow,
  RequestBody,
  RequestError,
  RequestTab,
  TestResult,
} from "./types";

/* ============================= id / factory helpers ============================= */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function newRow(extra: Partial<KVRow> = {}): KVRow {
  return { id: uid(), key: "", value: "", desc: "", enabled: true, ...extra };
}

export function emptyRequest(overrides: Partial<ApiRequest> = {}): ApiRequest {
  const body: RequestBody = { mode: "none", raw: "", rawType: "json", formData: [newRow()], urlencoded: [newRow()] };
  const auth: AuthConfig = { type: "none", token: "", username: "", password: "", apiKeyName: "", apiKeyValue: "", apiKeyIn: "header" };
  return {
    method: "GET",
    url: "",
    params: [newRow()],
    headers: [newRow()],
    body,
    auth,
    preScript:
      "// Runs before the request is sent.\n// pt.environment.set('token', '123');\n// pt.variables.set('now', Date.now());\n",
    testScript:
      '// Runs after the response is received.\npt.test("Status code is 2xx", () => {\n  pt.expect(pt.response.status).toBeBetween(200, 299);\n});\n',
    settings: { timeout: 30000, followRedirects: true, sslVerify: true },
    ...overrides,
  };
}

export function newTab(overrides: Partial<RequestTab> = {}): RequestTab {
  return {
    id: uid(),
    name: "Untitled Request",
    saved: false,
    collectionId: null,
    itemId: null,
    request: emptyRequest(),
    response: null,
    error: null,
    isSending: false,
    reqTab: "params",
    respTab: "pretty",
    testResults: null,
    ...overrides,
  };
}

/* ============================= variable interpolation ============================= */
export function collectVars(environments: Environment[], activeEnvId: string | null, globalVars: GlobalVariable[]): Record<string, string> {
  const map: Record<string, string> = {};
  globalVars.forEach((v) => { if (v.key) map[v.key] = v.value; });
  const env = environments.find((e) => e.id === activeEnvId);
  if (env) env.variables.forEach((v) => { if (v.key && v.enabled !== false) map[v.key] = v.value; });
  return map;
}

export function interpolate(str: string | undefined, vars: Record<string, string>): string {
  if (!str) return str ?? "";
  return str.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (m, key) => (key in vars ? vars[key] : m));
}

/* ============================= building the actual fetch call ============================= */
export function buildFinalUrl(request: ApiRequest, vars: Record<string, string>): string {
  const base = interpolate(request.url.trim(), vars);
  const enabledParams = request.params.filter((p) => p.enabled && p.key);
  if (!enabledParams.length) return base;
  const [path, existingQuery] = base.split("?");
  const usp = new URLSearchParams(existingQuery || "");
  enabledParams.forEach((p) => usp.set(interpolate(p.key, vars), interpolate(p.value, vars)));
  const qs = usp.toString();
  return qs ? `${path}?${qs}` : path;
}

function buildAuthHeaders(auth: AuthConfig, vars: Record<string, string>) {
  const headers: Record<string, string> = {};
  const params: Record<string, string> = {};
  if (auth.type === "bearer" && auth.token) {
    headers["Authorization"] = `Bearer ${interpolate(auth.token, vars)}`;
  } else if (auth.type === "basic" && (auth.username || auth.password)) {
    const u = interpolate(auth.username, vars);
    const p = interpolate(auth.password, vars);
    headers["Authorization"] = `Basic ${btoa(`${u}:${p}`)}`;
  } else if (auth.type === "apikey" && auth.apiKeyName) {
    const val = interpolate(auth.apiKeyValue, vars);
    if (auth.apiKeyIn === "query") params[interpolate(auth.apiKeyName, vars)] = val;
    else headers[interpolate(auth.apiKeyName, vars)] = val;
  }
  return { headers, params };
}

const CONTENT_TYPES: Record<string, string> = { json: "application/json", text: "text/plain", html: "text/html", xml: "application/xml", js: "application/javascript" };

export function buildHeadersAndBody(request: ApiRequest, vars: Record<string, string>) {
  const headers: Record<string, string> = {};
  request.headers.filter((h) => h.enabled && h.key).forEach((h) => { headers[interpolate(h.key, vars)] = interpolate(h.value, vars); });
  const { headers: authHeaders, params: authParams } = buildAuthHeaders(request.auth, vars);
  Object.assign(headers, authHeaders);

  let body: string | FormData | undefined;
  const mode = request.body.mode;
  const hasCT = () => Object.keys(headers).some((h) => h.toLowerCase() === "content-type");

  if (mode === "raw" && request.body.raw) {
    body = interpolate(request.body.raw, vars);
    if (!hasCT()) headers["Content-Type"] = CONTENT_TYPES[request.body.rawType] || "text/plain";
  } else if (mode === "urlencoded") {
    const usp = new URLSearchParams();
    request.body.urlencoded.filter((r) => r.enabled && r.key).forEach((r) => usp.append(interpolate(r.key, vars), interpolate(r.value, vars)));
    body = usp.toString();
    if (!hasCT()) headers["Content-Type"] = "application/x-www-form-urlencoded";
  } else if (mode === "form-data") {
    const fd = new FormData();
    request.body.formData.filter((r) => r.enabled && r.key).forEach((r) => fd.append(interpolate(r.key, vars), interpolate(r.value, vars)));
    body = fd as unknown as string; // browser sets multipart content-type w/ boundary automatically
  } else if (mode === "graphql") {
    body = interpolate(request.body.raw, vars);
    if (!hasCT()) headers["Content-Type"] = "application/json";
  }
  return { headers, body, authParams };
}

/* ============================= script sandbox =============================
 * localEnvironments / localGlobalVars are mutated synchronously so a pre-request
 * script's pt.environment.set(...) is immediately visible to the same request run,
 * instead of waiting on React's async state batching. They're persisted once,
 * at the end of executeRequest(). */
interface ScriptCtxArgs {
  localEnvironments: Environment[];
  activeEnvId: string | null;
  localGlobalVars: GlobalVariable[];
  request: ApiRequest;
  response?: ApiResponse;
}
function makeScriptContext({ localEnvironments, activeEnvId, localGlobalVars, request, response }: ScriptCtxArgs) {
  const envIndex = localEnvironments.findIndex((e) => e.id === activeEnvId);
  const results: TestResult[] = [];
  const ctx: any = {
    environment: {
      get(key: string) {
        const env = localEnvironments[envIndex];
        const found = env && env.variables.find((v) => v.key === key);
        return found ? found.value : undefined;
      },
      set(key: string, value: unknown) {
        if (envIndex === -1) return;
        const env = localEnvironments[envIndex];
        const idx = env.variables.findIndex((v) => v.key === key);
        if (idx >= 0) env.variables[idx] = { ...env.variables[idx], value: String(value) };
        else env.variables.push({ id: uid(), key, value: String(value), enabled: true });
      },
    },
    variables: {
      get(key: string) { const f = localGlobalVars.find((v) => v.key === key); return f ? f.value : undefined; },
      set(key: string, value: unknown) {
        const idx = localGlobalVars.findIndex((v) => v.key === key);
        if (idx >= 0) localGlobalVars[idx] = { ...localGlobalVars[idx], value: String(value) };
        else localGlobalVars.push({ id: uid(), key, value: String(value) });
      },
    },
    request: { method: request.method, url: request.url },
    response: response
      ? {
          status: response.status, statusText: response.statusText, headers: response.headers,
          duration: response.duration, size: response.size,
          json() { try { return JSON.parse(response.bodyText); } catch { throw new Error("Response is not valid JSON"); } },
          text() { return response.bodyText; },
        }
      : undefined,
    test(name: string, testFn: () => void) {
      try { testFn(); results.push({ name, pass: true }); } catch (e: any) { results.push({ name, pass: false, error: e?.message || String(e) }); }
    },
    expect(actual: any) {
      const chain = {
        toBe(exp: any) { if (actual !== exp) throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(exp)}`); return chain; },
        toEqual(exp: any) { if (JSON.stringify(actual) !== JSON.stringify(exp)) throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(exp)}`); return chain; },
        toBeBetween(min: number, max: number) { if (!(actual >= min && actual <= max)) throw new Error(`Expected ${actual} to be between ${min}-${max}`); return chain; },
        toInclude(sub: string) { if (!String(actual).includes(sub)) throw new Error(`Expected ${JSON.stringify(actual)} to include ${JSON.stringify(sub)}`); return chain; },
        toExist() { if (actual === undefined || actual === null) throw new Error("Expected value to exist"); return chain; },
        toBeLessThan(n: number) { if (!(actual < n)) throw new Error(`Expected ${actual} to be less than ${n}`); return chain; },
        toBeGreaterThan(n: number) { if (!(actual > n)) throw new Error(`Expected ${actual} to be greater than ${n}`); return chain; },
      };
      return chain;
    },
    console: { log: (...a: unknown[]) => console.log("[pre-request/test]", ...a) },
  };
  return { ctx, results };
}

function runScript(code: string, ctx: unknown): { ok: boolean; error: string | null } {
  if (!code || !code.trim()) return { ok: true, error: null };
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("pt", `"use strict";\n${code}`);
    fn(ctx);
    return { ok: true, error: null };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

/* ============================= sending the request ============================= */
export interface ExecuteContext {
  environments: Environment[];
  activeEnvId: string | null;
  globalVars: GlobalVariable[];
  setEnvironments: (envs: Environment[]) => void;
  setGlobalVars: (vars: GlobalVariable[]) => void;
}
export interface ExecuteResult {
  response: ApiResponse | null;
  error: RequestError | null;
  testResults: TestResult[] | null;
  preScriptError: string | null;
  finalUrl: string;
}

export async function executeRequest(tab: RequestTab, ctxArgs: ExecuteContext): Promise<ExecuteResult> {
  const { environments, activeEnvId, globalVars, setEnvironments, setGlobalVars } = ctxArgs;
  const request = tab.request;
  const localEnvironments = environments.map((e) => ({ ...e, variables: e.variables.map((v) => ({ ...v })) }));
  const localGlobalVars = globalVars.map((v) => ({ ...v }));

  const { ctx: preCtx } = makeScriptContext({ localEnvironments, activeEnvId, localGlobalVars, request });
  const preResult = runScript(request.preScript, preCtx);

  const finalVars = collectVars(localEnvironments, activeEnvId, localGlobalVars);
  let url = buildFinalUrl(request, finalVars);
  const { headers, body, authParams } = buildHeadersAndBody(request, finalVars);
  if (Object.keys(authParams).length) {
    const usp = new URLSearchParams(url.includes("?") ? url.split("?")[1] : "");
    Object.entries(authParams).forEach(([k, v]) => usp.set(k, v));
    url = `${url.split("?")[0]}?${usp.toString()}`;
  }

  const controller = new AbortController();
  const timeout = request.settings?.timeout || 30000;
  const timer = setTimeout(() => controller.abort(), timeout);
  const start = performance.now();

  let response: ApiResponse | null = null;
  let error: RequestError | null = null;
  try {
    const fetchInit: RequestInit = { method: request.method, headers, signal: controller.signal };
    if (!["GET", "HEAD"].includes(request.method) && body !== undefined) fetchInit.body = body as BodyInit;
    const res = await fetch(url, fetchInit);
    const duration = performance.now() - start;
    const bodyText = await res.text();
    const size = new Blob([bodyText]).size;
    const resHeaders: Record<string, string> = {};
    res.headers.forEach((v, k) => { resHeaders[k] = v; });
    response = { status: res.status, statusText: res.statusText, ok: res.ok, headers: resHeaders, bodyText, size, duration, url };
  } catch (e: any) {
    const duration = performance.now() - start;
    if (e?.name === "AbortError") error = { message: `Request timed out after ${timeout}ms`, duration };
    else error = { message: e?.message || "Network error — the request could not be completed (often CORS, an unreachable host, or mixed content).", duration };
  } finally {
    clearTimeout(timer);
  }

  let testResults: TestResult[] | null = null;
  if (response) {
    const { ctx: testCtx, results } = makeScriptContext({ localEnvironments, activeEnvId, localGlobalVars, request, response });
    const testRun = runScript(request.testScript, testCtx);
    testResults = testRun.ok ? results : [{ name: "Test script error", pass: false, error: testRun.error ?? undefined }];
  }

  setEnvironments(localEnvironments);
  setGlobalVars(localGlobalVars);

  return { response, error, testResults, preScriptError: preResult.error, finalUrl: url };
}

/* ============================= code generation ============================= */
export function genCurl(request: ApiRequest, vars: Record<string, string>): string {
  const url = buildFinalUrl(request, vars);
  const { headers, body } = buildHeadersAndBody(request, vars);
  const lines = [`curl --location '${url}'`, `--request ${request.method}`];
  Object.entries(headers).forEach(([k, v]) => lines.push(`--header '${k}: ${v}'`));
  if (body !== undefined && !(body instanceof FormData)) lines.push(`--data '${String(body).replace(/'/g, "'\\''")}'`);
  else if (request.body.mode === "form-data") {
    request.body.formData.filter((r) => r.enabled && r.key).forEach((r) => lines.push(`--form '${interpolate(r.key, vars)}=${interpolate(r.value, vars)}'`));
  }
  return lines.join(" \\\n  ");
}
export function genFetch(request: ApiRequest, vars: Record<string, string>): string {
  const url = buildFinalUrl(request, vars);
  const { headers, body } = buildHeadersAndBody(request, vars);
  const bodyLine = body !== undefined && !(body instanceof FormData) ? `,\n  body: ${JSON.stringify(body)}` : "";
  return `fetch(${JSON.stringify(url)}, {\n  method: ${JSON.stringify(request.method)},\n  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, "\n  ")}${bodyLine}\n})\n  .then((res) => res.json())\n  .then((data) => console.log(data))\n  .catch((err) => console.error(err));`;
}
export function genAxios(request: ApiRequest, vars: Record<string, string>): string {
  const url = buildFinalUrl(request, vars);
  const { headers, body } = buildHeadersAndBody(request, vars);
  const dataLine = body !== undefined && !(body instanceof FormData) ? `,\n  data: ${JSON.stringify(body)}` : "";
  return `import axios from 'axios';\n\naxios({\n  method: ${JSON.stringify(request.method.toLowerCase())},\n  url: ${JSON.stringify(url)},\n  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, "\n  ")}${dataLine}\n})\n  .then((res) => console.log(res.data))\n  .catch((err) => console.error(err));`;
}
export function genPython(request: ApiRequest, vars: Record<string, string>): string {
  const url = buildFinalUrl(request, vars);
  const { headers, body } = buildHeadersAndBody(request, vars);
  const pyHeaders = JSON.stringify(headers, null, 4).replace(/"/g, "'");
  const dataLine = body !== undefined && !(body instanceof FormData) ? `,\n    data='''${String(body)}'''` : "";
  return `import requests\n\nresponse = requests.request(\n    method='${request.method}',\n    url='${url}',\n    headers=${pyHeaders}${dataLine}\n)\n\nprint(response.status_code)\nprint(response.text)`;
}
export function genNodeHttp(request: ApiRequest, vars: Record<string, string>): string {
  const url = buildFinalUrl(request, vars);
  const { headers } = buildHeadersAndBody(request, vars);
  return `// Node.js (built-in fetch, Node 18+)\nconst res = await fetch(${JSON.stringify(url)}, {\n  method: ${JSON.stringify(request.method)},\n  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, "\n  ")}\n});\nconsole.log(res.status, await res.text());`;
}

/* ============================= curl import parser (basic) ============================= */
export function parseCurl(input: string): ApiRequest {
  const req = emptyRequest();
  req.headers = [];
  const text = input.trim().replace(/\\\n/g, " ").replace(/^curl\s+/, "");
  const tokens: string[] = [];
  const re = /'([^']*)'|"([^"]*)"|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) tokens.push((m[1] ?? m[2] ?? m[3]) as string);

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === "--location" || t === "-L") continue;
    else if (t === "-X" || t === "--request") { req.method = ((tokens[++i] || "GET").toUpperCase()) as ApiRequest["method"]; }
    else if (t === "-H" || t === "--header") {
      const h = tokens[++i] || "";
      const idx = h.indexOf(":");
      if (idx > -1) req.headers.push(newRow({ key: h.slice(0, idx).trim(), value: h.slice(idx + 1).trim() }));
    } else if (t === "-d" || t === "--data" || t === "--data-raw" || t === "--data-binary") {
      req.body.mode = "raw"; req.body.raw = tokens[++i] || ""; if (req.method === "GET") req.method = "POST";
      try { JSON.parse(req.body.raw); req.body.rawType = "json"; } catch { req.body.rawType = "text"; }
    } else if (t === "-u" || t === "--user") {
      const up = (tokens[++i] || "").split(":");
      req.auth = { ...req.auth, type: "basic", username: up[0] || "", password: up[1] || "" };
    } else if (t.startsWith("http")) { req.url = t; }
    else if (!t.startsWith("-") && !req.url) { req.url = t; }
  }
  if (!req.headers.length) req.headers = [newRow()];
  return req;
}

/* ============================= formatting helpers ============================= */
export function formatBytes(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(2)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
export function formatMs(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n < 1000) return `${Math.round(n)} ms`;
  return `${(n / 1000).toFixed(2)} s`;
}
export function statusClass(code: number | null | undefined): string {
  if (!code || code === 0) return "text-[var(--danger)]";
  if (code < 300) return "text-[var(--success)]";
  if (code < 400) return "text-[var(--secondary)]";
  if (code < 500) return "text-[var(--warning)]";
  return "text-[var(--danger)]";
}
const STATUS_TEXT: Record<number, string> = {
  200: "OK", 201: "Created", 202: "Accepted", 204: "No Content", 301: "Moved Permanently", 302: "Found",
  304: "Not Modified", 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found",
  405: "Method Not Allowed", 408: "Request Timeout", 409: "Conflict", 422: "Unprocessable Entity",
  429: "Too Many Requests", 500: "Internal Server Error", 502: "Bad Gateway", 503: "Service Unavailable", 504: "Gateway Timeout",
};
export function statusText(code: number): string { return STATUS_TEXT[code] || ""; }

export function methodColorVar(method: string): string {
  return `var(--${method.toLowerCase()})`;
}

export const COMMON_HEADERS = ["Accept", "Authorization", "Content-Type", "User-Agent", "Cache-Control", "Accept-Language", "Accept-Encoding", "X-Requested-With", "X-API-Key", "Origin", "Referer"];

export function pruneCollectionItems(items: Collection["items"], id: string): Collection["items"] {
  return items.filter((i) => i.id !== id).map((i) => (i.type === "folder" ? { ...i, children: pruneCollectionItems(i.children, id) } : i));
}
export function renameCollectionItems(items: Collection["items"], id: string, name: string): Collection["items"] {
  return items.map((i) => (i.id === id ? { ...i, name } : i.type === "folder" ? { ...i, children: renameCollectionItems(i.children, id, name) } : i));
}
