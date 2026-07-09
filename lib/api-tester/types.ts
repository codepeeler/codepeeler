export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

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

export type ReqTabKey = "params" | "headers" | "body" | "auth" | "prescript" | "tests" | "settings" | "docs";
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

export interface GlobalVariable {
  id: string;
  key: string;
  value: string;
}

/* ============================= Collection Runner ============================= */
export interface RunnerDataRow {
  [key: string]: string;
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
