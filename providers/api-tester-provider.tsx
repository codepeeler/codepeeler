"use client";

import { createContext, useContext, useCallback, useEffect, useState, useMemo } from "react";
import { useToast } from "@/providers/toast-provider";
import {
  collectVars,
  emptyRequest,
  executeRequest,
  newTab,
  parseCurl,
  pruneCollectionItems,
  renameCollectionItems,
  uid,
} from "@/lib/api-tester/engine";
import type {
  ApiRequest,
  Collection,
  CollectionItem,
  Environment,
  GlobalVariable,
  HistoryEntry,
  ReqTabKey,
  RequestTab,
  RespTabKey,
} from "@/lib/api-tester/types";

const LS_KEYS = {
  collections: "apitester:collections",
  environments: "apitester:environments",
  history: "apitester:history",
  activeEnv: "apitester:activeEnv",
  globalVars: "apitester:globalVars",
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
  const { toast } = useToast();

  // initial hydrate from localStorage (client-only)
  useEffect(() => {
    const savedCollections = loadLS<Collection[]>(LS_KEYS.collections, []);
    const savedEnvs = loadLS<Environment[]>(LS_KEYS.environments, DEFAULT_ENVIRONMENTS);
    const savedHistory = loadLS<HistoryEntry[]>(LS_KEYS.history, []);
    const savedActiveEnv = loadLS<string | null>(LS_KEYS.activeEnv, "env-default");
    const savedGlobalVars = loadLS<GlobalVariable[]>(LS_KEYS.globalVars, []);
    setCollections(savedCollections);
    setEnvironments(savedEnvs);
    setHistory(savedHistory);
    setActiveEnvId(savedActiveEnv);
    setGlobalVars(savedGlobalVars);
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

  const closeTab = useCallback((id: string) => {
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

  const send = useCallback(async () => {
    if (!activeTab || activeTab.isSending) return;
    const id = activeTab.id;
    patchTab(id, { isSending: true, error: null });
    const result = await executeRequest(activeTab, { environments, activeEnvId, globalVars, setEnvironments, setGlobalVars });
    patchTab(id, { isSending: false, response: result.response, error: result.error, testResults: result.testResults, respTab: "pretty" });
    if (result.preScriptError) toast(`Pre-request script error: ${result.preScriptError}`);
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
  }, [activeTab, environments, activeEnvId, globalVars, patchTab, toast]);

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
        const nc: Collection = { id: uid(), name: (newCollectionName || "New Collection").trim() || "New Collection", items: [] };
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
    importFromCurl,
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
