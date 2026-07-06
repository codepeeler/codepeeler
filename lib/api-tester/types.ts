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

export type AuthType = "none" | "bearer" | "basic" | "apikey";

export interface AuthConfig {
  type: AuthType;
  token: string;
  username: string;
  password: string;
  apiKeyName: string;
  apiKeyValue: string;
  apiKeyIn: "header" | "query";
}

export interface RequestSettings {
  timeout: number;
  followRedirects: boolean;
  sslVerify: boolean;
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

export type ReqTabKey = "params" | "headers" | "body" | "auth" | "prescript" | "tests" | "settings";
export type RespTabKey = "pretty" | "raw" | "preview" | "headers" | "cookies" | "tests";

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
