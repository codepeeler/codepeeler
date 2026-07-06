"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Copy, Plus, Trash2 } from "lucide-react";
import KeyValueTable from "@/components/api-tester/KeyValueTable";
import { useApiTester } from "@/providers/api-tester-provider";
import { genAxios, genCurl, genFetch, genNodeHttp, genPython, uid } from "@/lib/api-tester/engine";
import type { ApiRequest, Environment } from "@/lib/api-tester/types";

/* ============================= Generic modal shell ============================= */
export function Modal({
  title,
  onClose,
  children,
  width = 560,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="m-4 flex max-h-[82vh] flex-col rounded-[18px] border border-[var(--border)] bg-[var(--bg-elev)] shadow-[var(--shadow-soft)]" style={{ width, maxWidth: "calc(100vw - 32px)" }}>
        <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-[18px] py-3.5">
          <span className="text-[14.5px] font-bold">{title}</span>
          <button className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-[var(--text-dim)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-[18px]">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-[var(--border-soft)] px-[18px] py-3">{footer}</div>}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="mb-[5px] text-[11.5px] font-bold text-[var(--text-dim)]">{label}</div>
      {children}
    </div>
  );
}

/* ============================= Code snippet modal ============================= */
const SNIPPET_LANGS = [
  { key: "curl", label: "cURL", gen: genCurl },
  { key: "fetch", label: "JavaScript (Fetch)", gen: genFetch },
  { key: "axios", label: "Node (Axios)", gen: genAxios },
  { key: "python", label: "Python (Requests)", gen: genPython },
  { key: "node", label: "Node (fetch)", gen: genNodeHttp },
] as const;

export function CodeSnippetModal({ request, vars, onClose }: { request: ApiRequest; vars: Record<string, string>; onClose: () => void }) {
  const { toast } = useApiTester();
  const [lang, setLang] = useState<(typeof SNIPPET_LANGS)[number]["key"]>("curl");
  const code = useMemo(() => {
    const found = SNIPPET_LANGS.find((l) => l.key === lang)!;
    try { return found.gen(request, vars); } catch (e: any) { return `// Could not generate snippet: ${e.message}`; }
  }, [lang, request, vars]);

  return (
    <Modal
      title="Generate Code"
      onClose={onClose}
      width={620}
      footer={
        <button
          onClick={() => { navigator.clipboard?.writeText(code); toast("Snippet copied to clipboard"); }}
          className="flex items-center gap-1.5 rounded-lg bg-[linear-gradient(135deg,var(--primary),#7C4CF0)] px-3.5 py-2 text-xs font-semibold text-white hover:brightness-[1.08]"
        >
          <Copy size={13} /> Copy code
        </button>
      }
    >
      <div className="mb-3 flex flex-wrap gap-1.5">
        {SNIPPET_LANGS.map((l) => (
          <button
            key={l.key}
            onClick={() => setLang(l.key)}
            className="rounded-lg px-3 py-[7px] text-xs font-semibold"
            style={{ background: lang === l.key ? "var(--primary-dim)" : "var(--card)", color: lang === l.key ? "var(--primary)" : "var(--text-dim)" }}
          >
            {l.label}
          </button>
        ))}
      </div>
      <pre className="max-h-[360px] overflow-y-auto whitespace-pre-wrap break-words rounded-[10px] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-3.5 font-[family-name:var(--font-mono)] text-xs">
        {code}
      </pre>
    </Modal>
  );
}

/* ============================= Save request modal ============================= */
export function SaveRequestModal({ onClose }: { onClose: () => void }) {
  const { activeTab, collections, saveActiveTabToCollection } = useApiTester();
  const [name, setName] = useState(activeTab && activeTab.name !== "Untitled Request" ? activeTab.name : "");
  const [colId, setColId] = useState(collections[0]?.id || "");
  const [newColName, setNewColName] = useState("");

  if (!activeTab) return null;

  const save = () => {
    saveActiveTabToCollection(name, colId, newColName);
    onClose();
  };

  return (
    <Modal
      title="Save Request"
      onClose={onClose}
      width={460}
      footer={
        <>
          <button onClick={onClose} className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--text-dim)]">Cancel</button>
          <button onClick={save} className="rounded-lg bg-[linear-gradient(135deg,var(--primary),#7C4CF0)] px-3.5 py-2 text-xs font-semibold text-white">Save</button>
        </>
      }
    >
      <Field label="Request name">
        <input autoFocus className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] text-[12.5px]" placeholder="e.g. Get all users" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Save to collection">
        <select className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-[7px] text-[12.5px]" value={colId} onChange={(e) => setColId(e.target.value)}>
          {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          <option value="">+ Create new collection</option>
        </select>
      </Field>
      {!colId && (
        <Field label="New collection name">
          <input className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] text-[12.5px]" value={newColName} onChange={(e) => setNewColName(e.target.value)} placeholder="e.g. Orders API" />
        </Field>
      )}
    </Modal>
  );
}

/* ============================= Environment manager modal ============================= */
export function EnvironmentManagerModal({ onClose }: { onClose: () => void }) {
  const { environments, setEnvironments, activeEnvId, setActiveEnvId, toast } = useApiTester();
  const [selected, setSelected] = useState<string | null>(activeEnvId || environments[0]?.id || null);
  const env = environments.find((e) => e.id === selected);

  const addEnv = () => {
    const ne: Environment = { id: uid(), name: "New Environment", variables: [{ id: uid(), key: "", value: "", enabled: true }] };
    setEnvironments([...environments, ne]);
    setSelected(ne.id);
  };
  const removeEnv = (id: string) => {
    setEnvironments(environments.filter((e) => e.id !== id));
    if (selected === id) setSelected(null);
    if (activeEnvId === id) setActiveEnvId(null);
  };
  const renameEnv = (id: string, name: string) => setEnvironments(environments.map((e) => (e.id === id ? { ...e, name } : e)));
  const updateVars = (vars: Environment["variables"]) => setEnvironments(environments.map((e) => (e.id === selected ? { ...e, variables: vars } : e)));

  return (
    <Modal
      title="Manage Environments"
      onClose={onClose}
      width={720}
      footer={<button onClick={() => { toast("Environments saved"); onClose(); }} className="rounded-lg bg-[linear-gradient(135deg,var(--primary),#7C4CF0)] px-3.5 py-2 text-xs font-semibold text-white">Done</button>}
    >
      <div className="flex min-h-[320px] gap-4">
        <div className="w-[190px] flex-shrink-0">
          {environments.map((e) => (
            <div
              key={e.id}
              onClick={() => setSelected(e.id)}
              className="mb-[3px] flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-2"
              style={{ background: selected === e.id ? "var(--primary-dim)" : "transparent", color: selected === e.id ? "var(--primary)" : "var(--text-dim)" }}
            >
              <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] font-semibold">{e.name}</span>
              {activeEnvId === e.id && <span className="rounded-md bg-[var(--success-dim)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--success)]">Active</span>}
            </div>
          ))}
          <button onClick={addEnv} className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-[7px] text-xs font-semibold text-[var(--text-dim)]">
            <Plus size={12} /> Add Environment
          </button>
        </div>
        <div className="w-px flex-shrink-0 self-stretch bg-[var(--border-soft)]" />
        <div className="flex-1">
          {env ? (
            <>
              <div className="mb-3 flex gap-2">
                <input className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] text-[12.5px] font-bold" value={env.name} onChange={(e) => renameEnv(env.id, e.target.value)} />
                <button
                  disabled={activeEnvId === env.id}
                  onClick={() => setActiveEnvId(env.id)}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-[7px] text-xs font-semibold text-[var(--text-dim)] disabled:opacity-50"
                >
                  {activeEnvId === env.id ? "Active" : "Set active"}
                </button>
                <button onClick={() => removeEnv(env.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--danger)] hover:bg-[var(--danger-dim)]">
                  <Trash2 size={14} />
                </button>
              </div>
              <KeyValueTable rows={env.variables} onChange={updateVars} keyPlaceholder="Variable" valuePlaceholder="Value" showDesc={false} />
              <div className="mt-2.5 text-[11px] leading-[1.6] text-[var(--text-faint)]">
                Reference these anywhere with <span className="font-[family-name:var(--font-mono)]">{"{{variable_name}}"}</span> — in the URL, headers, params, body, or auth fields.
              </div>
            </>
          ) : (
            <div className="p-5 text-center text-[12.5px] text-[var(--text-faint)]">Select or create an environment to edit its variables.</div>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ============================= Import modal ============================= */
export function ImportModal({ onClose }: { onClose: () => void }) {
  const { importFromCurl, toast } = useApiTester();
  const [text, setText] = useState("");

  const doImport = () => {
    if (!text.trim()) return;
    try {
      importFromCurl(text);
      toast("Request imported");
      onClose();
    } catch {
      toast("Couldn't parse that curl command");
    }
  };

  return (
    <Modal
      title="Import"
      onClose={onClose}
      width={560}
      footer={
        <>
          <button onClick={onClose} className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--text-dim)]">Cancel</button>
          <button onClick={doImport} className="rounded-lg bg-[linear-gradient(135deg,var(--primary),#7C4CF0)] px-3.5 py-2 text-xs font-semibold text-white">Import</button>
        </>
      }
    >
      <div className="mb-2 text-xs text-[var(--text-faint)]">Paste a cURL command to import it as a new request.</div>
      <textarea
        className="h-[180px] w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] p-2.5 font-[family-name:var(--font-mono)] text-[12.5px] leading-[1.6]"
        placeholder={"curl --location 'https://api.example.com/users' \\\n--header 'Authorization: Bearer {{token}}'"}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </Modal>
  );
}
