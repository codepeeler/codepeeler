"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  WFNode,
  WFConn,
  InteractionMode,
  WorkflowSnapshot,
  WorkflowMeta,
  StoredWorkflow,
  LogEntry,
  LogLevel,
  StickyNote,
  CanvasFrame,
  WorkflowVariable,
  PerfEntry,
  RunHistoryEntry,
  NetworkLogEntry,
} from "@/lib/types/workflow";
import type { NodeTypeId } from "@/lib/data/node-types";
import { DEFAULT_SETTINGS, runTransform, type NodeSettings } from "@/lib/transforms";

const STICKY_COLORS = ["#fde68a", "#bbf7d0", "#bfdbfe", "#fecdd3", "#e9d5ff"];

/** Very small "{{varName}}" substitution helper used to let workflow
 *  variables get reused inside Input node values before a run. */
function substituteVariables(text: string, variables: WorkflowVariable[]): string {
  if (!text || variables.length === 0) return text;
  return text.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, name) => {
    const v = variables.find((v) => v.name === name);
    return v ? v.value : match;
  });
}

let idCounter = 0;
function uid(prefix = "n") {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}`;
}

const SAMPLE_JSON =
  '{\n  "user": "sarah_dev",\n  "plan": "pro",\n  "tools_used": ["JSON Formatter", "Base64 Encode", "Hash Generator"],\n  "active": true\n}';

function sampleNodes(): WFNode[] {
  return [
    { id: "n1", type: "input", x: 40, y: 170, value: SAMPLE_JSON, status: "idle" },
    { id: "n2", type: "json-format", x: 340, y: 40, status: "idle", settings: DEFAULT_SETTINGS["json-format"] },
    { id: "n3", type: "json-minify", x: 640, y: 170, status: "idle" },
    { id: "n4", type: "base64-encode", x: 940, y: 40, status: "idle" },
    { id: "n5", type: "hash", x: 1240, y: 170, status: "idle", settings: DEFAULT_SETTINGS["hash"] },
    { id: "n6", type: "export", x: 1540, y: 40, status: "idle" },
  ];
}
function sampleConns(): WFConn[] {
  return [
    { id: uid("c"), from: "n1", to: "n2" },
    { id: uid("c"), from: "n2", to: "n3" },
    { id: uid("c"), from: "n3", to: "n4" },
    { id: uid("c"), from: "n4", to: "n5" },
    { id: uid("c"), from: "n5", to: "n6" },
  ];
}
function defaultWorkflow(): StoredWorkflow {
  return {
    id: "default",
    name: "JSON → Base64 → Hash pipeline",
    updatedAt: Date.now(),
    nodes: sampleNodes(),
    conns: sampleConns(),
    stickies: [],
    frames: [],
    variables: [],
  };
}

export const CANVAS_W = 2200;
export const CANVAS_H = 900;
export const NODE_WIDTH = 220;
export const NODE_HEIGHT_APPROX = 150;
const WORKFLOWS_KEY = "codepeeler:workflows";
const ACTIVE_ID_KEY = "codepeeler:activeWorkflowId";
const MAX_HISTORY = 50;
const MAX_LOGS = 200;
const MAX_RUN_HISTORY = 25;
const MAX_NETWORK_LOGS = 100;

type RunResult = { ok: true } | { ok: false; error: "cycle" };

interface WorkflowContextValue {
  nodes: WFNode[];
  conns: WFConn[];
  selectedIds: string[];
  selectedNodeId: string | null;
  scale: number;
  mode: InteractionMode;
  minimapVisible: boolean;
  isRunning: boolean;
  canUndo: boolean;
  canRedo: boolean;
  portRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  workflows: WorkflowMeta[];
  activeWorkflowId: string;
  workflowName: string;
  logs: LogEntry[];
  runHistory: RunHistoryEntry[];
  networkLogs: NetworkLogEntry[];
  stickies: StickyNote[];
  frames: CanvasFrame[];
  variables: WorkflowVariable[];
  variablesPanelOpen: boolean;
  setVariablesPanelOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  paletteWidth: number;
  inspectorWidth: number;
  bottomHeight: number;
  setPaletteWidth: (w: number) => void;
  setInspectorWidth: (w: number) => void;
  setBottomHeight: (h: number) => void;
  setMinimapVisible: (v: boolean | ((prev: boolean) => boolean)) => void;
  setMode: (m: InteractionMode) => void;
  selectNode: (id: string | null, opts?: { additive?: boolean }) => void;
  selectMany: (ids: string[], opts?: { additive?: boolean }) => void;
  moveNode: (id: string, x: number, y: number) => void;
  moveManyBy: (ids: string[], dx: number, dy: number) => void;
  beginDrag: () => void;
  addNode: (type: NodeTypeId, x: number, y: number) => string;
  /** Mobile-friendly add: drops the node at `pendingAddPosition` if one was
   *  set (e.g. from a long-press on the canvas), otherwise at a cascading
   *  default spot — then selects it and flags it via `lastAddedNodeId` so
   *  the canvas can smooth-scroll it into view. Desktop drag/double-click
   *  still goes through plain `addNode` above. */
  addNodeSmart: (type: NodeTypeId) => string;
  pendingAddPosition: { x: number; y: number } | null;
  setPendingAddPosition: (p: { x: number; y: number } | null) => void;
  lastAddedNodeId: string | null;
  clearLastAddedNodeId: () => void;
  deleteNode: (id: string) => void;
  deleteSelected: () => void;
  addConnection: (from: string, to: string) => void;
  removeConnection: (id: string) => void;
  setScale: (updater: number | ((s: number) => number)) => void;
  registerPort: (key: string, el: HTMLDivElement | null) => void;
  updateNodeValue: (id: string, value: string) => void;
  updateNodeSettings: (id: string, settings: NodeSettings) => void;
  runAll: () => Promise<RunResult>;
  undo: () => void;
  redo: () => void;
  exportWorkflow: () => void;
  importWorkflow: (data: WorkflowSnapshot) => void;
  switchWorkflow: (id: string) => void;
  createWorkflow: (name?: string) => void;
  renameWorkflow: (id: string, name: string) => void;
  deleteWorkflow: (id: string) => void;
  clearLogs: () => void;
  clearNetworkLogs: () => void;
  addSticky: (x: number, y: number) => string;
  updateStickyText: (id: string, text: string) => void;
  updateStickyColor: (id: string, color: string) => void;
  moveSticky: (id: string, x: number, y: number) => void;
  resizeSticky: (id: string, w: number, h: number) => void;
  deleteSticky: (id: string) => void;
  addFrame: (x: number, y: number) => string;
  renameFrame: (id: string, title: string) => void;
  moveFrameBy: (id: string, dx: number, dy: number) => void;
  resizeFrame: (id: string, w: number, h: number) => void;
  deleteFrame: (id: string) => void;
  nodeIdsInFrame: (frame: CanvasFrame) => string[];
  addVariable: (name?: string, value?: string) => void;
  updateVariable: (id: string, patch: Partial<Pick<WorkflowVariable, "name" | "value">>) => void;
  deleteVariable: (id: string) => void;
  autoLayout: () => void;
}

export const WorkflowContext = createContext<WorkflowContextValue | null>(null);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<Record<string, StoredWorkflow>>({});
  const [nodes, setNodes] = useState<WFNode[]>([]);
  const [conns, setConns] = useState<WFConn[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [scale, setScaleState] = useState(1);
  const [mode, setMode] = useState<InteractionMode>("select");
  const [minimapVisible, setMinimapVisible] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [historyTick, setHistoryTick] = useState(0);
  const [workflows, setWorkflows] = useState<WorkflowMeta[]>([]);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>("default");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [runHistory, setRunHistory] = useState<RunHistoryEntry[]>([]);
  const [networkLogs, setNetworkLogs] = useState<NetworkLogEntry[]>([]);
  const [stickies, setStickies] = useState<StickyNote[]>([]);
  const [frames, setFrames] = useState<CanvasFrame[]>([]);
  const [variables, setVariables] = useState<WorkflowVariable[]>([]);
  const [variablesPanelOpen, setVariablesPanelOpen] = useState(false);
  const [paletteWidth, setPaletteWidthState] = useState(212);
  const [inspectorWidth, setInspectorWidthState] = useState(308);
  const [bottomHeight, setBottomHeightState] = useState(252);
  const [pendingAddPosition, setPendingAddPosition] = useState<{ x: number; y: number } | null>(null);
  const [lastAddedNodeId, setLastAddedNodeId] = useState<string | null>(null);
  const clearLastAddedNodeId = useCallback(() => setLastAddedNodeId(null), []);

  const setPaletteWidth = useCallback((w: number) => {
    setPaletteWidthState(Math.min(420, Math.max(160, w)));
  }, []);
  const setInspectorWidth = useCallback((w: number) => {
    setInspectorWidthState(Math.min(480, Math.max(220, w)));
  }, []);
  const setBottomHeight = useCallback((h: number) => {
    setBottomHeightState(Math.min(560, Math.max(120, h)));
  }, []);
  const portRefs = useRef(new Map<string, HTMLDivElement>());
  const pastRef = useRef<WorkflowSnapshot[]>([]);
  const futureRef = useRef<WorkflowSnapshot[]>([]);
  const stateRef = useRef<WorkflowSnapshot>({ nodes: [], conns: [], stickies: [], frames: [] });
  stateRef.current = { nodes, conns, stickies, frames };
  const loaded = useRef(false);

  const appendLog = useCallback((level: LogLevel, message: string) => {
    setLogs((prev) => {
      const next = [...prev, { id: uid("log"), level, message, time: Date.now() }];
      return next.length > MAX_LOGS ? next.slice(next.length - MAX_LOGS) : next;
    });
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);
  const clearNetworkLogs = useCallback(() => setNetworkLogs([]), []);
  const isRunningRef = useRef(false);
  isRunningRef.current = isRunning;

  // ---- observe outgoing fetch() calls made while a workflow run is in
  // flight, so the Network tab reflects real request activity from any
  // node that talks to the network (e.g. an API-calling tool), rather than
  // unrelated page/navigation traffic. Wraps, never blocks, the real fetch. ----
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      if (!isRunningRef.current) return originalFetch(...args);
      const [input, init] = args;
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      const method = (init?.method || (input instanceof Request ? input.method : "GET") || "GET").toUpperCase();
      const start = performance.now();
      try {
        const res = await originalFetch(...args);
        const entry: NetworkLogEntry = {
          id: uid("net"),
          method,
          url,
          status: res.status,
          ok: res.ok,
          duration: Math.round(performance.now() - start),
          time: Date.now(),
        };
        setNetworkLogs((prev) => {
          const next = [...prev, entry];
          return next.length > MAX_NETWORK_LOGS ? next.slice(next.length - MAX_NETWORK_LOGS) : next;
        });
        return res;
      } catch (err) {
        const entry: NetworkLogEntry = {
          id: uid("net"),
          method,
          url,
          status: null,
          ok: false,
          duration: Math.round(performance.now() - start),
          time: Date.now(),
          error: err instanceof Error ? err.message : "Network request failed",
        };
        setNetworkLogs((prev) => {
          const next = [...prev, entry];
          return next.length > MAX_NETWORK_LOGS ? next.slice(next.length - MAX_NETWORK_LOGS) : next;
        });
        throw err;
      }
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const persistStore = useCallback(() => {
    try {
      window.localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(storeRef.current));
      window.localStorage.setItem(ACTIVE_ID_KEY, activeWorkflowId);
    } catch {
      // storage unavailable — autosave just silently no-ops
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkflowId]);

  // ---- load workflows from localStorage on mount ----
  useEffect(() => {
    let store: Record<string, StoredWorkflow> = {};
    let activeId = "default";
    try {
      const rawStore = window.localStorage.getItem(WORKFLOWS_KEY);
      if (rawStore) store = JSON.parse(rawStore);
      const rawActive = window.localStorage.getItem(ACTIVE_ID_KEY);
      if (rawActive) activeId = rawActive;
    } catch {
      // ignore corrupt storage
    }
    if (Object.keys(store).length === 0) {
      const def = defaultWorkflow();
      store = { [def.id]: def };
      activeId = def.id;
    }
    if (!store[activeId]) activeId = Object.keys(store)[0];

    // older saves may predate stickies/frames/variables — backfill so the
    // rest of the app can assume these arrays always exist
    Object.values(store).forEach((wf) => {
      if (!wf.stickies) wf.stickies = [];
      if (!wf.frames) wf.frames = [];
      if (!wf.variables) wf.variables = [];
    });

    storeRef.current = store;
    setWorkflows(Object.values(store).map(({ id, name, updatedAt }) => ({ id, name, updatedAt })));
    setActiveWorkflowId(activeId);
    setNodes(store[activeId].nodes);
    setConns(store[activeId].conns);
    setStickies(store[activeId].stickies);
    setFrames(store[activeId].frames);
    setVariables(store[activeId].variables);
    loaded.current = true;
  }, []);

  // ---- autosave active workflow's nodes/conns/stickies/frames/variables into the store (debounced) ----
  useEffect(() => {
    if (!loaded.current) return;
    const t = setTimeout(() => {
      storeRef.current[activeWorkflowId] = {
        ...storeRef.current[activeWorkflowId],
        id: activeWorkflowId,
        name: storeRef.current[activeWorkflowId]?.name ?? "Untitled workflow",
        nodes,
        conns,
        stickies,
        frames,
        variables,
        updatedAt: Date.now(),
      };
      persistStore();
    }, 500);
    return () => clearTimeout(t);
  }, [nodes, conns, stickies, frames, variables, activeWorkflowId, persistStore]);

  const commitHistory = useCallback(() => {
    pastRef.current.push(stateRef.current);
    if (pastRef.current.length > MAX_HISTORY) pastRef.current.shift();
    futureRef.current = [];
    setHistoryTick((t) => t + 1);
  }, []);

  const registerPort = useCallback((key: string, el: HTMLDivElement | null) => {
    if (el) portRefs.current.set(key, el);
    else portRefs.current.delete(key);
  }, []);

  const selectNode = useCallback((id: string | null, opts?: { additive?: boolean }) => {
    if (id === null) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds((prev) => {
      if (opts?.additive) {
        return prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      }
      return [id];
    });
  }, []);

  const selectMany = useCallback((ids: string[], opts?: { additive?: boolean }) => {
    setSelectedIds((prev) => (opts?.additive ? Array.from(new Set([...prev, ...ids])) : ids));
  }, []);

  const moveManyBy = useCallback((ids: string[], dx: number, dy: number) => {
    setNodes((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, x: Math.max(0, n.x + dx), y: Math.max(0, n.y + dy) } : n))
    );
  }, []);

  const moveNode = useCallback((id: string, x: number, y: number) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  }, []);

  const beginDrag = useCallback(() => commitHistory(), [commitHistory]);

  const addNode = useCallback(
    (type: NodeTypeId, x: number, y: number) => {
      commitHistory();
      const id = uid();
      setNodes((prev) => [
        ...prev,
        {
          id,
          type,
          x: Math.max(0, x - NODE_WIDTH / 2),
          y: Math.max(0, y - 20),
          status: "idle",
          settings: DEFAULT_SETTINGS[type],
        },
      ]);
      return id;
    },
    [commitHistory]
  );

  const addNodeSmart = useCallback(
    (type: NodeTypeId) => {
      let x: number;
      let y: number;
      if (pendingAddPosition) {
        x = pendingAddPosition.x;
        y = pendingAddPosition.y;
        setPendingAddPosition(null);
      } else {
        // Cascade default drop spots across the canvas so repeated taps
        // don't stack every new node in exactly the same place.
        const idx = nodes.length % 8;
        x = CANVAS_W / 2 - 320 + (idx % 4) * 260;
        y = 160 + Math.floor(idx / 4) * 220;
      }
      const id = addNode(type, x, y);
      setSelectedIds([id]);
      setLastAddedNodeId(id);
      return id;
    },
    [addNode, nodes.length, pendingAddPosition]
  );

  const deleteNode = useCallback(
    (id: string) => {
      commitHistory();
      setNodes((prev) => prev.filter((n) => n.id !== id));
      setConns((prev) => prev.filter((c) => c.from !== id && c.to !== id));
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    },
    [commitHistory]
  );

  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    commitHistory();
    const idSet = new Set(selectedIds);
    setNodes((prev) => prev.filter((n) => !idSet.has(n.id)));
    setConns((prev) => prev.filter((c) => !idSet.has(c.from) && !idSet.has(c.to)));
    setSelectedIds([]);
  }, [selectedIds, commitHistory]);

  const addConnection = useCallback(
    (from: string, to: string) => {
      if (from === to) return;
      setConns((prev) => {
        if (prev.some((c) => c.from === from && c.to === to)) return prev;
        commitHistory();
        return [...prev, { id: uid("c"), from, to }];
      });
    },
    [commitHistory]
  );

  const removeConnection = useCallback(
    (id: string) => {
      commitHistory();
      setConns((prev) => prev.filter((c) => c.id !== id));
    },
    [commitHistory]
  );

  const setScale = useCallback((updater: number | ((s: number) => number)) => {
    setScaleState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return Math.min(2, Math.max(0.4, next));
    });
  }, []);

  // ---- sticky notes ----
  const addSticky = useCallback(
    (x: number, y: number) => {
      commitHistory();
      const id = uid("sticky");
      const color = STICKY_COLORS[stickies.length % STICKY_COLORS.length];
      setStickies((prev) => [
        ...prev,
        { id, x: Math.max(0, x - 90), y: Math.max(0, y - 60), w: 180, h: 140, text: "", color },
      ]);
      appendLog("info", "Added a sticky note");
      return id;
    },
    [commitHistory, appendLog, stickies.length]
  );
  const updateStickyText = useCallback((id: string, text: string) => {
    setStickies((prev) => prev.map((s) => (s.id === id ? { ...s, text } : s)));
  }, []);
  const updateStickyColor = useCallback((id: string, color: string) => {
    setStickies((prev) => prev.map((s) => (s.id === id ? { ...s, color } : s)));
  }, []);
  const moveSticky = useCallback((id: string, x: number, y: number) => {
    setStickies((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)));
  }, []);
  const resizeSticky = useCallback((id: string, w: number, h: number) => {
    setStickies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, w: Math.max(120, w), h: Math.max(90, h) } : s))
    );
  }, []);
  const deleteSticky = useCallback(
    (id: string) => {
      commitHistory();
      setStickies((prev) => prev.filter((s) => s.id !== id));
    },
    [commitHistory]
  );

  // ---- frames (grouping containers) ----
  const nodeIdsInFrame = useCallback(
    (frame: CanvasFrame) => {
      return stateRef.current.nodes
        .filter((n) => {
          const cx = n.x + NODE_WIDTH / 2;
          const cy = n.y + NODE_HEIGHT_APPROX / 2;
          return cx >= frame.x && cx <= frame.x + frame.w && cy >= frame.y && cy <= frame.y + frame.h;
        })
        .map((n) => n.id);
    },
    []
  );
  const addFrame = useCallback(
    (x: number, y: number) => {
      commitHistory();
      const id = uid("frame");
      setFrames((prev) => [
        ...prev,
        { id, x: Math.max(0, x - 160), y: Math.max(0, y - 110), w: 320, h: 220, title: "Frame" },
      ]);
      appendLog("info", "Added a frame");
      return id;
    },
    [commitHistory, appendLog]
  );
  const renameFrame = useCallback((id: string, title: string) => {
    setFrames((prev) => prev.map((f) => (f.id === id ? { ...f, title: title || "Frame" } : f)));
  }, []);
  const moveFrameBy = useCallback((id: string, dx: number, dy: number) => {
    setFrames((prev) =>
      prev.map((f) => (f.id === id ? { ...f, x: Math.max(0, f.x + dx), y: Math.max(0, f.y + dy) } : f))
    );
  }, []);
  const resizeFrame = useCallback((id: string, w: number, h: number) => {
    setFrames((prev) =>
      prev.map((f) => (f.id === id ? { ...f, w: Math.max(160, w), h: Math.max(120, h) } : f))
    );
  }, []);
  const deleteFrame = useCallback(
    (id: string) => {
      commitHistory();
      setFrames((prev) => prev.filter((f) => f.id !== id));
    },
    [commitHistory]
  );

  // ---- global variables ----
  const addVariable = useCallback((name?: string, value?: string) => {
    setVariables((prev) => {
      const base = name?.trim() || `var${prev.length + 1}`;
      let finalName = base;
      let n = 1;
      while (prev.some((v) => v.name === finalName)) {
        finalName = `${base}${n}`;
        n += 1;
      }
      return [...prev, { id: uid("var"), name: finalName, value: value ?? "" }];
    });
  }, []);
  const updateVariable = useCallback(
    (id: string, patch: Partial<Pick<WorkflowVariable, "name" | "value">>) => {
      setVariables((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
    },
    []
  );
  const deleteVariable = useCallback((id: string) => {
    setVariables((prev) => prev.filter((v) => v.id !== id));
  }, []);

  // ---- auto layout: arrange nodes into DAG-ordered columns ----
  const autoLayout = useCallback(() => {
    const currentNodes = stateRef.current.nodes;
    const currentConns = stateRef.current.conns;
    if (currentNodes.length === 0) return;
    commitHistory();

    const indegree = new Map<string, number>();
    currentNodes.forEach((n) => indegree.set(n.id, 0));
    currentConns.forEach((c) => indegree.set(c.to, (indegree.get(c.to) ?? 0) + 1));
    const adj = new Map<string, string[]>();
    currentConns.forEach((c) => {
      const arr = adj.get(c.from) ?? [];
      arr.push(c.to);
      adj.set(c.from, arr);
    });

    // BFS layering — nodes with no incoming edges start in layer 0, everything
    // downstream is placed one layer further right than its furthest parent.
    const layer = new Map<string, number>();
    const indegreeCopy = new Map(indegree);
    let frontier = currentNodes.filter((n) => (indegree.get(n.id) ?? 0) === 0).map((n) => n.id);
    frontier.forEach((id) => layer.set(id, 0));
    let depth = 0;
    while (frontier.length) {
      const next: string[] = [];
      frontier.forEach((id) => {
        (adj.get(id) ?? []).forEach((childId) => {
          indegreeCopy.set(childId, (indegreeCopy.get(childId) ?? 0) - 1);
          const candidateLayer = depth + 1;
          if (!layer.has(childId) || (layer.get(childId) ?? 0) < candidateLayer) {
            layer.set(childId, candidateLayer);
          }
          if (indegreeCopy.get(childId) === 0) next.push(childId);
        });
      });
      frontier = next;
      depth += 1;
    }
    // anything left over (disconnected or part of a cycle) just goes in layer 0
    currentNodes.forEach((n) => {
      if (!layer.has(n.id)) layer.set(n.id, 0);
    });

    const columnGapX = NODE_WIDTH + 140;
    const rowGapY = 190;
    const perLayerCount = new Map<number, number>();
    const positioned = currentNodes.map((n) => {
      const l = layer.get(n.id) ?? 0;
      const row = perLayerCount.get(l) ?? 0;
      perLayerCount.set(l, row + 1);
      return { id: n.id, x: 60 + l * columnGapX, y: 40 + row * rowGapY };
    });

    setNodes((prev) =>
      prev.map((n) => {
        const pos = positioned.find((p) => p.id === n.id);
        return pos ? { ...n, x: pos.x, y: pos.y } : n;
      })
    );
    appendLog("info", "Auto-arranged nodes");
  }, [commitHistory, appendLog]);

  const updateNodeValue = useCallback((id: string, value: string) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, value } : n)));
  }, []);

  const updateNodeSettings = useCallback((id: string, settings: NodeSettings) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, settings: { ...n.settings, ...settings } } : n))
    );
  }, []);

  const undo = useCallback(() => {
    const prev = pastRef.current.pop();
    if (!prev) return;
    futureRef.current.push(stateRef.current);
    setNodes(prev.nodes);
    setConns(prev.conns);
    setStickies(prev.stickies);
    setFrames(prev.frames);
    setHistoryTick((t) => t + 1);
  }, []);

  const redo = useCallback(() => {
    const next = futureRef.current.pop();
    if (!next) return;
    pastRef.current.push(stateRef.current);
    setNodes(next.nodes);
    setConns(next.conns);
    setStickies(next.stickies);
    setFrames(next.frames);
    setHistoryTick((t) => t + 1);
  }, []);

  const runAll = useCallback(async (): Promise<RunResult> => {
    const currentNodes = stateRef.current.nodes;
    const currentConns = stateRef.current.conns;
    const nodeMap = new Map(currentNodes.map((n) => [n.id, n]));
    const indegree = new Map<string, number>();
    currentNodes.forEach((n) => indegree.set(n.id, 0));
    currentConns.forEach((c) => indegree.set(c.to, (indegree.get(c.to) ?? 0) + 1));
    const adj = new Map<string, string[]>();
    currentConns.forEach((c) => {
      const arr = adj.get(c.from) ?? [];
      arr.push(c.to);
      adj.set(c.from, arr);
    });

    const q = currentNodes.filter((n) => (indegree.get(n.id) ?? 0) === 0).map((n) => n.id);
    const order: string[] = [];
    const indegreeCopy = new Map(indegree);
    while (q.length) {
      const id = q.shift()!;
      order.push(id);
      (adj.get(id) ?? []).forEach((next) => {
        indegreeCopy.set(next, (indegreeCopy.get(next) ?? 0) - 1);
        if (indegreeCopy.get(next) === 0) q.push(next);
      });
    }
    if (order.length !== currentNodes.length) {
      appendLog("error", "Run aborted — the workflow has a circular connection");
      return { ok: false, error: "cycle" };
    }

    setIsRunning(true);
    appendLog("info", `Running ${order.length} node${order.length === 1 ? "" : "s"}…`);
    const runStartedAt = Date.now();
    const currentVariables = variables;
    const values: Record<string, string> = {};
    const perf: PerfEntry[] = [];
    const results: RunHistoryEntry["results"] = [];
    for (const id of order) {
      const node = nodeMap.get(id)!;
      setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, status: "busy" } : n)));
      const incoming = currentConns.filter((c) => c.to === id).map((c) => values[c.from] ?? "");
      const rawInput = incoming.join("\n");
      const input = substituteVariables(rawInput, currentVariables);
      const nodeStart = performance.now();
      try {
        const output =
          node.type === "input"
            ? substituteVariables(node.value ?? "", currentVariables)
            : await runTransform(node.type, input, node.settings);
        values[id] = output;
        const ms = Math.round(performance.now() - nodeStart);
        perf.push({ nodeId: id, nodeType: node.type, ms, status: "ok" });
        results.push({ nodeId: id, nodeType: node.type, output });
        setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, status: "ok", output } : n)));
        appendLog("success", `${node.type} — done (${ms}ms)`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Transform failed";
        values[id] = "";
        const ms = Math.round(performance.now() - nodeStart);
        perf.push({ nodeId: id, nodeType: node.type, ms, status: "err" });
        setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, status: "err", output: msg } : n)));
        appendLog("error", `${node.type} — ${msg}`);
      }
    }
    setIsRunning(false);
    const duration = Date.now() - runStartedAt;
    const ok = perf.every((p) => p.status === "ok");
    setRunHistory((prev) => {
      const entry: RunHistoryEntry = {
        id: uid("run"),
        startedAt: runStartedAt,
        duration,
        nodeCount: order.length,
        ok,
        perf,
        results,
      };
      const next = [...prev, entry];
      return next.length > MAX_RUN_HISTORY ? next.slice(next.length - MAX_RUN_HISTORY) : next;
    });
    appendLog("info", `Run finished in ${duration}ms`);
    return { ok: true };
  }, [appendLog, variables]);

  const exportWorkflow = useCallback(() => {
    const data: WorkflowSnapshot = stateRef.current;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workflow.json";
    a.click();
    URL.revokeObjectURL(url);
    appendLog("info", "Exported workflow.json");
  }, [appendLog]);

  const importWorkflow = useCallback(
    (data: WorkflowSnapshot) => {
      commitHistory();
      setNodes(data.nodes);
      setConns(data.conns);
      setStickies(data.stickies ?? []);
      setFrames(data.frames ?? []);
      setSelectedIds([]);
      appendLog("info", "Imported workflow from file");
    },
    [commitHistory, appendLog]
  );

  const switchWorkflow = useCallback(
    (id: string) => {
      if (id === activeWorkflowId || !storeRef.current[id]) return;
      // flush current canvas state into the store before switching away
      storeRef.current[activeWorkflowId] = {
        ...storeRef.current[activeWorkflowId],
        nodes: stateRef.current.nodes,
        conns: stateRef.current.conns,
        stickies: stateRef.current.stickies,
        frames: stateRef.current.frames,
        variables,
        updatedAt: Date.now(),
      };
      persistStore();
      const target = storeRef.current[id];
      setActiveWorkflowId(id);
      setNodes(target.nodes);
      setConns(target.conns);
      setStickies(target.stickies ?? []);
      setFrames(target.frames ?? []);
      setVariables(target.variables ?? []);
      setSelectedIds([]);
      pastRef.current = [];
      futureRef.current = [];
      setHistoryTick((t) => t + 1);
      appendLog("info", `Switched to "${target.name}"`);
    },
    [activeWorkflowId, persistStore, appendLog, variables]
  );

  const createWorkflow = useCallback(
    (name?: string) => {
      const id = uid("wf");
      const wf: StoredWorkflow = {
        id,
        name: name?.trim() || "Untitled workflow",
        nodes: [],
        conns: [],
        stickies: [],
        frames: [],
        variables: [],
        updatedAt: Date.now(),
      };
      storeRef.current[activeWorkflowId] = {
        ...storeRef.current[activeWorkflowId],
        nodes: stateRef.current.nodes,
        conns: stateRef.current.conns,
        stickies: stateRef.current.stickies,
        frames: stateRef.current.frames,
        variables,
        updatedAt: Date.now(),
      };
      storeRef.current[id] = wf;
      persistStore();
      setWorkflows(Object.values(storeRef.current).map(({ id: wid, name: wname, updatedAt }) => ({ id: wid, name: wname, updatedAt })));
      setActiveWorkflowId(id);
      setNodes([]);
      setConns([]);
      setStickies([]);
      setFrames([]);
      setVariables([]);
      setSelectedIds([]);
      pastRef.current = [];
      futureRef.current = [];
      appendLog("info", `Created workflow "${wf.name}"`);
    },
    [activeWorkflowId, persistStore, appendLog, variables]
  );

  const renameWorkflow = useCallback(
    (id: string, name: string) => {
      const trimmed = name.trim() || "Untitled workflow";
      if (!storeRef.current[id]) return;
      storeRef.current[id] = { ...storeRef.current[id], name: trimmed, updatedAt: Date.now() };
      persistStore();
      setWorkflows(Object.values(storeRef.current).map(({ id: wid, name: wname, updatedAt }) => ({ id: wid, name: wname, updatedAt })));
    },
    [persistStore]
  );

  const deleteWorkflow = useCallback(
    (id: string) => {
      const ids = Object.keys(storeRef.current);
      if (ids.length <= 1) return; // always keep at least one workflow
      delete storeRef.current[id];
      persistStore();
      setWorkflows(Object.values(storeRef.current).map(({ id: wid, name: wname, updatedAt }) => ({ id: wid, name: wname, updatedAt })));
      if (id === activeWorkflowId) {
        const fallbackId = Object.keys(storeRef.current)[0];
        const target = storeRef.current[fallbackId];
        setActiveWorkflowId(fallbackId);
        setNodes(target.nodes);
        setConns(target.conns);
        setStickies(target.stickies ?? []);
        setFrames(target.frames ?? []);
        setVariables(target.variables ?? []);
        setSelectedIds([]);
      }
      appendLog("info", "Deleted a workflow");
    },
    [activeWorkflowId, persistStore, appendLog]
  );

  const workflowName = workflows.find((w) => w.id === activeWorkflowId)?.name ?? "Untitled workflow";
  const selectedNodeId = selectedIds.length === 1 ? selectedIds[0] : null;

  const value = useMemo<WorkflowContextValue>(
    () => ({
      nodes,
      conns,
      selectedIds,
      selectedNodeId,
      scale,
      mode,
      minimapVisible,
      isRunning,
      canUndo: pastRef.current.length > 0,
      canRedo: futureRef.current.length > 0,
      portRefs,
      workflows,
      activeWorkflowId,
      workflowName,
      logs,
      runHistory,
      networkLogs,
      stickies,
      frames,
      variables,
      variablesPanelOpen,
      setVariablesPanelOpen,
      paletteWidth,
      inspectorWidth,
      bottomHeight,
      setPaletteWidth,
      setInspectorWidth,
      setBottomHeight,
      setMinimapVisible,
      setMode,
      selectNode,
      selectMany,
      moveNode,
      moveManyBy,
      beginDrag,
      addNode,
      addNodeSmart,
      pendingAddPosition,
      setPendingAddPosition,
      lastAddedNodeId,
      clearLastAddedNodeId,
      deleteNode,
      deleteSelected,
      addConnection,
      removeConnection,
      setScale,
      registerPort,
      updateNodeValue,
      updateNodeSettings,
      runAll,
      undo,
      redo,
      exportWorkflow,
      importWorkflow,
      switchWorkflow,
      createWorkflow,
      renameWorkflow,
      deleteWorkflow,
      clearLogs,
      clearNetworkLogs,
      addSticky,
      updateStickyText,
      updateStickyColor,
      moveSticky,
      resizeSticky,
      deleteSticky,
      addFrame,
      renameFrame,
      moveFrameBy,
      resizeFrame,
      deleteFrame,
      nodeIdsInFrame,
      addVariable,
      updateVariable,
      deleteVariable,
      autoLayout,
    }),
    [
      nodes,
      conns,
      selectedIds,
      selectedNodeId,
      scale,
      mode,
      minimapVisible,
      isRunning,
      historyTick,
      workflows,
      activeWorkflowId,
      workflowName,
      logs,
      runHistory,
      networkLogs,
      stickies,
      frames,
      variables,
      variablesPanelOpen,
      paletteWidth,
      inspectorWidth,
      bottomHeight,
      setPaletteWidth,
      setInspectorWidth,
      setBottomHeight,
      selectNode,
      selectMany,
      moveNode,
      moveManyBy,
      beginDrag,
      addNode,
      addNodeSmart,
      pendingAddPosition,
      lastAddedNodeId,
      clearLastAddedNodeId,
      deleteNode,
      deleteSelected,
      addConnection,
      removeConnection,
      setScale,
      registerPort,
      updateNodeValue,
      updateNodeSettings,
      runAll,
      undo,
      redo,
      exportWorkflow,
      importWorkflow,
      switchWorkflow,
      createWorkflow,
      renameWorkflow,
      deleteWorkflow,
      clearNetworkLogs,
      addSticky,
      updateStickyText,
      updateStickyColor,
      moveSticky,
      resizeSticky,
      deleteSticky,
      addFrame,
      renameFrame,
      moveFrameBy,
      resizeFrame,
      deleteFrame,
      nodeIdsInFrame,
      addVariable,
      updateVariable,
      deleteVariable,
      autoLayout,
      clearLogs,
    ]
  );

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}

/** Throws outside a WorkflowProvider — use inside workspace components. */
export function useWorkflow() {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error("useWorkflow must be used inside <WorkflowProvider>");
  return ctx;
}

/** Returns null outside a WorkflowProvider — safe for global components
 *  (like the command palette) that render on both workspace and non-workspace routes. */
export function useOptionalWorkflow() {
  return useContext(WorkflowContext);
}
