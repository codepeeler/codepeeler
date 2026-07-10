"use client";

import { createContext, useContext, useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useToast } from "@/providers/toast-provider";
import {
  buildFinalUrl,
  collectVars,
  detectPostmanJson,
  diffResponses,
  emptyRequest,
  executeRequest,
  exportPostmanCollection,
  getByPath,
  importPostmanCollection,
  importPostmanEnvironment,
  interpolate,
  newMockEndpoint,
  newMockServer,
  newStreamMessage,
  newTab,
  parseCurl,
  pruneCollectionItems,
  renameCollectionItems,
  runCollection,
  runLoadTest,
  uid,
} from "@/lib/api-tester/engine";
import type { DiffEntry } from "@/lib/api-tester/engine";
import type {
  ApiRequest,
  Collection,
  CollectionItem,
  Environment,
  EnvironmentVariable,
  GlobalVariable,
  HistoryEntry,
  LoadTestConfig,
  LoadTestSummary,
  MockEndpoint,
  MockServer,
  ReqTabKey,
  RequestTab,
  RespTabKey,
  RunnerDataRow,
  RunnerSummary,
  StoredCookie,
  StreamMessage,
} from "@/lib/api-tester/types";

const LS_KEYS = {
  collections: "apitester:collections",
  environments: "apitester:environments",
  history: "apitester:history",
  activeEnv: "apitester:activeEnv",
  globalVars: "apitester:globalVars",
  cookies: "apitester:cookies",
  mockServers: "apitester:mockServers",
};

function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function saveLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const DEFAULT_ENVIRONMENTS: Environment[] = [
  {
    id: "env-default",
    name: "Production",
    variables: [
      { id: uid(), key: "base_url", value: "https://jsonplaceholder.typicode.com", enabled: true },
      { id: uid(), key: "token", value: "demo-token-123", enabled: true },
    ],
  },
];

interface ApiTesterContextValue {
  tabs: RequestTab[];
  activeTab: RequestTab | undefined;
  activeTabId: string | null;
  setActiveTabId: (id: string) => void;
  newTabAction: () => void;
  closeTab: (id: string) => void;
  duplicateTab: () => void;
  updateRequest: (patch: Partial<ApiRequest>) => void;
  setReqTab: (key: ReqTabKey) => void;
  setRespTab: (key: RespTabKey) => void;
  send: () => Promise<void>;
  cancel: () => void;

  collections: Collection[];
  setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
  saveActiveTabToCollection: (name: string, collectionId: string, newCollectionName?: string) => void;
  openRequestFromCollection: (collectionId: string, item: Extract<CollectionItem, { type: "request" }>) => void;
  deleteCollectionItem: (collectionId: string, itemId: string) => void;
  renameCollectionItem: (collectionId: string, itemId: string, name: string) => void;

  environments: Environment[];
  setEnvironments: (envs: Environment[]) => void;
  activeEnvId: string | null;
  setActiveEnvId: (id: string | null) => void;
  globalVars: GlobalVariable[];
  setGlobalVars: (vars: GlobalVariable[]) => void;
  vars: Record<string, string>;

  history: HistoryEntry[];
  clearHistory: () => void;
  openRequestFromHistory: (h: HistoryEntry) => void;

  importFromCurl: (curlText: string) => void;
  importPostmanJson: (json: any) => "collection" | "environment" | null;
  exportCollectionAsPostman: (collectionId: string) => void;

  cookies: StoredCookie[];
  setCookies: React.Dispatch<React.SetStateAction<StoredCookie[]>>;

  mockServers: MockServer[];
  addMockServer: () => string;
  deleteMockServer: (serverId: string) => void;
  updateMockServer: (serverId: string, patch: Partial<MockServer>) => void;
  addMockEndpoint: (serverId: string) => void;
  updateMockEndpoint: (serverId: string, endpointId: string, patch: Partial<MockEndpoint>) => void;
  deleteMockEndpoint: (serverId: string, endpointId: string) => void;
  saveResponseAsMock: (serverId: string) => void;

  updateCollectionVariables: (collectionId: string, vars: EnvironmentVariable[]) => void;
  activeCollectionVars: EnvironmentVariable[];

  runningCollectionId: string | null;
  runnerResult: RunnerSummary | null;
  runCollectionById: (collectionId: string, dataRows?: RunnerDataRow[], delayMs?: number, abortOnFailure?: boolean) => Promise<void>;
  clearRunnerResult: () => void;

  responseDiff: DiffEntry[] | null;
  saveResponseValueAsVariable: (path: string, varName: string, scope: "env" | "global") => void;

  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  sendWsMessage: (data: string) => void;
  connectSSE: () => void;
  disconnectSSE: () => void;
  clearStreamLog: () => void;

  loadTestRunning: boolean;
  loadTestResult: LoadTestSummary | null;
  loadTestProgress: { sent: number; completed: number; elapsedMs: number } | null;
  runLoadTestForActiveRequest: (config: LoadTestConfig) => Promise<void>;
  runLoadTestForCollection: (collectionId: string, config: LoadTestConfig) => Promise<void>;
  cancelLoadTest: () => void;
  clearLoadTestResult: () => void;

  toast: (message: string) => void;
}

const ApiTesterContext = createContext<ApiTesterContextValue | null>(null);

export function ApiTesterProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [tabs, setTabs] = useState<RequestTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>(DEFAULT_ENVIRONMENTS);
  const [activeEnvId, setActiveEnvId] = useState<string | null>("env-default");
  const [globalVars, setGlobalVars] = useState<GlobalVariable[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [cookies, setCookies] = useState<StoredCookie[]>([]);
  const [mockServers, setMockServers] = useState<MockServer[]>([]);
  const [runningCollectionId, setRunningCollectionId] = useState<string | null>(null);
  const [runnerResult, setRunnerResult] = useState<RunnerSummary | null>(null);
  const [loadTestRunning, setLoadTestRunning] = useState(false);
  const [loadTestResult, setLoadTestResult] = useState<LoadTestSummary | null>(null);
  const [loadTestProgress, setLoadTestProgress] = useState<{ sent: number; completed: number; elapsedMs: number } | null>(null);
  const loadTestCancelRef = useRef(false);
  const { toast } = useToast();

  // initial hydrate from localStorage (client-only)
  useEffect(() => {
    const savedCollections = loadLS<Collection[]>(LS_KEYS.collections, []).map((c) => ({ ...c, variables: c.variables || [] }));
    const savedEnvs = loadLS<Environment[]>(LS_KEYS.environments, DEFAULT_ENVIRONMENTS);
    const savedHistory = loadLS<HistoryEntry[]>(LS_KEYS.history, []);
    const savedActiveEnv = loadLS<string | null>(LS_KEYS.activeEnv, "env-default");
    const savedGlobalVars = loadLS<GlobalVariable[]>(LS_KEYS.globalVars, []);
    const savedCookies = loadLS<StoredCookie[]>(LS_KEYS.cookies, []);
    const savedMockServers = loadLS<MockServer[]>(LS_KEYS.mockServers, []);
    setCollections(savedCollections);
    setEnvironments(savedEnvs);
    setHistory(savedHistory);
    setActiveEnvId(savedActiveEnv);
    setGlobalVars(savedGlobalVars);
    setCookies(savedCookies);
    setMockServers(savedMockServers);
    const initialTab = newTab({ name: "Get user", request: emptyRequest({ method: "GET", url: "{{base_url}}/users/1" }) });
    setTabs([initialTab]);
    setActiveTabId(initialTab.id);
    setLoaded(true);
  }, []);

  useEffect(() => { if (loaded) saveLS(LS_KEYS.collections, collections); }, [collections, loaded]);
  useEffect(() => { if (loaded) saveLS(LS_KEYS.environments, environments); }, [environments, loaded]);
  useEffect(() => { if (loaded) saveLS(LS_KEYS.history, history.slice(-100)); }, [history, loaded]);
  useEffect(() => { if (loaded) saveLS(LS_KEYS.activeEnv, activeEnvId); }, [activeEnvId, loaded]);
  useEffect(() => { if (loaded) saveLS(LS_KEYS.globalVars, globalVars); }, [globalVars, loaded]);
  useEffect(() => { if (loaded) saveLS(LS_KEYS.cookies, cookies); }, [cookies, loaded]);
  useEffect(() => {
    if (!loaded) return;
    saveLS(LS_KEYS.mockServers, mockServers);
    // Mirror the config server-side (in-memory) so the catch-all mock route can answer requests
    // from *other* apps/origins that have no access to this browser's localStorage.
    fetch("/api/mock/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ servers: mockServers }) }).catch(() => {});
  }, [mockServers, loaded]);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];
  const vars = useMemo(() => collectVars(environments, activeEnvId, globalVars), [environments, activeEnvId, globalVars]);

  const patchTab = useCallback((id: string, patch: Partial<RequestTab> | ((t: RequestTab) => Partial<RequestTab>)) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...(typeof patch === "function" ? patch(t) : patch) } : t)));
  }, []);

  const updateRequest = useCallback((patch: Partial<ApiRequest>) => {
    if (!activeTab) return;
    patchTab(activeTab.id, (t) => ({ request: { ...t.request, ...patch }, saved: false }));
  }, [activeTab, patchTab]);

  const newTabAction = useCallback(() => {
    const t = newTab();
    setTabs((prev) => [...prev, t]);
    setActiveTabId(t.id);
  }, []);

  const wsRef = useRef<Map<string, WebSocket>>(new Map());
  const sseRef = useRef<Map<string, AbortController>>(new Map());

  // Close any live WebSocket/SSE connections when their tab closes or the page unmounts —
  // otherwise they'd keep streaming in the background with nowhere to show messages.
  useEffect(() => {
    const wsMap = wsRef.current;
    const sseMap = sseRef.current;
    return () => {
      wsMap.forEach((ws) => ws.close());
      sseMap.forEach((c) => c.abort());
    };
  }, []);

  const resolvedVarsFor = useCallback((tab: RequestTab) => {
    const collectionVars = tab.collectionId ? collections.find((c) => c.id === tab.collectionId)?.variables || [] : [];
    return collectVars(environments, activeEnvId, globalVars, collectionVars, tab.request.localVars);
  }, [collections, environments, activeEnvId, globalVars]);

  const appendStream = useCallback((tabId: string, msg: StreamMessage) => {
    patchTab(tabId, (t) => ({ streamMessages: [...t.streamMessages, msg].slice(-500) }));
  }, [patchTab]);

  const connectWebSocket = useCallback(() => {
    if (!activeTab) return;
    const tabId = activeTab.id;
    const existing = wsRef.current.get(tabId);
    if (existing) existing.close();

    const url = buildFinalUrl(activeTab.request, resolvedVarsFor(activeTab));
    const protocols = activeTab.request.wsProtocols.split(",").map((p) => interpolate(p.trim(), resolvedVarsFor(activeTab))).filter(Boolean);
    patchTab(tabId, { streamStatus: "connecting", streamMessages: [] });

    let ws: WebSocket;
    try {
      ws = new WebSocket(url, protocols.length ? protocols : undefined);
    } catch (e: any) {
      patchTab(tabId, { streamStatus: "error" });
      appendStream(tabId, newStreamMessage("system", e?.message || "Couldn't open WebSocket — check the URL uses ws:// or wss://"));
      return;
    }
    wsRef.current.set(tabId, ws);

    ws.onopen = () => { patchTab(tabId, { streamStatus: "open" }); appendStream(tabId, newStreamMessage("system", "Connected")); };
    ws.onmessage = (ev) => appendStream(tabId, newStreamMessage("received", typeof ev.data === "string" ? ev.data : "[binary data]"));
    ws.onerror = () => { patchTab(tabId, { streamStatus: "error" }); appendStream(tabId, newStreamMessage("system", "Connection error — check the URL, and that the server accepts WebSocket connections from a browser origin")); };
    ws.onclose = (ev) => { patchTab(tabId, { streamStatus: "closed" }); appendStream(tabId, newStreamMessage("system", `Closed${ev.code ? ` (code ${ev.code})` : ""}`)); wsRef.current.delete(tabId); };
  }, [activeTab, patchTab, appendStream, resolvedVarsFor]);

  const disconnectWebSocket = useCallback(() => {
    if (!activeTab) return;
    wsRef.current.get(activeTab.id)?.close();
  }, [activeTab]);

  const sendWsMessage = useCallback((data: string) => {
    if (!activeTab) return;
    const ws = wsRef.current.get(activeTab.id);
    if (!ws || ws.readyState !== WebSocket.OPEN) { toast("Not connected"); return; }
    ws.send(data);
    appendStream(activeTab.id, newStreamMessage("sent", data));
  }, [activeTab, appendStream, toast]);

  const connectSSE = useCallback(async () => {
    if (!activeTab) return;
    const tabId = activeTab.id;
    sseRef.current.get(tabId)?.abort();
    const controller = new AbortController();
    sseRef.current.set(tabId, controller);

    const vars = resolvedVarsFor(activeTab);
    const url = buildFinalUrl(activeTab.request, vars);
    const headers: Record<string, string> = { Accept: "text/event-stream" };
    activeTab.request.headers.filter((h) => h.enabled && h.key).forEach((h) => { headers[interpolate(h.key, vars)] = interpolate(h.value, vars); });

    patchTab(tabId, { streamStatus: "connecting", streamMessages: [] });
    try {
      const res = await fetch(url, { headers, signal: controller.signal });
      if (!res.ok || !res.body) {
        patchTab(tabId, { streamStatus: "error" });
        appendStream(tabId, newStreamMessage("system", `Server responded ${res.status} ${res.statusText}`));
        return;
      }
      patchTab(tabId, { streamStatus: "open" });
      appendStream(tabId, newStreamMessage("system", "Connected"));

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let eventName = "";
      let dataLines: string[] = [];

      const flushEvent = () => {
        if (dataLines.length) appendStream(tabId, newStreamMessage("received", dataLines.join("\n"), eventName || "message"));
        eventName = "";
        dataLines = [];
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line === "") { flushEvent(); continue; }
          if (line.startsWith(":")) continue;
          if (line.startsWith("event:")) eventName = line.slice(6).trim();
          else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
        }
      }
      flushEvent();
      patchTab(tabId, { streamStatus: "closed" });
      appendStream(tabId, newStreamMessage("system", "Stream ended"));
    } catch (e: any) {
      if (e?.name === "AbortError") { patchTab(tabId, { streamStatus: "closed" }); return; }
      patchTab(tabId, { streamStatus: "error" });
      appendStream(tabId, newStreamMessage("system", e?.message || "Stream connection failed (often CORS — many SSE endpoints only allow same-origin browser requests)"));
    } finally {
      sseRef.current.delete(tabId);
    }
  }, [activeTab, patchTab, appendStream, resolvedVarsFor]);

  const disconnectSSE = useCallback(() => {
    if (!activeTab) return;
    sseRef.current.get(activeTab.id)?.abort();
  }, [activeTab]);

  const clearStreamLog = useCallback(() => {
    if (!activeTab) return;
    patchTab(activeTab.id, { streamMessages: [] });
  }, [activeTab, patchTab]);

  const closeTab = useCallback((id: string) => {
    wsRef.current.get(id)?.close();
    sseRef.current.get(id)?.abort();
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      const next = prev.filter((t) => t.id !== id);
      if (!next.length) {
        const t = newTab();
        setActiveTabId(t.id);
        return [t];
      }
      if (activeTabId === id) setActiveTabId(next[Math.max(0, idx - 1)].id);
      return next;
    });
  }, [activeTabId]);

  const duplicateTab = useCallback(() => {
    if (!activeTab) return;
    const t = newTab({ name: `${activeTab.name} Copy`, request: JSON.parse(JSON.stringify(activeTab.request)) });
    setTabs((prev) => [...prev, t]);
    setActiveTabId(t.id);
  }, [activeTab]);

  const activeCollectionVars = useMemo(
    () => (activeTab?.collectionId ? collections.find((c) => c.id === activeTab.collectionId)?.variables || [] : []),
    [activeTab, collections]
  );

  const send = useCallback(async () => {
    if (!activeTab || activeTab.isSending || activeTab.request.protocol !== "http") return;
    const id = activeTab.id;
    const prevResponse = activeTab.response;
    const collectionVars = activeTab.collectionId ? collections.find((c) => c.id === activeTab.collectionId)?.variables || [] : [];
    patchTab(id, { isSending: true, error: null });
    const result = await executeRequest(activeTab, {
      environments, activeEnvId, globalVars, setEnvironments, setGlobalVars,
      collectionVars,
      setCollectionVars: activeTab.collectionId
        ? (vars) => setCollections((prev) => prev.map((c) => (c.id === activeTab.collectionId ? { ...c, variables: vars } : c)))
        : undefined,
      cookies,
    });
    patchTab(id, { isSending: false, response: result.response, error: result.error, testResults: result.testResults, respTab: "pretty", previousResponse: prevResponse });
    if (result.preScriptError) toast(`Pre-request script error: ${result.preScriptError}`);
    if (result.attempts > 1 && result.response) toast(`Request succeeded after ${result.attempts} attempts`);
    if (result.extractedVars.length) toast(`Chain: saved ${result.extractedVars.map((v) => v.varName).join(", ")}`);
    if (result.chainErrors.length) toast(result.chainErrors[0]);
    setHistory((prev) => [
      ...prev,
      {
        id: uid(),
        method: activeTab.request.method,
        url: result.finalUrl || activeTab.request.url,
        status: result.response ? result.response.status : null,
        duration: result.response ? result.response.duration : null,
        time: Date.now(),
        requestSnapshot: JSON.parse(JSON.stringify(activeTab.request)),
      },
    ]);
  }, [activeTab, environments, activeEnvId, globalVars, collections, cookies, patchTab, toast]);

  const cancel = useCallback(() => {
    if (!activeTab) return;
    patchTab(activeTab.id, { isSending: false, error: { message: "Request cancelled" } });
  }, [activeTab, patchTab]);

  const openRequestFromCollection = useCallback((collectionId: string, item: Extract<CollectionItem, { type: "request" }>) => {
    const t = newTab({ name: item.name, saved: true, collectionId, itemId: item.id, request: JSON.parse(JSON.stringify(item.request)) });
    setTabs((prev) => [...prev, t]);
    setActiveTabId(t.id);
  }, []);

  const openRequestFromHistory = useCallback((h: HistoryEntry) => {
    const t = newTab({ name: `${h.method} ${(h.url || "request").split("/").slice(-1)[0]}`, request: JSON.parse(JSON.stringify(h.requestSnapshot)) });
    setTabs((prev) => [...prev, t]);
    setActiveTabId(t.id);
  }, []);

  const saveActiveTabToCollection = useCallback((name: string, collectionId: string, newCollectionName?: string) => {
    if (!activeTab) return;
    const finalName = name.trim() || "Untitled Request";
    setCollections((prev) => {
      let list = prev;
      let targetId = collectionId;
      if (!targetId) {
        const nc: Collection = { id: uid(), name: (newCollectionName || "New Collection").trim() || "New Collection", items: [], variables: [] };
        targetId = nc.id;
        list = [...prev, nc];
      }
      return list.map((c) =>
        c.id === targetId
          ? { ...c, items: [...c.items, { id: uid(), type: "request", name: finalName, request: JSON.parse(JSON.stringify(activeTab.request)) }] }
          : c
      );
    });
    patchTab(activeTab.id, { name: finalName, saved: true });
  }, [activeTab, patchTab]);

  const deleteCollectionItem = useCallback((collectionId: string, itemId: string) => {
    setCollections((prev) =>
      prev
        .filter((c) => c.id !== collectionId || collectionId !== itemId)
        .map((c) => (c.id === collectionId ? { ...c, items: pruneCollectionItems(c.items, itemId) } : c))
        .filter((c) => c.id !== itemId)
    );
  }, []);
  const renameCollectionItem = useCallback((collectionId: string, itemId: string, name: string) => {
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id === itemId) return { ...c, name };
        if (c.id === collectionId) return { ...c, items: renameCollectionItems(c.items, itemId, name) };
        return c;
      })
    );
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const importFromCurl = useCallback((curlText: string) => {
    const req = parseCurl(curlText);
    const t = newTab({ name: `${req.method} ${req.url || "Imported"}`, request: req });
    setTabs((prev) => [...prev, t]);
    setActiveTabId(t.id);
  }, []);

  const importPostmanJson = useCallback((json: any): "collection" | "environment" | null => {
    const kind = detectPostmanJson(json);
    if (kind === "collection") {
      const col = importPostmanCollection(json);
      setCollections((prev) => [...prev, col]);
      toast(`Imported "${col.name}" from Postman`);
    } else if (kind === "environment") {
      const env = importPostmanEnvironment(json);
      setEnvironments((prev) => [...prev, env]);
      toast(`Imported environment "${env.name}" from Postman`);
    }
    return kind;
  }, [toast]);

  const exportCollectionAsPostman = useCallback((collectionId: string) => {
    const col = collections.find((c) => c.id === collectionId);
    if (!col) return;
    const json = exportPostmanCollection(col);
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${col.name.replace(/[^a-z0-9-_]+/gi, "_")}.postman_collection.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Exported as Postman v2.1 collection");
  }, [collections, toast]);

  const updateCollectionVariables = useCallback((collectionId: string, vars: EnvironmentVariable[]) => {
    setCollections((prev) => prev.map((c) => (c.id === collectionId ? { ...c, variables: vars } : c)));
  }, []);

  const addMockServer = useCallback(() => {
    const s = newMockServer();
    setMockServers((prev) => [...prev, s]);
    return s.id;
  }, []);
  const deleteMockServer = useCallback((serverId: string) => setMockServers((prev) => prev.filter((s) => s.id !== serverId)), []);
  const updateMockServer = useCallback((serverId: string, patch: Partial<MockServer>) => {
    setMockServers((prev) => prev.map((s) => (s.id === serverId ? { ...s, ...patch } : s)));
  }, []);
  const addMockEndpoint = useCallback((serverId: string) => {
    setMockServers((prev) => prev.map((s) => (s.id === serverId ? { ...s, endpoints: [...s.endpoints, newMockEndpoint()] } : s)));
  }, []);
  const updateMockEndpoint = useCallback((serverId: string, endpointId: string, patch: Partial<MockEndpoint>) => {
    setMockServers((prev) => prev.map((s) => (s.id !== serverId ? s : { ...s, endpoints: s.endpoints.map((e) => (e.id === endpointId ? { ...e, ...patch } : e)) })));
  }, []);
  const deleteMockEndpoint = useCallback((serverId: string, endpointId: string) => {
    setMockServers((prev) => prev.map((s) => (s.id !== serverId ? s : { ...s, endpoints: s.endpoints.filter((e) => e.id !== endpointId) })));
  }, []);
  /** Turns the request+response currently on screen into a new mock endpoint — the fastest path from "I hit a real API" to "I can develop against a fake one". */
  const saveResponseAsMock = useCallback((serverId: string) => {
    if (!activeTab?.response) return;
    let path = "/";
    try { path = new URL(activeTab.request.url.replace(/\{\{.*?\}\}/g, "x")).pathname || "/"; } catch { /* keep default */ }
    const headers = Object.entries(activeTab.response.headers)
      .filter(([k]) => !["content-length", "content-encoding", "transfer-encoding", "connection"].includes(k.toLowerCase()))
      .map(([key, value]) => ({ id: uid(), key, value, enabled: true, desc: "" }));
    const endpoint = newMockEndpoint({
      method: activeTab.request.method,
      path,
      statusCode: activeTab.response.status,
      headers: headers.length ? headers : [{ id: uid(), key: "", value: "", enabled: true, desc: "" }],
      body: activeTab.response.bodyText,
    });
    setMockServers((prev) => prev.map((s) => (s.id === serverId ? { ...s, endpoints: [...s.endpoints, endpoint] } : s)));
    toast(`Added ${endpoint.method} ${endpoint.path} to mock server`);
  }, [activeTab, toast]);

  const runCollectionById = useCallback(async (collectionId: string, dataRows?: RunnerDataRow[], delayMs = 0, abortOnFailure = false) => {
    const col = collections.find((c) => c.id === collectionId);
    if (!col) return;
    setRunningCollectionId(collectionId);
    setRunnerResult(null);
    try {
      const summary = await runCollection({
        collection: col,
        environments,
        activeEnvId,
        globalVars,
        cookies,
        dataRows,
        delayMs,
        abortOnFailure,
        onDone: (finalEnvs, finalVars, finalCollectionVars) => {
          setEnvironments(finalEnvs);
          setGlobalVars(finalVars);
          setCollections((prev) => prev.map((c) => (c.id === collectionId ? { ...c, variables: finalCollectionVars } : c)));
        },
      });
      setRunnerResult(summary);
      toast(summary.aborted ? `Runner stopped early: ${summary.passed}/${summary.total} requests passed` : `Runner finished: ${summary.passed}/${summary.total} requests passed`);
    } finally {
      setRunningCollectionId(null);
    }
  }, [collections, environments, activeEnvId, globalVars, cookies, toast]);

  const clearRunnerResult = useCallback(() => setRunnerResult(null), []);

  const runLoadTestForActiveRequest = useCallback(async (config: LoadTestConfig) => {
    if (!activeTab) return;
    const collectionVars = activeTab.collectionId ? collections.find((c) => c.id === activeTab.collectionId)?.variables || [] : [];
    loadTestCancelRef.current = false;
    setLoadTestRunning(true);
    setLoadTestResult(null);
    setLoadTestProgress({ sent: 0, completed: 0, elapsedMs: 0 });
    try {
      const summary = await runLoadTest({
        config: { ...config, targetType: "request" },
        environments, activeEnvId, globalVars, cookies, collectionVars,
        request: activeTab.request,
        requestName: activeTab.name,
        onProgress: (sent, completedSoFar, elapsedMs) => setLoadTestProgress({ sent, completed: completedSoFar, elapsedMs }),
        isCancelled: () => loadTestCancelRef.current,
      });
      setLoadTestResult(summary);
      toast(summary.aborted ? "Load test cancelled" : `Load test finished: ${summary.successCount}/${summary.totalRequests} succeeded, ${summary.achievedRps.toFixed(1)} req/s`);
    } finally {
      setLoadTestRunning(false);
    }
  }, [activeTab, collections, environments, activeEnvId, globalVars, cookies, toast]);

  const runLoadTestForCollection = useCallback(async (collectionId: string, config: LoadTestConfig) => {
    const col = collections.find((c) => c.id === collectionId);
    if (!col) return;
    loadTestCancelRef.current = false;
    setLoadTestRunning(true);
    setLoadTestResult(null);
    setLoadTestProgress({ sent: 0, completed: 0, elapsedMs: 0 });
    try {
      const summary = await runLoadTest({
        config: { ...config, targetType: "collection" },
        environments, activeEnvId, globalVars, cookies,
        collectionVars: col.variables,
        collection: col,
        onProgress: (sent, completedSoFar, elapsedMs) => setLoadTestProgress({ sent, completed: completedSoFar, elapsedMs }),
        isCancelled: () => loadTestCancelRef.current,
      });
      setLoadTestResult(summary);
      toast(summary.aborted ? "Load test cancelled" : `Load test finished: ${summary.successCount}/${summary.totalRequests} succeeded, ${summary.achievedRps.toFixed(1)} req/s`);
    } finally {
      setLoadTestRunning(false);
    }
  }, [collections, environments, activeEnvId, globalVars, cookies, toast]);

  const cancelLoadTest = useCallback(() => { loadTestCancelRef.current = true; }, []);
  const clearLoadTestResult = useCallback(() => setLoadTestResult(null), []);

  const responseDiff = useMemo<DiffEntry[] | null>(() => {
    if (!activeTab?.response || !activeTab?.previousResponse) return null;
    try { return diffResponses(activeTab.previousResponse.bodyText, activeTab.response.bodyText); } catch { return null; }
  }, [activeTab]);

  const saveResponseValueAsVariable = useCallback((path: string, varName: string, scope: "env" | "global") => {
    if (!activeTab?.response || !varName.trim()) return;
    let data: any;
    try { data = JSON.parse(activeTab.response.bodyText); } catch { toast("Response isn't valid JSON"); return; }
    const value = getByPath(data, path);
    if (value === undefined) { toast(`No value found at "${path}"`); return; }
    const strValue = typeof value === "string" ? value : JSON.stringify(value);
    if (scope === "global") {
      setGlobalVars((prev) => {
        const idx = prev.findIndex((v) => v.key === varName);
        if (idx >= 0) { const copy = prev.slice(); copy[idx] = { ...copy[idx], value: strValue }; return copy; }
        return [...prev, { id: uid(), key: varName, value: strValue }];
      });
    } else {
      setEnvironments((prev) => prev.map((e) => {
        if (e.id !== activeEnvId) return e;
        const idx = e.variables.findIndex((v) => v.key === varName);
        const variables = idx >= 0
          ? e.variables.map((v, i) => (i === idx ? { ...v, value: strValue } : v))
          : [...e.variables, { id: uid(), key: varName, value: strValue, enabled: true }];
        return { ...e, variables };
      }));
    }
    toast(`Saved "${varName}" = ${strValue.slice(0, 40)}`);
  }, [activeTab, activeEnvId, toast]);

  const value: ApiTesterContextValue = {
    tabs, activeTab, activeTabId, setActiveTabId,
    newTabAction, closeTab, duplicateTab,
    updateRequest,
    setReqTab: (key) => activeTab && patchTab(activeTab.id, { reqTab: key }),
    setRespTab: (key) => activeTab && patchTab(activeTab.id, { respTab: key }),
    send, cancel,
    collections, setCollections, saveActiveTabToCollection, openRequestFromCollection, deleteCollectionItem, renameCollectionItem,
    environments, setEnvironments, activeEnvId, setActiveEnvId, globalVars, setGlobalVars, vars,
    history, clearHistory, openRequestFromHistory,
    importFromCurl, importPostmanJson, exportCollectionAsPostman,
    cookies, setCookies,
    mockServers, addMockServer, deleteMockServer, updateMockServer, addMockEndpoint, updateMockEndpoint, deleteMockEndpoint, saveResponseAsMock,
    updateCollectionVariables, activeCollectionVars,
    runningCollectionId, runnerResult, runCollectionById, clearRunnerResult,
    responseDiff, saveResponseValueAsVariable,
    connectWebSocket, disconnectWebSocket, sendWsMessage, connectSSE, disconnectSSE, clearStreamLog,
    loadTestRunning, loadTestResult, loadTestProgress, runLoadTestForActiveRequest, runLoadTestForCollection, cancelLoadTest, clearLoadTestResult,
    toast,
  };

  if (!loaded) return null;

  return <ApiTesterContext.Provider value={value}>{children}</ApiTesterContext.Provider>;
}

export function useApiTester() {
  const ctx = useContext(ApiTesterContext);
  if (!ctx) throw new Error("useApiTester must be used within ApiTesterProvider");
  return ctx;
}
