import type { NodeTypeId } from "@/lib/data/node-types";
import type { NodeSettings } from "@/lib/transforms";

export type WFNodeStatus = "idle" | "ok" | "err" | "busy";

export interface WFNode {
  id: string;
  type: NodeTypeId;
  x: number;
  y: number;
  value?: string;
  status: WFNodeStatus;
  output?: string;
  settings?: NodeSettings;
}

export interface WFConn {
  id: string;
  from: string;
  to: string;
}

export type InteractionMode = "select" | "hand" | "place-sticky" | "place-frame";

export interface StickyNote {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  color: string;
}

export interface CanvasFrame {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
}

export interface WorkflowVariable {
  id: string;
  name: string;
  value: string;
}

export interface WorkflowSnapshot {
  nodes: WFNode[];
  conns: WFConn[];
  stickies: StickyNote[];
  frames: CanvasFrame[];
}

export interface WorkflowMeta {
  id: string;
  name: string;
  updatedAt: number;
}

export interface StoredWorkflow extends WorkflowMeta, WorkflowSnapshot {
  variables: WorkflowVariable[];
}

export type LogLevel = "info" | "success" | "error";

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  time: number;
}

export interface PerfEntry {
  nodeId: string;
  nodeType: NodeTypeId;
  ms: number;
  status: "ok" | "err";
}

export interface RunHistoryEntry {
  id: string;
  startedAt: number;
  duration: number;
  nodeCount: number;
  ok: boolean;
  perf: PerfEntry[];
  results: { nodeId: string; nodeType: NodeTypeId; output: string }[];
}

export interface NetworkLogEntry {
  id: string;
  method: string;
  url: string;
  status: number | null;
  ok: boolean;
  duration: number;
  time: number;
  error?: string;
}
