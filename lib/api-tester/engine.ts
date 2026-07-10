import type {
  ApiRequest,
  ApiResponse,
  AuthConfig,
  ChainExtraction,
  Collection,
  CollectionItem,
  Environment,
  EnvironmentVariable,
  GlobalVariable,
  HttpMethod,
  KVRow,
  LoadTestConfig,
  LoadTestPerRequestStats,
  LoadTestSample,
  LoadTestSummary,
  MockEndpoint,
  MockServer,
  RequestBody,
  RequestError,
  RequestTab,
  RunnerDataRow,
  RunnerExtractedVar,
  RunnerRequestResult,
  RunnerSummary,
  StoredCookie,
  StreamMessage,
  TestResult,
} from "./types";
import { deepDiff } from "@/lib/json-diff";

/* ============================= id / factory helpers ============================= */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function newRow(extra: Partial<KVRow> = {}): KVRow {
  return { id: uid(), key: "", value: "", desc: "", enabled: true, ...extra };
}

export function emptyRequest(overrides: Partial<ApiRequest> = {}): ApiRequest {
  const body: RequestBody = { mode: "none", raw: "", rawType: "json", formData: [newRow()], urlencoded: [newRow()] };
  const auth: AuthConfig = {
    type: "none",
    token: "",
    username: "",
    password: "",
    apiKeyName: "",
    apiKeyValue: "",
    apiKeyIn: "header",
    oauth2: {
      grantType: "client_credentials",
      accessTokenUrl: "",
      clientId: "",
      clientSecret: "",
      scope: "",
      username: "",
      password: "",
      manualToken: "",
      headerPrefix: "Bearer",
    },
    awsv4: { accessKeyId: "", secretAccessKey: "", sessionToken: "", region: "us-east-1", service: "execute-api" },
  };
  return {
    method: "GET",
    url: "",
    protocol: "http",
    wsProtocols: "",
    params: [newRow()],
    headers: [newRow()],
    body,
    auth,
    preScript:
      "// Runs before the request is sent.\n// pt.environment.set('token', '123');\n// pt.variables.set('now', Date.now());\n",
    testScript:
      '// Runs after the response is received.\npt.test("Status code is 2xx", () => {\n  pt.expect(pt.response.status).toBeBetween(200, 299);\n});\n',
    settings: { timeout: 30000, followRedirects: true, sslVerify: true, maxRetries: 0, retryDelayMs: 500, forceProxy: false },
    localVars: [],
    description: "",
    chainExtractions: [],
    ...overrides,
  };
}

export function newChainExtraction(overrides: Partial<ChainExtraction> = {}): ChainExtraction {
  return { id: uid(), enabled: true, sourcePath: "", varName: "", scope: "environment", ...overrides };
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
    previousResponse: null,
    streamStatus: "idle",
    streamMessages: [],
    ...overrides,
  };
}

export function newMockEndpoint(overrides: Partial<MockEndpoint> = {}): MockEndpoint {
  return {
    id: uid(),
    method: "GET",
    path: "/",
    statusCode: 200,
    headers: [newRow()],
    body: '{\n  "message": "Hello from your mock server"\n}',
    delayMs: 0,
    enabled: true,
    ...overrides,
  };
}

export function newMockServer(name = "New Mock Server"): MockServer {
  return { id: uid(), name, enabled: true, endpoints: [newMockEndpoint()] };
}

export function newStreamMessage(direction: "sent" | "received" | "system", data: string, event?: string): StreamMessage {
  return { id: uid(), direction, data, event, timestamp: Date.now() };
}

/* ============================= variable interpolation =============================
 * Precedence, lowest to highest: global -> environment -> collection -> request-local.
 * Each later layer overrides keys set by earlier ones, mirroring Postman's variable scope order. */
export function collectVars(
  environments: Environment[],
  activeEnvId: string | null,
  globalVars: GlobalVariable[],
  collectionVars: EnvironmentVariable[] = [],
  localVars: EnvironmentVariable[] = []
): Record<string, string> {
  const map: Record<string, string> = {};
  globalVars.forEach((v) => { if (v.key) map[v.key] = v.value; });
  const env = environments.find((e) => e.id === activeEnvId);
  if (env) env.variables.forEach((v) => { if (v.key && v.enabled !== false) map[v.key] = v.value; });
  collectionVars.forEach((v) => { if (v.key && v.enabled !== false) map[v.key] = v.value; });
  localVars.forEach((v) => { if (v.key && v.enabled !== false) map[v.key] = v.value; });
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

/* ---- crypto helpers (Web Crypto, available in browser & modern Node) ---- */
async function sha256Hex(input: string | ArrayBuffer): Promise<string> {
  const data = typeof input === "string" ? new TextEncoder().encode(input) : input;
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function hmacSha256(key: ArrayBuffer | string, data: string): Promise<ArrayBuffer> {
  const keyData = typeof key === "string" ? new TextEncoder().encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey("raw", keyData as BufferSource, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
}

/** In-memory OAuth2 token cache, keyed by token endpoint + client id + scope. Cleared on page reload — mirrors a lightweight client credentials cache without persisting secrets to localStorage. */
const oauth2TokenCache = new Map<string, { token: string; expiry: number }>();

async function fetchOAuth2Token(auth: AuthConfig, vars: Record<string, string>): Promise<string> {
  const cfg = auth.oauth2;
  if (cfg.grantType === "authorization_code_manual") return interpolate(cfg.manualToken, vars);

  const url = interpolate(cfg.accessTokenUrl, vars);
  const clientId = interpolate(cfg.clientId, vars);
  const clientSecret = interpolate(cfg.clientSecret, vars);
  const scope = interpolate(cfg.scope, vars);
  const cacheKey = `${url}|${clientId}|${scope}|${cfg.grantType}`;
  const cached = oauth2TokenCache.get(cacheKey);
  if (cached && cached.expiry > Date.now() + 5000) return cached.token;

  if (!url) throw new Error("OAuth 2.0: Access Token URL is required");
  const form = new URLSearchParams();
  form.set("grant_type", cfg.grantType);
  if (clientId) form.set("client_id", clientId);
  if (clientSecret) form.set("client_secret", clientSecret);
  if (scope) form.set("scope", scope);
  if (cfg.grantType === "password") {
    form.set("username", interpolate(cfg.username, vars));
    form.set("password", interpolate(cfg.password, vars));
  }
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form.toString() });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { throw new Error(`OAuth 2.0 token endpoint did not return JSON (status ${res.status})`); }
  if (!res.ok || !json.access_token) throw new Error(json.error_description || json.error || `OAuth 2.0 token request failed (status ${res.status})`);
  const expiresIn = Number(json.expires_in) || 3600;
  oauth2TokenCache.set(cacheKey, { token: json.access_token, expiry: Date.now() + expiresIn * 1000 });
  return json.access_token as string;
}

/** AWS Signature Version 4 — signs headers for direct calls to AWS services (e.g. API Gateway, S3). */
async function signAwsV4(
  auth: AuthConfig,
  vars: Record<string, string>,
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string | undefined
): Promise<Record<string, string>> {
  const cfg = auth.awsv4;
  const accessKeyId = interpolate(cfg.accessKeyId, vars);
  const secretAccessKey = interpolate(cfg.secretAccessKey, vars);
  const sessionToken = interpolate(cfg.sessionToken, vars);
  const region = interpolate(cfg.region, vars) || "us-east-1";
  const service = interpolate(cfg.service, vars) || "execute-api";
  if (!accessKeyId || !secretAccessKey) return {};

  const u = new URL(url);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const signedHeaders: Record<string, string> = { ...headers, host: u.host, "x-amz-date": amzDate };
  if (sessionToken) signedHeaders["x-amz-security-token"] = sessionToken;
  const sortedHeaderKeys = Object.keys(signedHeaders).map((k) => k.toLowerCase()).sort();
  const canonicalHeaders = sortedHeaderKeys.map((k) => `${k}:${(Object.entries(signedHeaders).find(([hk]) => hk.toLowerCase() === k)?.[1] || "").trim()}\n`).join("");
  const signedHeadersList = sortedHeaderKeys.join(";");

  const searchParams = new URLSearchParams(u.search);
  const sortedQuery = Array.from(searchParams.entries()).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const canonicalQuery = sortedQuery.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");

  const payloadHash = await sha256Hex(body || "");
  const canonicalRequest = [method.toUpperCase(), u.pathname || "/", canonicalQuery, canonicalHeaders, signedHeadersList, payloadHash].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, await sha256Hex(canonicalRequest)].join("\n");

  const kDate = await hmacSha256(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, "aws4_request");
  const signatureBuf = await hmacSha256(kSigning, stringToSign);
  const signature = Array.from(new Uint8Array(signatureBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");

  const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeadersList}, Signature=${signature}`;
  const out: Record<string, string> = { "X-Amz-Date": amzDate, Authorization: authorizationHeader };
  if (sessionToken) out["X-Amz-Security-Token"] = sessionToken;
  return out;
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
  } else if (auth.type === "oauth2" && (auth.oauth2.manualToken || auth.oauth2.accessTokenUrl)) {
    // Preview only — actual token fetch happens asynchronously in buildAuthHeadersAsync at send time.
    headers["Authorization"] = `${auth.oauth2.headerPrefix || "Bearer"} <token fetched at send time>`;
  } else if (auth.type === "awsv4" && auth.awsv4.accessKeyId) {
    headers["Authorization"] = "AWS4-HMAC-SHA256 <computed at send time>";
  }
  return { headers, params };
}

/** Async variant used when actually sending: resolves OAuth2 tokens and computes AWS SigV4 signatures for real. */
async function buildAuthHeadersAsync(
  auth: AuthConfig,
  vars: Record<string, string>,
  method: string,
  urlForSigning: string,
  headersForSigning: Record<string, string>,
  bodyForSigning: string | undefined
): Promise<{ headers: Record<string, string>; params: Record<string, string> }> {
  if (auth.type === "oauth2") {
    const token = await fetchOAuth2Token(auth, vars);
    return { headers: { Authorization: `${auth.oauth2.headerPrefix || "Bearer"} ${token}` }, params: {} };
  }
  if (auth.type === "awsv4") {
    const headers = await signAwsV4(auth, vars, method, urlForSigning, headersForSigning, bodyForSigning);
    return { headers, params: {} };
  }
  return buildAuthHeaders(auth, vars);
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

/** Async variant used at send time: fetches real OAuth2 tokens and computes real AWS SigV4 signatures. */
export async function buildHeadersAndBodyAsync(request: ApiRequest, vars: Record<string, string>, finalUrl: string) {
  const headers: Record<string, string> = {};
  request.headers.filter((h) => h.enabled && h.key).forEach((h) => { headers[interpolate(h.key, vars)] = interpolate(h.value, vars); });

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
    body = fd as unknown as string;
  } else if (mode === "graphql") {
    body = interpolate(request.body.raw, vars);
    if (!hasCT()) headers["Content-Type"] = "application/json";
  }

  const { headers: authHeaders, params: authParams } = await buildAuthHeadersAsync(
    request.auth,
    vars,
    request.method,
    finalUrl,
    headers,
    typeof body === "string" ? body : undefined
  );
  Object.assign(headers, authHeaders);
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

/* ============================= cookie jar =============================
 * Browsers never expose Set-Cookie to JS, even same-origin — so instead of pretending to read
 * response cookies, CodePeeler keeps an explicit, editable jar per domain (like Postman's engine,
 * which isn't bound by browser fetch restrictions either) and attaches it as a Cookie header. */
export function cookieHeaderForUrl(cookies: StoredCookie[], url: string): string {
  let host = "";
  try { host = new URL(url).hostname; } catch { return ""; }
  const matches = cookies.filter((c) => c.enabled && c.name && host.endsWith(c.domain.replace(/^\./, "")));
  return matches.map((c) => `${c.name}=${c.value}`).join("; ");
}

/** Calls the server-side proxy route (app/api/proxy) to relay a request outside the browser's CORS sandbox. Only supports string bodies — form-data (multipart) requests can't be serialized to JSON, so they always go out directly. */
async function sendViaProxy(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string | undefined,
  timeout: number
): Promise<{ response?: ApiResponse; errorMessage?: string }> {
  const res = await fetch("/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method, url, headers, body, timeout }),
  });
  const data = await res.json();
  if (data.proxyError) return { errorMessage: data.proxyError };
  const bodyText: string = data.bodyText ?? "";
  return {
    response: {
      status: data.status,
      statusText: data.statusText,
      ok: data.ok,
      headers: data.headers || {},
      bodyText,
      size: new Blob([bodyText]).size,
      duration: data.duration,
      url: data.finalUrl || url,
      viaProxy: true,
    },
  };
}

/* ============================= sending the request ============================= */
export interface ExecuteContext {
  environments: Environment[];
  activeEnvId: string | null;
  globalVars: GlobalVariable[];
  setEnvironments: (envs: Environment[]) => void;
  setGlobalVars: (vars: GlobalVariable[]) => void;
  collectionVars?: EnvironmentVariable[];
  /** Called with the updated collection variables after chain extractions run, if any target scope "collection". */
  setCollectionVars?: (vars: EnvironmentVariable[]) => void;
  cookies?: StoredCookie[];
  /** Override for iteration data in the Collection Runner: merged on top of everything else. */
  extraVars?: Record<string, string>;
  /** Skip pre-request/test scripts and chain extraction entirely — used by the Load Tester, which
   *  cares about raw throughput/latency and shouldn't mutate shared variable state under concurrency. */
  skipScripts?: boolean;
}
export interface ExecuteResult {
  response: ApiResponse | null;
  error: RequestError | null;
  testResults: TestResult[] | null;
  preScriptError: string | null;
  finalUrl: string;
  attempts: number;
  extractedVars: RunnerExtractedVar[];
  chainErrors: string[];
}

export async function executeRequest(tab: RequestTab, ctxArgs: ExecuteContext): Promise<ExecuteResult> {
  const { environments, activeEnvId, globalVars, setEnvironments, setGlobalVars, collectionVars = [], setCollectionVars, cookies = [], extraVars = {}, skipScripts = false } = ctxArgs;
  const request = tab.request;
  const localEnvironments = environments.map((e) => ({ ...e, variables: e.variables.map((v) => ({ ...v })) }));
  const localGlobalVars = globalVars.map((v) => ({ ...v }));
  const localCollectionVars = collectionVars.map((v) => ({ ...v }));

  let preResult: { ok: boolean; error: string | null } = { ok: true, error: null };
  if (!skipScripts) {
    const { ctx: preCtx } = makeScriptContext({ localEnvironments, activeEnvId, localGlobalVars, request });
    preResult = runScript(request.preScript, preCtx);
  }

  const finalVars = { ...collectVars(localEnvironments, activeEnvId, localGlobalVars, localCollectionVars, request.localVars), ...extraVars };
  const url = buildFinalUrl(request, finalVars);

  const controller = new AbortController();
  const timeout = request.settings?.timeout || 30000;
  const maxRetries = Math.max(0, request.settings?.maxRetries || 0);
  const retryDelay = Math.max(0, request.settings?.retryDelayMs ?? 500);

  let response: ApiResponse | null = null;
  let error: RequestError | null = null;
  let attempts = 0;
  const overallStart = performance.now();

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    attempts = attempt + 1;
    const { headers, body, authParams } = await buildHeadersAndBodyAsync(request, finalVars, url);
    let attemptUrl = url;
    if (Object.keys(authParams).length) {
      const usp = new URLSearchParams(attemptUrl.includes("?") ? attemptUrl.split("?")[1] : "");
      Object.entries(authParams).forEach(([k, v]) => usp.set(k, v));
      attemptUrl = `${attemptUrl.split("?")[0]}?${usp.toString()}`;
    }
    const cookieHeader = cookieHeaderForUrl(cookies, attemptUrl);
    if (cookieHeader && !Object.keys(headers).some((h) => h.toLowerCase() === "cookie")) headers["Cookie"] = cookieHeader;

    const canProxy = typeof body === "string" || body === undefined;
    const timer = setTimeout(() => controller.abort(), timeout);
    const start = performance.now();

    if (request.settings?.forceProxy && canProxy) {
      clearTimeout(timer);
      const proxied = await sendViaProxy(request.method, attemptUrl, headers, body as string | undefined, timeout);
      if (proxied.response) { response = proxied.response; error = null; break; }
      error = { message: proxied.errorMessage || "Proxied request failed", duration: performance.now() - start };
      if (attempt < maxRetries) await new Promise((r) => setTimeout(r, retryDelay));
      continue;
    }

    try {
      const fetchInit: RequestInit = { method: request.method, headers, signal: controller.signal, redirect: request.settings?.followRedirects === false ? "manual" : "follow" };
      if (!["GET", "HEAD"].includes(request.method) && body !== undefined) fetchInit.body = body as BodyInit;
      const res = await fetch(attemptUrl, fetchInit);
      const duration = performance.now() - start;
      const bodyText = await res.text();
      const size = new Blob([bodyText]).size;
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });
      response = { status: res.status, statusText: res.statusText, ok: res.ok, headers: resHeaders, bodyText, size, duration, url: attemptUrl };
      error = null;
      clearTimeout(timer);
      break;
    } catch (e: any) {
      clearTimeout(timer);
      // A direct fetch that fails is almost always CORS (the target didn't send an Access-Control-Allow-Origin
      // header) or a network issue — browsers report both identically as a generic TypeError. Try the
      // server-side proxy once before treating this as a genuine failure; it isn't bound by CORS at all.
      if (canProxy) {
        const proxied = await sendViaProxy(request.method, attemptUrl, headers, body as string | undefined, timeout);
        if (proxied.response) { response = proxied.response; error = null; break; }
      }
      const duration = performance.now() - start;
      if (e?.name === "AbortError") error = { message: `Request timed out after ${timeout}ms`, duration };
      else error = { message: e?.message || "Network error — the request could not be completed (often CORS, an unreachable host, or mixed content).", duration };
      if (attempt < maxRetries) await new Promise((r) => setTimeout(r, retryDelay));
    }
  }

  const totalDuration = performance.now() - overallStart;
  if (response) response = { ...response, duration: attempts > 1 ? totalDuration : response.duration };

  let testResults: TestResult[] | null = null;
  if (response && !skipScripts) {
    const { ctx: testCtx, results } = makeScriptContext({ localEnvironments, activeEnvId, localGlobalVars, request, response });
    const testRun = runScript(request.testScript, testCtx);
    testResults = testRun.ok ? results : [{ name: "Test script error", pass: false, error: testRun.error ?? undefined }];
  }

  let extractedVars: RunnerExtractedVar[] = [];
  let chainErrors: string[] = [];
  if (response && !skipScripts && request.chainExtractions?.length) {
    const applied = applyChainExtractions({
      extractions: request.chainExtractions,
      responseBodyText: response.bodyText,
      localEnvironments,
      activeEnvId,
      localGlobalVars,
      localCollectionVars,
    });
    extractedVars = applied.extracted;
    chainErrors = applied.errors;
  }

  if (!skipScripts) {
    setEnvironments(localEnvironments);
    setGlobalVars(localGlobalVars);
    setCollectionVars?.(localCollectionVars);
  }

  return { response, error, testResults, preScriptError: preResult.error, finalUrl: url, attempts, extractedVars, chainErrors };
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

/* ============================= Collection Runner =============================
 * Flattens folders into a request list, then runs every request once per data row
 * (or once, if no data file is supplied) — Postman's "Collection Runner" equivalent. */
export function flattenCollectionItems(items: CollectionItem[]): Extract<CollectionItem, { type: "request" }>[] {
  const out: Extract<CollectionItem, { type: "request" }>[] = [];
  for (const item of items) {
    if (item.type === "request") out.push(item);
    else out.push(...flattenCollectionItems(item.children));
  }
  return out;
}

export interface RunCollectionArgs {
  collection: Collection;
  environments: Environment[];
  activeEnvId: string | null;
  globalVars: GlobalVariable[];
  cookies?: StoredCookie[];
  dataRows?: RunnerDataRow[];
  delayMs?: number;
  /** Stop the run as soon as a request fails (non-2xx/network error, or a failing test assertion) —
   *  the standard behavior for a request-chaining flow where later steps depend on earlier ones. */
  abortOnFailure?: boolean;
  onProgress?: (result: RunnerRequestResult, index: number, total: number) => void;
  onDone?: (finalEnvironments: Environment[], finalGlobalVars: GlobalVariable[], finalCollectionVars: EnvironmentVariable[]) => void;
}

export async function runCollection(args: RunCollectionArgs): Promise<RunnerSummary> {
  const { collection, environments, activeEnvId, globalVars, cookies = [], dataRows, delayMs = 0, abortOnFailure = false, onProgress } = args;
  const requests = flattenCollectionItems(collection.items);
  const rows: RunnerDataRow[] = dataRows && dataRows.length ? dataRows : [{}];
  const results: RunnerRequestResult[] = [];
  const start = performance.now();
  let localEnvironments = environments.map((e) => ({ ...e, variables: e.variables.map((v) => ({ ...v })) }));
  let localGlobalVars = globalVars.map((v) => ({ ...v }));
  let localCollectionVars = collection.variables.map((v) => ({ ...v }));

  let index = 0;
  let aborted = false;
  const total = requests.length * rows.length;
  outer: for (let iteration = 0; iteration < rows.length; iteration++) {
    const extraVars = rows[iteration];
    for (const item of requests) {
      index++;
      const tab = newTab({ request: item.request });
      const result = await executeRequest(tab, {
        environments: localEnvironments,
        activeEnvId,
        globalVars: localGlobalVars,
        setEnvironments: (e) => { localEnvironments = e; },
        setGlobalVars: (g) => { localGlobalVars = g; },
        collectionVars: localCollectionVars,
        setCollectionVars: (v) => { localCollectionVars = v; },
        cookies,
        extraVars,
      });
      const ok = result.response?.ok ?? false;
      const testsFailed = result.testResults?.some((t) => !t.pass) ?? false;
      const entry: RunnerRequestResult = {
        itemId: item.id,
        name: item.name,
        method: item.request.method,
        url: result.finalUrl,
        status: result.response?.status ?? null,
        ok,
        duration: result.response?.duration ?? null,
        error: result.error?.message ?? null,
        testResults: result.testResults,
        iteration,
        extractedVars: result.extractedVars,
      };
      results.push(entry);
      onProgress?.(entry, index, total);
      if (abortOnFailure && (!ok || testsFailed)) { aborted = true; break outer; }
      if (delayMs > 0 && index < total) await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  const totalTests = results.reduce((s, r) => s + (r.testResults?.length || 0), 0);
  const testsPassed = results.reduce((s, r) => s + (r.testResults?.filter((t) => t.pass).length || 0), 0);
  const failed = results.filter((r) => !r.ok || (r.testResults?.some((t) => !t.pass) ?? false)).length;

  args.onDone?.(localEnvironments, localGlobalVars, localCollectionVars);

  return {
    total,
    passed: results.length - failed,
    failed,
    requestsRun: results.length,
    totalTests,
    testsPassed,
    durationMs: performance.now() - start,
    results,
    aborted,
  };
}

/* ============================= Load Testing =============================
 * A concurrency-pool based load generator, modeled on how k6/Artillery run "virtual users":
 * a fixed number of workers loop, each firing requests back-to-back (optionally rate-limited
 * to a target aggregate RPS), until either a total request count (burst mode) or a wall-clock
 * duration (duration mode) is reached. Deliberately skips pre-request/test scripts and doesn't
 * mutate environment/collection/global variable state — a load test measures the endpoint's
 * raw throughput and latency distribution, not correctness, and running scripts with mutable
 * shared state across dozens of concurrent workers would be a race condition by construction. */
export interface RunLoadTestArgs {
  config: LoadTestConfig;
  environments: Environment[];
  activeEnvId: string | null;
  globalVars: GlobalVariable[];
  cookies?: StoredCookie[];
  collectionVars?: EnvironmentVariable[];
  /** Single-request mode target. */
  request?: ApiRequest;
  requestName?: string;
  /** Collection mode target — each virtual user runs the full flattened request list once per "iteration". */
  collection?: Collection;
  onProgress?: (sentSoFar: number, completedSoFar: number, elapsedMs: number) => void;
  /** Polled to support cancellation mid-run. */
  isCancelled?: () => boolean;
}

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

export async function runLoadTest(args: RunLoadTestArgs): Promise<LoadTestSummary> {
  const { config, environments, activeEnvId, globalVars, cookies = [], collectionVars = [], request, requestName, collection, onProgress, isCancelled } = args;
  const targets: { itemId: string; name: string; request: ApiRequest }[] =
    config.targetType === "collection" && collection
      ? flattenCollectionItems(collection.items).map((it) => ({ itemId: it.id, name: it.name, request: it.request }))
      : [{ itemId: "single", name: requestName || request?.method + " " + (request?.url || ""), request: request as ApiRequest }];

  if (!targets.length || !targets[0].request) {
    return {
      config, startedAt: Date.now(), durationMs: 0, totalRequests: 0, successCount: 0, failCount: 0,
      achievedRps: 0, avgMs: 0, p50: 0, p90: 0, p99: 0, minMs: 0, maxMs: 0, statusCounts: {}, perRequest: [], timeline: [], aborted: false,
    };
  }

  const startedAt = Date.now();
  const start = performance.now();
  const deadline = config.mode === "duration" ? start + Math.max(1, config.durationSec) * 1000 : Infinity;
  const totalPlanned = config.mode === "burst" ? Math.max(1, config.totalRequests) : Infinity;
  const concurrency = Math.max(1, Math.min(200, config.concurrency));
  const minGapMs = config.targetRps > 0 ? 1000 / config.targetRps : 0;

  const samples: { itemId: string; itemName: string; t: number; status: number | null; ok: boolean; durationMs: number; error: string | null }[] = [];
  let sent = 0;
  let completed = 0;
  let aborted = false;
  let lastDispatch = 0;
  const dispatchLock = { busy: false };

  const nextDispatchSlot = async () => {
    if (minGapMs <= 0) return;
    while (dispatchLock.busy) await new Promise((r) => setTimeout(r, 1));
    dispatchLock.busy = true;
    const now = performance.now();
    const wait = Math.max(0, lastDispatch + minGapMs - now);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastDispatch = performance.now();
    dispatchLock.busy = false;
  };

  const worker = async () => {
    let targetIdx = 0;
    while (true) {
      if (isCancelled?.()) { aborted = true; return; }
      if (config.mode === "duration" && performance.now() >= deadline) return;
      if (config.mode === "burst" && sent >= totalPlanned) return;
      await nextDispatchSlot();
      if (config.mode === "burst" && sent >= totalPlanned) return;
      sent++;
      const target = targets[targetIdx % targets.length];
      targetIdx++;

      const tab = newTab({ request: target.request });
      const reqStart = performance.now();
      try {
        const result = await executeRequest(tab, {
          environments, activeEnvId, globalVars,
          setEnvironments: () => {}, setGlobalVars: () => {},
          collectionVars,
          cookies,
          skipScripts: !config.runScripts,
        });
        const durationMs = result.response?.duration ?? performance.now() - reqStart;
        samples.push({
          itemId: target.itemId, itemName: target.name,
          t: performance.now() - start,
          status: result.response?.status ?? null,
          ok: result.response?.ok ?? false,
          durationMs,
          error: result.error?.message ?? null,
        });
      } catch (e: any) {
        samples.push({
          itemId: target.itemId, itemName: target.name,
          t: performance.now() - start,
          status: null, ok: false, durationMs: performance.now() - reqStart,
          error: e?.message || "Request failed",
        });
      }
      completed++;
      onProgress?.(sent, completed, performance.now() - start);
    }
  };

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  const durationMs = performance.now() - start;
  const durations = samples.map((s) => s.durationMs).sort((a, b) => a - b);
  const successCount = samples.filter((s) => s.ok).length;
  const failCount = samples.length - successCount;
  const statusCounts: Record<string, number> = {};
  samples.forEach((s) => {
    const key = s.status ? String(s.status) : s.error ? "error" : "unknown";
    statusCounts[key] = (statusCounts[key] || 0) + 1;
  });

  const perRequestMap = new Map<string, { name: string; method: HttpMethod; durations: number[]; success: number; fail: number }>();
  for (const t of targets) perRequestMap.set(t.itemId, { name: t.name, method: t.request.method, durations: [], success: 0, fail: 0 });
  samples.forEach((s) => {
    const entry = perRequestMap.get(s.itemId);
    if (!entry) return;
    entry.durations.push(s.durationMs);
    if (s.ok) entry.success++; else entry.fail++;
  });
  const perRequest: LoadTestPerRequestStats[] = Array.from(perRequestMap.entries()).map(([itemId, e]) => {
    const sorted = e.durations.slice().sort((a, b) => a - b);
    return {
      itemId, name: e.name, method: e.method,
      count: e.durations.length, successCount: e.success, failCount: e.fail,
      avgMs: sorted.length ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0,
      p50: percentile(sorted, 50), p90: percentile(sorted, 90), p99: percentile(sorted, 99),
      minMs: sorted[0] ?? 0, maxMs: sorted[sorted.length - 1] ?? 0,
    };
  });

  // Cap the timeline to a reasonable number of points for charting — evenly sampled across the run.
  const MAX_TIMELINE = 300;
  const timeline: LoadTestSample[] =
    samples.length <= MAX_TIMELINE
      ? samples.map((s) => ({ t: s.t, status: s.status, ok: s.ok, durationMs: s.durationMs, error: s.error, itemId: s.itemId, itemName: s.itemName }))
      : Array.from({ length: MAX_TIMELINE }, (_, i) => {
          const s = samples[Math.floor((i / MAX_TIMELINE) * samples.length)];
          return { t: s.t, status: s.status, ok: s.ok, durationMs: s.durationMs, error: s.error, itemId: s.itemId, itemName: s.itemName };
        });

  return {
    config,
    startedAt,
    durationMs,
    totalRequests: samples.length,
    successCount,
    failCount,
    achievedRps: durationMs > 0 ? samples.length / (durationMs / 1000) : 0,
    avgMs: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
    p50: percentile(durations, 50),
    p90: percentile(durations, 90),
    p99: percentile(durations, 99),
    minMs: durations[0] ?? 0,
    maxMs: durations[durations.length - 1] ?? 0,
    statusCounts,
    perRequest,
    timeline,
    aborted,
  };
}

export function defaultLoadTestConfig(targetType: LoadTestConfig["targetType"] = "request"): LoadTestConfig {
  return { mode: "burst", targetType, concurrency: 10, totalRequests: 100, durationSec: 30, targetRps: 0, runScripts: false };
}

/* ============================= Postman v2.1 collection import/export =============================
 * Lets users migrate an existing Postman collection in, or export CodePeeler collections back out
 * as standard Postman-compatible JSON so they aren't locked in either direction. */
function pmHeadersToRows(pmHeaders: any[] | undefined): KVRow[] {
  const rows = (pmHeaders || []).map((h: any) => newRow({ key: h.key || "", value: h.value || "", enabled: !h.disabled, desc: h.description || "" }));
  return rows.length ? rows : [newRow()];
}
function pmParamsToRows(pmUrl: any): KVRow[] {
  const q = pmUrl?.query || [];
  const rows = q.map((p: any) => newRow({ key: p.key || "", value: p.value || "", enabled: !p.disabled, desc: p.description || "" }));
  return rows.length ? rows : [newRow()];
}
function pmBodyToRequestBody(pmBody: any): RequestBody {
  const empty: RequestBody = { mode: "none", raw: "", rawType: "json", formData: [newRow()], urlencoded: [newRow()] };
  if (!pmBody || !pmBody.mode) return empty;
  if (pmBody.mode === "raw") {
    const lang = pmBody.options?.raw?.language;
    return { ...empty, mode: "raw", raw: pmBody.raw || "", rawType: lang === "xml" ? "xml" : lang === "html" ? "html" : lang === "javascript" ? "js" : "json" };
  }
  if (pmBody.mode === "urlencoded") {
    const rows = (pmBody.urlencoded || []).map((p: any) => newRow({ key: p.key || "", value: p.value || "", enabled: !p.disabled }));
    return { ...empty, mode: "urlencoded", urlencoded: rows.length ? rows : [newRow()] };
  }
  if (pmBody.mode === "formdata") {
    const rows = (pmBody.formdata || []).map((p: any) => newRow({ key: p.key || "", value: p.value || "", enabled: !p.disabled }));
    return { ...empty, mode: "form-data", formData: rows.length ? rows : [newRow()] };
  }
  if (pmBody.mode === "graphql") {
    return { ...empty, mode: "graphql", raw: JSON.stringify({ query: pmBody.graphql?.query || "", variables: safeParseJSON(pmBody.graphql?.variables) }, null, 2) };
  }
  return empty;
}
function safeParseJSON(s: any) { try { return JSON.parse(s || "{}"); } catch { return {}; } }
function pmAuthToAuthConfig(pmAuth: any): AuthConfig {
  const base = emptyRequest().auth;
  if (!pmAuth || !pmAuth.type || pmAuth.type === "noauth") return base;
  const kv = (arr: any[] | undefined, key: string) => (arr || []).find((x) => x.key === key)?.value ?? "";
  if (pmAuth.type === "bearer") return { ...base, type: "bearer", token: kv(pmAuth.bearer, "token") };
  if (pmAuth.type === "basic") return { ...base, type: "basic", username: kv(pmAuth.basic, "username"), password: kv(pmAuth.basic, "password") };
  if (pmAuth.type === "apikey") return { ...base, type: "apikey", apiKeyName: kv(pmAuth.apikey, "key"), apiKeyValue: kv(pmAuth.apikey, "value"), apiKeyIn: kv(pmAuth.apikey, "in") === "query" ? "query" : "header" };
  if (pmAuth.type === "oauth2") {
    return {
      ...base,
      type: "oauth2",
      oauth2: {
        ...base.oauth2,
        accessTokenUrl: kv(pmAuth.oauth2, "accessTokenUrl"),
        clientId: kv(pmAuth.oauth2, "clientId"),
        clientSecret: kv(pmAuth.oauth2, "clientSecret"),
        scope: kv(pmAuth.oauth2, "scope"),
        manualToken: kv(pmAuth.oauth2, "accessToken"),
        grantType: kv(pmAuth.oauth2, "accessToken") ? "authorization_code_manual" : "client_credentials",
      },
    };
  }
  if (pmAuth.type === "awsv4") {
    return {
      ...base,
      type: "awsv4",
      awsv4: { accessKeyId: kv(pmAuth.awsv4, "accessKey"), secretAccessKey: kv(pmAuth.awsv4, "secretKey"), sessionToken: kv(pmAuth.awsv4, "sessionToken"), region: kv(pmAuth.awsv4, "region") || "us-east-1", service: kv(pmAuth.awsv4, "service") || "execute-api" },
    };
  }
  return base;
}
function pmUrlToString(pmUrl: any): string {
  if (typeof pmUrl === "string") return pmUrl;
  return pmUrl?.raw || "";
}
function pmItemToRequest(pmItem: any): ApiRequest {
  const req = pmItem.request || {};
  const base = emptyRequest();
  return {
    ...base,
    method: (req.method || "GET").toUpperCase(),
    url: pmUrlToString(req.url),
    params: pmParamsToRows(req.url),
    headers: pmHeadersToRows(req.header),
    body: pmBodyToRequestBody(req.body),
    auth: pmAuthToAuthConfig(req.auth),
    description: typeof req.description === "string" ? req.description : req.description?.content || "",
  };
}
function pmItemsToCollectionItems(pmItems: any[]): CollectionItem[] {
  return (pmItems || []).map((it: any) => {
    if (it.item) return { id: uid(), type: "folder", name: it.name || "Folder", children: pmItemsToCollectionItems(it.item) };
    return { id: uid(), type: "request", name: it.name || "Request", request: pmItemToRequest(it) };
  });
}

export function importPostmanCollection(json: any): Collection {
  const pmVars = (json.variable || []).map((v: any) => ({ id: uid(), key: v.key || "", value: v.value ?? "", enabled: v.disabled !== true }));
  return {
    id: uid(),
    name: json.info?.name || "Imported Collection",
    items: pmItemsToCollectionItems(json.item || []),
    variables: pmVars,
  };
}
export function importPostmanEnvironment(json: any): Environment {
  const vars = (json.values || json.variable || []).map((v: any) => ({ id: uid(), key: v.key || "", value: v.value ?? "", enabled: v.enabled !== false && v.disabled !== true }));
  return { id: uid(), name: json.name || "Imported Environment", variables: vars };
}
/** Detects whether a pasted/uploaded JSON blob looks like a Postman collection or environment export. */
export function detectPostmanJson(json: any): "collection" | "environment" | null {
  if (json && json.info && Array.isArray(json.item)) return "collection";
  if (json && (Array.isArray(json.values) || (json.name && Array.isArray(json.variable))) && !json.item) return "environment";
  return null;
}

function rowsToPmHeaders(rows: KVRow[]) {
  return rows.filter((r) => r.key).map((r) => ({ key: r.key, value: r.value, disabled: !r.enabled }));
}
function requestToPmItem(name: string, req: ApiRequest): any {
  const query = req.params.filter((p) => p.key).map((p) => ({ key: p.key, value: p.value, disabled: !p.enabled }));
  let body: any = undefined;
  if (req.body.mode === "raw") body = { mode: "raw", raw: req.body.raw, options: { raw: { language: req.body.rawType === "json" ? "json" : req.body.rawType } } };
  else if (req.body.mode === "urlencoded") body = { mode: "urlencoded", urlencoded: req.body.urlencoded.filter((r) => r.key).map((r) => ({ key: r.key, value: r.value, disabled: !r.enabled })) };
  else if (req.body.mode === "form-data") body = { mode: "formdata", formdata: req.body.formData.filter((r) => r.key).map((r) => ({ key: r.key, value: r.value, disabled: !r.enabled })) };
  else if (req.body.mode === "graphql") { const g = safeParseJSON(req.body.raw); body = { mode: "graphql", graphql: { query: g.query || "", variables: JSON.stringify(g.variables || {}) } }; }

  return {
    name,
    request: {
      method: req.method,
      header: rowsToPmHeaders(req.headers),
      url: { raw: req.url, query },
      body,
      description: req.description || undefined,
    },
    response: [],
  };
}
function collectionItemsToPmItems(items: CollectionItem[]): any[] {
  return items.map((it) => (it.type === "folder" ? { name: it.name, item: collectionItemsToPmItems(it.children) } : requestToPmItem(it.name, it.request)));
}
export function exportPostmanCollection(collection: Collection): object {
  return {
    info: { name: collection.name, schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" },
    item: collectionItemsToPmItems(collection.items),
    variable: collection.variables.map((v) => ({ key: v.key, value: v.value })),
  };
}

/* ============================= response diff & value extraction ============================= */
export type { DiffEntry } from "@/lib/json-diff";
export function diffResponses(prevBodyText: string, nextBodyText: string) {
  const prev = tryParseJson(prevBodyText);
  const next = tryParseJson(nextBodyText);
  return deepDiff(prev, next);
}
function tryParseJson(text: string): unknown {
  try { return JSON.parse(text); } catch { return text; }
}

/** Reads a dot/bracket path like "data.items[0].id" out of a JSON response body — used to save a
 * response value directly as a variable from the Response panel without writing a test script. */
export function getByPath(data: any, path: string): unknown {
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let cur = data;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

/* ============================= request chaining =============================
 * Applies a request's declarative chainExtractions against a response body, mutating the
 * appropriate variable store (env/collection/global) in place. This is the "formalized"
 * version of what a hand-written pt.environment.set(...) test-script line already does —
 * used by both a normal Send and the Collection Runner so chained variables show up the
 * same way regardless of how the request was executed. */
export interface ApplyChainArgs {
  extractions: ChainExtraction[];
  responseBodyText: string;
  localEnvironments: Environment[];
  activeEnvId: string | null;
  localGlobalVars: GlobalVariable[];
  localCollectionVars: EnvironmentVariable[];
}
export interface ApplyChainResult {
  extracted: RunnerExtractedVar[];
  errors: string[];
}
export function applyChainExtractions(args: ApplyChainArgs): ApplyChainResult {
  const { extractions, responseBodyText, localEnvironments, activeEnvId, localGlobalVars, localCollectionVars } = args;
  const enabled = extractions.filter((e) => e.enabled && e.sourcePath.trim() && e.varName.trim());
  const extracted: RunnerExtractedVar[] = [];
  const errors: string[] = [];
  if (!enabled.length) return { extracted, errors };

  let data: any;
  try { data = JSON.parse(responseBodyText); } catch { errors.push("Response isn't valid JSON — chain extraction skipped"); return { extracted, errors }; }

  for (const ex of enabled) {
    const value = getByPath(data, ex.sourcePath.trim());
    if (value === undefined) { errors.push(`No value found at "${ex.sourcePath}"`); continue; }
    const strValue = typeof value === "string" ? value : JSON.stringify(value);
    const varName = ex.varName.trim();

    if (ex.scope === "global") {
      const idx = localGlobalVars.findIndex((v) => v.key === varName);
      if (idx >= 0) localGlobalVars[idx] = { ...localGlobalVars[idx], value: strValue };
      else localGlobalVars.push({ id: uid(), key: varName, value: strValue });
    } else if (ex.scope === "collection") {
      const idx = localCollectionVars.findIndex((v) => v.key === varName);
      if (idx >= 0) localCollectionVars[idx] = { ...localCollectionVars[idx], value: strValue };
      else localCollectionVars.push({ id: uid(), key: varName, value: strValue, enabled: true });
    } else {
      const envIdx = localEnvironments.findIndex((e) => e.id === activeEnvId);
      if (envIdx >= 0) {
        const env = localEnvironments[envIdx];
        const idx = env.variables.findIndex((v) => v.key === varName);
        if (idx >= 0) env.variables[idx] = { ...env.variables[idx], value: strValue };
        else env.variables.push({ id: uid(), key: varName, value: strValue, enabled: true });
      } else {
        errors.push(`No active environment — couldn't save "${varName}"`);
        continue;
      }
    }
    extracted.push({ varName, value: strValue, scope: ex.scope });
  }
  return { extracted, errors };
}
