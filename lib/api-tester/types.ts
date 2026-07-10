export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

/** HTTP is the default; websocket/sse switch the request+response panels into a live streaming UI instead of a single send/receive cycle. */
export type RequestProtocol = "http" | "websocket" | "sse";

export type StreamStatus = "idle" | "connecting" | "open" | "closed" | "error";

export interface StreamMessage {
  id: string;
  direction: "sent" | "received" | "system";
  data: string;
  /** For SSE: the event name (defaults to "message"). Unused for WebSocket. */
  event?: string;
  timestamp: number;
}

export interface KVRow {
  id: string;
  key: string;
  value: string;
  desc?: string;
  enabled: boolean;
  secret?: boolean;
}

export type BodyMode = "none" | "raw" | "form-data" | "urlencoded" | "graphql";
export type RawBodyType = "json" | "text" | "html" | "xml" | "js";

export interface RequestBody {
  mode: BodyMode;
  raw: string;
  rawType: RawBodyType;
  formData: KVRow[];
  urlencoded: KVRow[];
}

export type AuthType = "none" | "bearer" | "basic" | "apikey" | "oauth2" | "awsv4";

export type OAuth2GrantType = "client_credentials" | "password" | "authorization_code_manual";

export interface OAuth2Config {
  grantType: OAuth2GrantType;
  accessTokenUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  username: string;
  password: string;
  /** For authorization_code_manual: paste a token obtained elsewhere. */
  manualToken: string;
  /** Cached token so we don't re-fetch on every send. */
  cachedToken?: string;
  cachedTokenExpiry?: number; // epoch ms
  headerPrefix: string; // usually "Bearer"
}

export interface AwsV4Config {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  region: string;
  service: string;
}

export interface AuthConfig {
  type: AuthType;
  token: string;
  username: string;
  password: string;
  apiKeyName: string;
  apiKeyValue: string;
  apiKeyIn: "header" | "query";
  oauth2: OAuth2Config;
  awsv4: AwsV4Config;
}

export interface RequestSettings {
  timeout: number;
  followRedirects: boolean;
  sslVerify: boolean;
  maxRetries: number;
  retryDelayMs: number;
  /** Always route this request through the server-side proxy instead of trying a direct browser fetch first. */
  forceProxy: boolean;
}

export interface ApiRequest {
  method: HttpMethod;
  url: string;
  /** "http" runs a normal request/response cycle; "websocket"/"sse" switch to a live connection UI. */
  protocol: RequestProtocol;
  /** WebSocket subprotocols (comma-separated), passed as the second arg to the WebSocket constructor. */
  wsProtocols: string;
  params: KVRow[];
  headers: KVRow[];
  body: RequestBody;
  auth: AuthConfig;
  preScript: string;
  testScript: string;
  settings: RequestSettings;
  /** Request-scoped variables. Highest precedence: local > collection > environment > global. */
  localVars: EnvironmentVariable[];
  /** Free-text docs/notes shown alongside the request, like Postman's request description. */
  description: string;
  /** Declarative "save this response value as a variable" rules, run after test scripts in both
   *  a normal Send and inside the Collection Runner — formalizes request chaining without requiring
   *  everyone to hand-write pt.environment.set(...) in a test script. */
  chainExtractions: ChainExtraction[];
}

/* ============================= Request chaining ============================= */
export type ChainVarScope = "environment" | "collection" | "global";

export interface ChainExtraction {
  id: string;
  enabled: boolean;
  /** Dot/bracket path into the parsed JSON response body, e.g. "data.items[0].id". */
  sourcePath: string;
  /** Variable name this value is saved as. Reference it elsewhere with {{varName}}. */
  varName: string;
  scope: ChainVarScope;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  ok: boolean;
  headers: Record<string, string>;
  bodyText: string;
  size: number;
  duration: number;
  url: string;
  /** True when this response came back via the server-side proxy fallback (e.g. after a direct fetch was blocked by CORS). */
  viaProxy?: boolean;
}

export interface RequestError {
  message: string;
  duration?: number;
}

export interface TestResult {
  name: string;
  pass: boolean;
  error?: string;
}

export type ReqTabKey = "params" | "headers" | "body" | "auth" | "prescript" | "tests" | "chain" | "settings" | "docs";
export type RespTabKey = "pretty" | "raw" | "preview" | "headers" | "cookies" | "tests" | "diff";

export interface RequestTab {
  id: string;
  name: string;
  saved: boolean;
  collectionId: string | null;
  itemId: string | null;
  request: ApiRequest;
  response: ApiResponse | null;
  error: RequestError | null;
  isSending: boolean;
  reqTab: ReqTabKey;
  respTab: RespTabKey;
  testResults: TestResult[] | null;
  /** Live WebSocket/SSE connection state — only relevant when request.protocol !== "http". */
  streamStatus: StreamStatus;
  streamMessages: StreamMessage[];
  /** The response before the most recent send, kept so the Response panel can offer a diff. */
  previousResponse: ApiResponse | null;
}

export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  secret?: boolean;
}

export interface Environment {
  id: string;
  name: string;
  variables: EnvironmentVariable[];
}

export type CollectionItem =
  | { id: string; type: "folder"; name: string; children: CollectionItem[] }
  | { id: string; type: "request"; name: string; request: ApiRequest };

export interface Collection {
  id: string;
  name: string;
  items: CollectionItem[];
  /** Collection-scoped variables — shared by every request saved under this collection. */
  variables: EnvironmentVariable[];
  /** Present once this collection has been pushed to or pulled from a GitHub Gist. */
  github?: {
    gistId: string;
    filename: string;
    lastSyncedAt: string;
  };
}

export interface HistoryEntry {
  id: string;
  method: HttpMethod;
  url: string;
  status: number | null;
  duration: number | null;
  time: number;
  requestSnapshot: ApiRequest;
}

/* ============================= Mock servers =============================
 * Serves canned responses from a real server-side route (app/api/mock/[serverId]/[...path]),
 * so a frontend app under development can point at it like any other API — something a purely
 * client-side "fake fetch" can't do, since it needs to answer requests from *other* apps/origins.
 */
export interface MockEndpoint {
  id: string;
  method: HttpMethod;
  /** Path pattern matched after /api/mock/{serverId} — supports :params (e.g. /users/:id) and a trailing * wildcard. */
  path: string;
  statusCode: number;
  headers: KVRow[];
  body: string;
  delayMs: number;
  enabled: boolean;
}

export interface MockServer {
  id: string;
  name: string;
  enabled: boolean;
  endpoints: MockEndpoint[];
}

export interface GlobalVariable {
  id: string;
  key: string;
  value: string;
}

/* ============================= Collection Runner ============================= */
export interface RunnerDataRow {
  [key: string]: string;
}

export interface RunnerExtractedVar {
  varName: string;
  value: string;
  scope: ChainVarScope;
}

export interface RunnerRequestResult {
  itemId: string;
  name: string;
  method: HttpMethod;
  url: string;
  status: number | null;
  ok: boolean;
  duration: number | null;
  error: string | null;
  testResults: TestResult[] | null;
  iteration: number;
  /** Chain variables extracted from this request's response, shown in the runner UI so the
   *  step-to-step dependency chain is visible instead of implicit. */
  extractedVars: RunnerExtractedVar[];
}

export interface RunnerSummary {
  total: number;
  passed: number;
  failed: number;
  requestsRun: number;
  totalTests: number;
  testsPassed: number;
  durationMs: number;
  results: RunnerRequestResult[];
  /** True if the run stopped early because a request failed and abortOnFailure was set. */
  aborted: boolean;
}

/* ============================= Cookie jar ============================= */
export interface StoredCookie {
  id: string;
  domain: string;
  name: string;
  value: string;
  enabled: boolean;
}

/* ============================= Postman import/export ============================= */
export interface PostmanImportSummary {
  collectionsImported: number;
  requestsImported: number;
  environmentsImported: number;
}

/* ============================= Load testing =============================
 * Two configurable modes, similar to k6/Artillery: a fixed-count "burst" of requests
 * spread across N concurrent workers, or a "duration" run that keeps N workers busy
 * for a fixed wall-clock time (optionally capped to a target RPS). Can target either
 * a single request or an entire collection (each virtual user runs the full collection
 * in sequence, repeatedly — the same "thread group" model k6/JMeter use). */
export type LoadTestMode = "burst" | "duration";
export type LoadTestTargetType = "request" | "collection";

export interface LoadTestConfig {
  mode: LoadTestMode;
  targetType: LoadTestTargetType;
  /** Number of concurrent virtual users / workers hammering the target at once. */
  concurrency: number;
  /** Burst mode: total number of requests (or collection runs) to execute across all workers. */
  totalRequests: number;
  /** Duration mode: how long to keep sending, in seconds. */
  durationSec: number;
  /** Optional cap on aggregate requests-per-second; 0 = unlimited (as fast as concurrency allows). */
  targetRps: number;
  /** Run pre-request/test scripts and persist variable mutations during the load test.
   *  Off by default — a load test's job is to measure raw throughput/latency, not to safely
   *  mutate shared environment state under concurrency, so this defaults to a read-only,
   *  script-free hammer of the endpoint(s). */
  runScripts: boolean;
}

export interface LoadTestSample {
  /** Milliseconds since the load test started. */
  t: number;
  status: number | null;
  ok: boolean;
  durationMs: number;
  error: string | null;
  /** Which request in the collection this sample belongs to (single-request mode: always the same id). */
  itemId: string;
  itemName: string;
}

export interface LoadTestPerRequestStats {
  itemId: string;
  name: string;
  method: HttpMethod;
  count: number;
  successCount: number;
  failCount: number;
  avgMs: number;
  p50: number;
  p90: number;
  p99: number;
  minMs: number;
  maxMs: number;
}

export interface LoadTestSummary {
  config: LoadTestConfig;
  startedAt: number;
  durationMs: number;
  totalRequests: number;
  successCount: number;
  failCount: number;
  achievedRps: number;
  avgMs: number;
  p50: number;
  p90: number;
  p99: number;
  minMs: number;
  maxMs: number;
  statusCounts: Record<string, number>;
  perRequest: LoadTestPerRequestStats[];
  /** Capped, time-ordered sample set for a latency-over-time visualization (not every single request). */
  timeline: LoadTestSample[];
  aborted: boolean;
}
