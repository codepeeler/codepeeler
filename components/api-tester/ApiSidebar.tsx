"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen, MoreVertical, Plus, Search, Layers, Clock, Play, Variable, Download, Radio, Copy, Power, Trash2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApiTester } from "@/providers/api-tester-provider";
import { uid } from "@/lib/api-tester/engine";
import { CollectionRunnerModal, CollectionVariablesModal, MockServerModal } from "@/components/api-tester/Modals";
import { LoadTestModal } from "@/components/api-tester/LoadTestModal";
import type { Collection, CollectionItem } from "@/lib/api-tester/types";
import Drawer from "@/components/layout/mobile/Drawer";

export const API_SIDEBAR_PANEL_ID = "api-tester-sidebar";

/* ============================= Collection tree item ============================= */
function CollectionTreeItem({
  item,
  collectionId,
  depth,
  isCollectionRoot,
  onRun,
  onVariables,
  onExport,
  onLoadTest,
}: {
  item: CollectionItem;
  collectionId: string;
  depth: number;
  isCollectionRoot?: boolean;
  onRun?: () => void;
  onVariables?: () => void;
  onExport?: () => void;
  onLoadTest?: () => void;
}) {
  const { openRequestFromCollection, deleteCollectionItem, renameCollectionItem } = useApiTester();
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.name);
  const [menuOpen, setMenuOpen] = useState(false);

  if (item.type === "folder") {
    return (
      <div>
        <div
          onClick={() => setOpen(!open)}
          className="group relative flex cursor-pointer items-center gap-1.5 rounded-lg py-1.5 pr-2 hover:bg-[var(--card-hover)]"
          style={{ paddingLeft: 8 + depth * 14 }}
        >
          {open ? <ChevronDown size={11} className="text-[var(--text-faint)]" /> : <ChevronRight size={11} className="text-[var(--text-faint)]" />}
          {open ? <FolderOpen size={13} className="text-[var(--secondary)]" /> : <Folder size={13} className="text-[var(--secondary)]" />}
          {editing ? (
            <input
              autoFocus
              className="rounded px-1 py-0.5 font-[family-name:var(--font-mono)] text-xs"
              value={draft}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => { setEditing(false); renameCollectionItem(collectionId, item.id, draft); }}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            />
          ) : (
            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] font-semibold">{item.name}</span>
          )}
          {isCollectionRoot && (
            <button
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[var(--text-faint)] opacity-0 group-hover:opacity-100 hover:bg-[var(--border-soft)] hover:text-[var(--primary)]"
              onClick={(e) => { e.stopPropagation(); onRun?.(); }}
              title="Run collection"
            >
              <Play size={11} />
            </button>
          )}
          <button
            className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--border-soft)]"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          >
            <MoreVertical size={12} />
          </button>
          {menuOpen && (
            <div className="absolute right-1.5 top-full z-[60] min-w-[150px] rounded-lg border border-[var(--border-soft)] bg-[var(--card)] py-1 shadow-[var(--shadow-soft)]" onMouseLeave={() => setMenuOpen(false)}>
              {isCollectionRoot && (
                <>
                  <button className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left text-xs hover:bg-[var(--card-hover)]" onClick={(e) => { e.stopPropagation(); onRun?.(); setMenuOpen(false); }}><Play size={11} /> Run collection</button>
                  <button className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left text-xs hover:bg-[var(--card-hover)]" onClick={(e) => { e.stopPropagation(); onLoadTest?.(); setMenuOpen(false); }}><Zap size={11} /> Load test collection</button>
                  <button className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left text-xs hover:bg-[var(--card-hover)]" onClick={(e) => { e.stopPropagation(); onVariables?.(); setMenuOpen(false); }}><Variable size={11} /> Variables</button>
                  <button className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left text-xs hover:bg-[var(--card-hover)]" onClick={(e) => { e.stopPropagation(); onExport?.(); setMenuOpen(false); }}><Download size={11} /> Export (Postman)</button>
                  <div className="my-1 h-px bg-[var(--border-soft)]" />
                </>
              )}
              <button className="block w-full px-2.5 py-1.5 text-left text-xs hover:bg-[var(--card-hover)]" onClick={(e) => { e.stopPropagation(); setEditing(true); setMenuOpen(false); }}>Rename</button>
              <button className="block w-full px-2.5 py-1.5 text-left text-xs text-[var(--danger)] hover:bg-[var(--card-hover)]" onClick={(e) => { e.stopPropagation(); deleteCollectionItem(collectionId, item.id); setMenuOpen(false); }}>Delete</button>
            </div>
          )}
        </div>
        {open && item.children.map((child) => <CollectionTreeItem key={child.id} item={child} collectionId={collectionId} depth={depth + 1} />)}
      </div>
    );
  }

  return (
    <div
      onClick={() => openRequestFromCollection(collectionId, item)}
      className="group relative flex cursor-pointer items-center gap-1.5 rounded-lg py-1.5 pr-2 hover:bg-[var(--card-hover)]"
      style={{ paddingLeft: 8 + depth * 14 }}
    >
      <span className="w-[34px] flex-shrink-0 font-[family-name:var(--font-mono)] text-[10px] font-extrabold" style={{ color: `var(--${item.request.method.toLowerCase()})` }}>
        {item.request.method}
      </span>
      {editing ? (
        <input
          autoFocus
          className="rounded px-1 py-0.5 font-[family-name:var(--font-mono)] text-xs"
          value={draft}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => { setEditing(false); renameCollectionItem(collectionId, item.id, draft); }}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        />
      ) : (
        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px]">{item.name}</span>
      )}
      <button
        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--border-soft)]"
        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
      >
        <MoreVertical size={12} />
      </button>
      {menuOpen && (
        <div className="absolute right-1.5 top-full z-[60] min-w-[130px] rounded-lg border border-[var(--border-soft)] bg-[var(--card)] py-1 shadow-[var(--shadow-soft)]" onMouseLeave={() => setMenuOpen(false)}>
          <button className="block w-full px-2.5 py-1.5 text-left text-xs hover:bg-[var(--card-hover)]" onClick={(e) => { e.stopPropagation(); setEditing(true); setMenuOpen(false); }}>Rename</button>
          <button className="block w-full px-2.5 py-1.5 text-left text-xs text-[var(--danger)] hover:bg-[var(--card-hover)]" onClick={(e) => { e.stopPropagation(); deleteCollectionItem(collectionId, item.id); setMenuOpen(false); }}>Delete</button>
        </div>
      )}
    </div>
  );
}

function CollectionsPanel() {
  const { collections, setCollections, exportCollectionAsPostman } = useApiTester();
  const [query, setQuery] = useState("");
  const [runnerFor, setRunnerFor] = useState<string | null>(null);
  const [varsFor, setVarsFor] = useState<string | null>(null);
  const [loadTestFor, setLoadTestFor] = useState<string | null>(null);

  const addCollection = () => {
    const nc: Collection = { id: uid(), name: "New Collection", items: [], variables: [] };
    setCollections((prev) => [...prev, nc]);
  };

  const filtered = query
    ? collections.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : collections;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1.5 p-2.5 pb-2">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2 top-2 text-[var(--text-faint)]" />
          <input
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] py-1.5 pl-6 pr-2 text-xs"
            placeholder="Search collections"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-dim)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]" onClick={addCollection} title="New collection">
          <Plus size={15} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-1.5 pb-2.5">
        {filtered.length === 0 && (
          <div className="p-4 text-[11.5px] leading-[1.6] text-[var(--text-faint)]">No collections yet. Save a request to create your first one.</div>
        )}
        {filtered.map((col) => (
          <div key={col.id} className="mb-1">
            <CollectionTreeItem
              item={{ id: col.id, type: "folder", name: col.name, children: col.items }}
              collectionId={col.id}
              depth={0}
              isCollectionRoot
              onRun={() => setRunnerFor(col.id)}
              onVariables={() => setVarsFor(col.id)}
              onExport={() => exportCollectionAsPostman(col.id)}
              onLoadTest={() => setLoadTestFor(col.id)}
            />
          </div>
        ))}
      </div>
      {runnerFor && <CollectionRunnerModal collectionId={runnerFor} onClose={() => setRunnerFor(null)} />}
      {varsFor && <CollectionVariablesModal collectionId={varsFor} onClose={() => setVarsFor(null)} />}
      {loadTestFor && <LoadTestModal targetType="collection" collectionId={loadTestFor} onClose={() => setLoadTestFor(null)} />}
    </div>
  );
}

function HistoryPanel() {
  const { history, clearHistory, openRequestFromHistory } = useApiTester();

  const grouped = history.slice().reverse().reduce<Record<string, typeof history>>((groups, h) => {
    const d = new Date(h.time);
    const key = d.toDateString() === new Date().toDateString() ? "Today" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    (groups[key] = groups[key] || []).push(h);
    return groups;
  }, {});

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-2.5 pb-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-faint)]">Recent History</span>
        {history.length > 0 && (
          <button className="text-[11px] font-semibold text-[var(--primary)]" onClick={clearHistory}>Clear all</button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-1.5 pb-2.5">
        {history.length === 0 && <div className="p-4 text-[11.5px] text-[var(--text-faint)]">Requests you send will show up here.</div>}
        {Object.entries(grouped).map(([day, items]) => (
          <div key={day} className="mb-1.5">
            <div className="px-2 pb-0.5 pt-1.5 text-[10.5px] font-bold text-[var(--text-faint)]">{day}</div>
            {items.map((h) => (
              <div
                key={h.id}
                onClick={() => openRequestFromHistory(h)}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--card-hover)]"
              >
                <span className="w-[34px] flex-shrink-0 font-[family-name:var(--font-mono)] text-[10px] font-extrabold" style={{ color: `var(--${h.method.toLowerCase()})` }}>{h.method}</span>
                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-[var(--text-dim)]">{h.url}</span>
                <span className="font-[family-name:var(--font-mono)] text-[10.5px] font-bold" style={{ color: !h.status ? "var(--danger)" : h.status < 300 ? "var(--success)" : h.status < 400 ? "var(--secondary)" : h.status < 500 ? "var(--warning)" : "var(--danger)" }}>
                  {h.status || "ERR"}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MocksPanel() {
  const { mockServers, addMockServer, deleteMockServer, updateMockServer, toast } = useApiTester();
  const [openId, setOpenId] = useState<string | null>(null);

  const copyBaseUrl = (e: React.MouseEvent, serverId: string) => {
    e.stopPropagation();
    if (typeof window === "undefined") return;
    navigator.clipboard?.writeText(`${window.location.origin}/api/mock/${serverId}`);
    toast("Base URL copied");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-2.5 pb-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-faint)]">Mock Servers</span>
        <button className="flex h-6 w-6 items-center justify-center rounded-lg text-[var(--text-dim)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]" onClick={() => setOpenId(addMockServer())} title="New mock server">
          <Plus size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-1.5 pb-2.5">
        {mockServers.length === 0 && (
          <div className="p-4 text-[11.5px] leading-[1.6] text-[var(--text-faint)]">
            No mock servers yet. Add one to serve canned responses to any app — point it at <span className="font-[family-name:var(--font-mono)]">/api/mock/&lt;id&gt;/...</span>.
          </div>
        )}
        {mockServers.map((s) => (
          <div key={s.id} onClick={() => setOpenId(s.id)} className="group mb-1 flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-[var(--card-hover)]">
            <Radio size={13} className="flex-shrink-0" style={{ color: s.enabled ? "var(--success)" : "var(--text-faint)" }} />
            <div className="min-w-0 flex-1">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] font-semibold">{s.name}</div>
              <div className="text-[10.5px] text-[var(--text-faint)]">{s.endpoints.filter((e) => e.enabled).length} endpoint{s.endpoints.length === 1 ? "" : "s"}</div>
            </div>
            <button className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--border-soft)]" onClick={(e) => copyBaseUrl(e, s.id)} title="Copy base URL">
              <Copy size={12} />
            </button>
            <button
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--border-soft)]"
              onClick={(e) => { e.stopPropagation(); updateMockServer(s.id, { enabled: !s.enabled }); }}
              title={s.enabled ? "Disable" : "Enable"}
            >
              <Power size={12} style={{ color: s.enabled ? "var(--success)" : "var(--text-faint)" }} />
            </button>
            <button
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--border-soft)] hover:text-[var(--danger)]"
              onClick={(e) => { e.stopPropagation(); deleteMockServer(s.id); }}
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
      {openId && <MockServerModal serverId={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}

const SIDEBAR_TABS = [
  { key: "collections" as const, label: "Collections", icon: Layers },
  { key: "history" as const, label: "History", icon: Clock },
  { key: "mocks" as const, label: "Mocks", icon: Radio },
];

function ApiSidebarContent() {
  const [tab, setTab] = useState<"collections" | "history" | "mocks">("collections");
  return (
    <>
      <div className="flex px-2.5 pt-2.5">
        {SIDEBAR_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn("flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-bold", tab === t.key ? "text-[var(--text)]" : "text-[var(--text-faint)]")}
            style={{ borderBottom: `2px solid ${tab === t.key ? "var(--primary)" : "transparent"}` }}
          >
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>
      <div className="h-px bg-[var(--border-soft)]" />
      <div className="min-h-0 flex-1">{tab === "collections" ? <CollectionsPanel /> : tab === "history" ? <HistoryPanel /> : <MocksPanel />}</div>
    </>
  );
}

/**
 * Desktop: fixed 250px aside, always visible (unchanged behavior).
 * Mobile (<lg): rendered inside the shared Drawer primitive instead,
 * opened via the collections/history icon in MobileHeader.
 */
export default function ApiSidebar() {
  return (
    <>
      <aside className="hidden w-[250px] flex-shrink-0 flex-col border-r border-[var(--border-soft)] bg-[var(--bg-elev)] lg:flex">
        <ApiSidebarContent />
      </aside>
      <Drawer id={API_SIDEBAR_PANEL_ID} title="Collections & History">
        <ApiSidebarContent />
      </Drawer>
    </>
  );
}
