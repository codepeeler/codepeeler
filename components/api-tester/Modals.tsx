"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Copy, Plus, Trash2, Play, Upload, Loader2, CheckCircle2, XCircle, Link2 } from "lucide-react";
import Papa from "papaparse";
import KeyValueTable from "@/components/api-tester/KeyValueTable";
import { useApiTester } from "@/providers/api-tester-provider";
import { genAxios, genCurl, genFetch, genNodeHttp, genPython, uid } from "@/lib/api-tester/engine";
import type { ApiRequest, Environment, HttpMethod, MockEndpoint, RunnerDataRow } from "@/lib/api-tester/types";

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
    try { return found.gen(request, vars); } catch (e) { return `// Could not generate snippet: ${e instanceof Error ? e.message : String(e)}`; }
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
  const { importFromCurl, importPostmanJson, toast } = useApiTester();
  const [text, setText] = useState("");

  const doImport = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    // Try Postman collection/environment JSON first, then fall back to cURL.
    if (trimmed.startsWith("{")) {
      try {
        const json = JSON.parse(trimmed);
        const kind = importPostmanJson(json);
        if (kind) { onClose(); return; }
        toast("That JSON doesn't look like a Postman collection or environment export");
        return;
      } catch {
        // not valid JSON — fall through to curl parsing below
      }
    }
    try {
      importFromCurl(text);
      toast("Request imported");
      onClose();
    } catch {
      toast("Couldn't parse that as a curl command or Postman export");
    }
  };

  const onFile = (file: File) => {
    file.text().then((content) => setText(content));
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
      <div className="mb-2 flex items-center justify-between text-xs text-[var(--text-faint)]">
        <span>Paste a cURL command, or a Postman collection/environment JSON export.</span>
        <label className="cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 font-semibold text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)]">
          Upload file
          <input type="file" accept=".json,.txt" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </label>
      </div>
      <textarea
        className="h-[220px] w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] p-2.5 font-[family-name:var(--font-mono)] text-[12.5px] leading-[1.6]"
        placeholder={"curl --location 'https://api.example.com/users' \\\n--header 'Authorization: Bearer {{token}}'\n\n— or —\n\n{ \"info\": { \"name\": \"My Postman Collection\" }, \"item\": [...] }"}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </Modal>
  );
}

/* ============================= Collection Runner modal ============================= */
export function CollectionRunnerModal({ collectionId, onClose }: { collectionId: string; onClose: () => void }) {
  const { collections, runCollectionById, runningCollectionId, runnerResult, clearRunnerResult } = useApiTester();
  const collection = collections.find((c) => c.id === collectionId);
  const [dataRows, setDataRows] = useState<RunnerDataRow[] | undefined>(undefined);
  const [fileName, setFileName] = useState("");
  const [delayMs, setDelayMs] = useState(0);
  const [abortOnFailure, setAbortOnFailure] = useState(false);
  const isRunning = runningCollectionId === collectionId;

  const onFile = (file: File) => {
    setFileName(file.name);
    if (file.name.endsWith(".json")) {
      file.text().then((t) => { try { setDataRows(JSON.parse(t)); } catch { setDataRows(undefined); } });
    } else {
      Papa.parse<RunnerDataRow>(file, { header: true, skipEmptyLines: true, complete: (res) => setDataRows(res.data) });
    }
  };

  if (!collection) return null;
  const iterations = dataRows?.length || 1;

  return (
    <Modal title={`Run Collection — ${collection.name}`} onClose={onClose} width={640}>
      {!runnerResult ? (
        <>
          <div className="mb-3 text-xs text-[var(--text-faint)]">
            Runs every request in this collection in order{dataRows ? `, once per row in ${fileName} (${iterations} iterations)` : ""}. Test scripts, pre-request scripts, and chain extractions all run exactly as they would normally — so a variable saved by request A is available to request B.
          </div>
          <div className="mb-3 flex items-center gap-2.5">
            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-[11.5px] font-semibold text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)]">
              <Upload size={12} /> {fileName || "Upload CSV/JSON data file (optional)"}
              <input type="file" accept=".csv,.json" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            </label>
            {dataRows && <button onClick={() => { setDataRows(undefined); setFileName(""); }} className="text-[11px] text-[var(--text-faint)] hover:text-[var(--danger)]">Clear</button>}
          </div>
          <label className="mb-3 flex items-center gap-2 text-[12px]">
            Delay between requests (ms)
            <input type="number" min={0} className="w-20 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-1 font-[family-name:var(--font-mono)] text-[12px]" value={delayMs} onChange={(e) => setDelayMs(Math.max(0, Number(e.target.value) || 0))} />
          </label>
          <label className="mb-4 flex cursor-pointer items-start gap-2.5">
            <input type="checkbox" className="mt-0.5 h-3.5 w-3.5 accent-[var(--primary)]" checked={abortOnFailure} onChange={(e) => setAbortOnFailure(e.target.checked)} />
            <div>
              <div className="text-[12.5px] font-semibold">Stop on first failure</div>
              <div className="text-[11px] text-[var(--text-faint)]">Halts the run as soon as a request fails or a test assertion fails — recommended for chained flows where later steps depend on earlier ones succeeding.</div>
            </div>
          </label>
          <button
            disabled={isRunning}
            onClick={() => runCollectionById(collectionId, dataRows, delayMs, abortOnFailure)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,var(--primary),#7C4CF0)] py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
          >
            {isRunning ? <Loader2 size={15} className="animate-spin" /> : <Play size={14} />}
            {isRunning ? "Running…" : "Run Collection"}
          </button>
        </>
      ) : (
        <div>
          {runnerResult.aborted && (
            <div className="mb-3 rounded-lg bg-[var(--warning-dim)] px-3 py-2 text-[11.5px] font-semibold text-[var(--warning)]">
              Stopped early — a request failed and &quot;Stop on first failure&quot; was on.
            </div>
          )}
          <div className="mb-3 flex items-center gap-4 rounded-lg bg-[var(--bg-elev)] p-3">
            <div>
              <div className="text-[20px] font-extrabold text-[var(--success)]">{runnerResult.passed}/{runnerResult.total}</div>
              <div className="text-[10.5px] uppercase tracking-wide text-[var(--text-faint)]">Requests passed</div>
            </div>
            <div>
              <div className="text-[20px] font-extrabold">{runnerResult.testsPassed}/{runnerResult.totalTests}</div>
              <div className="text-[10.5px] uppercase tracking-wide text-[var(--text-faint)]">Assertions passed</div>
            </div>
            <div>
              <div className="text-[20px] font-extrabold">{(runnerResult.durationMs / 1000).toFixed(1)}s</div>
              <div className="text-[10.5px] uppercase tracking-wide text-[var(--text-faint)]">Total time</div>
            </div>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {runnerResult.results.map((r, i) => (
              <div key={i} className="mb-1 rounded-lg border border-[var(--border-soft)] px-2.5 py-2">
                <div className="flex items-center gap-2.5">
                  {r.ok ? <CheckCircle2 size={15} className="flex-shrink-0 text-[var(--success)]" /> : <XCircle size={15} className="flex-shrink-0 text-[var(--danger)]" />}
                  <span className="rounded-md bg-[var(--bg-elev)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[10.5px] font-bold">{r.method}</span>
                  <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[12px]">{r.name}{iterations > 1 ? ` (#${r.iteration + 1})` : ""}</span>
                  {r.testResults && <span className="text-[11px] text-[var(--text-faint)]">{r.testResults.filter((t) => t.pass).length}/{r.testResults.length} tests</span>}
                  <span className="text-[11px] font-bold text-[var(--text-faint)]">{r.status ?? r.error ?? "—"}</span>
                </div>
                {r.extractedVars.length > 0 && (
                  <div className="ml-[26px] mt-1.5 flex flex-wrap gap-1.5">
                    {r.extractedVars.map((v, vi) => (
                      <span key={vi} className="flex items-center gap-1 rounded-md bg-[var(--primary-dim)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-semibold text-[var(--primary)]">
                        <Link2 size={9} /> {v.varName} = {v.value.slice(0, 24)}{v.value.length > 24 ? "…" : ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => { setDataRows(undefined); setFileName(""); clearRunnerResult(); }} className="mt-3 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] py-2 text-xs font-semibold text-[var(--text-dim)]">
            Run again
          </button>
        </div>
      )}
    </Modal>
  );
}

/* ============================= Collection variables modal ============================= */
export function CollectionVariablesModal({ collectionId, onClose }: { collectionId: string; onClose: () => void }) {
  const { collections, updateCollectionVariables, toast } = useApiTester();
  const collection = collections.find((c) => c.id === collectionId);
  if (!collection) return null;
  return (
    <Modal
      title={`Variables — ${collection.name}`}
      onClose={onClose}
      width={560}
      footer={<button onClick={() => { toast("Collection variables saved"); onClose(); }} className="rounded-lg bg-[linear-gradient(135deg,var(--primary),#7C4CF0)] px-3.5 py-2 text-xs font-semibold text-white">Done</button>}
    >
      <div className="mb-2.5 text-xs text-[var(--text-faint)]">
        Shared by every request in this collection. Precedence: Global → Environment → Collection → Request-local (later wins).
      </div>
      <KeyValueTable rows={collection.variables} onChange={(vars) => updateCollectionVariables(collectionId, vars)} keyPlaceholder="Variable" valuePlaceholder="Value" showDesc={false} />
    </Modal>
  );
}

/* ============================= Mock server modal ============================= */
function MockEndpointRow({ serverId, endpoint }: { serverId: string; endpoint: MockEndpoint }) {
  const { updateMockEndpoint, deleteMockEndpoint } = useApiTester();
  const [expanded, setExpanded] = useState(false);
  const patch = (p: Partial<typeof endpoint>) => updateMockEndpoint(serverId, endpoint.id, p);

  return (
    <div className="mb-1.5 rounded-lg border border-[var(--border-soft)]">
      <div className="flex items-center gap-1.5 p-2">
        <input type="checkbox" className="h-3.5 w-3.5 accent-[var(--primary)]" checked={endpoint.enabled} onChange={(e) => patch({ enabled: e.target.checked })} />
        <select value={endpoint.method} onChange={(e) => patch({ method: e.target.value as HttpMethod })} className="rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-1.5 py-1 font-[family-name:var(--font-mono)] text-[11px] font-bold">
          {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <input className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-1 font-[family-name:var(--font-mono)] text-[11.5px]" placeholder="/users/:id" value={endpoint.path} onChange={(e) => patch({ path: e.target.value })} />
        <input type="number" className="w-[58px] rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-1.5 py-1 font-[family-name:var(--font-mono)] text-[11.5px]" value={endpoint.statusCode} onChange={(e) => patch({ statusCode: Number(e.target.value) || 200 })} />
        <button onClick={() => setExpanded(!expanded)} className="rounded-md px-1.5 py-1 text-[11px] font-semibold text-[var(--text-dim)] hover:bg-[var(--card-hover)]">{expanded ? "Hide" : "Edit"}</button>
        <button onClick={() => deleteMockEndpoint(serverId, endpoint.id)} className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-dim)] hover:text-[var(--danger)]"><Trash2 size={13} /></button>
      </div>
      {expanded && (
        <div className="border-t border-[var(--border-soft)] p-2.5 pt-2">
          <div className="mb-2 flex items-center gap-2 text-[11.5px]">
            <span className="text-[var(--text-faint)]">Delay (ms)</span>
            <input type="number" min={0} className="w-20 rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-1.5 py-1 font-[family-name:var(--font-mono)] text-[11.5px]" value={endpoint.delayMs} onChange={(e) => patch({ delayMs: Math.max(0, Number(e.target.value) || 0) })} />
          </div>
          <div className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[var(--text-faint)]">Response headers</div>
          <KeyValueTable rows={endpoint.headers} onChange={(headers) => patch({ headers })} showDesc={false} keyPlaceholder="Header" valuePlaceholder="Value" />
          <div className="mb-1.5 mt-2.5 text-[10.5px] font-bold uppercase tracking-wide text-[var(--text-faint)]">Response body</div>
          <textarea
            spellCheck={false}
            value={endpoint.body}
            onChange={(e) => patch({ body: e.target.value })}
            className="h-[120px] w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] p-2.5 font-[family-name:var(--font-mono)] text-[12px] leading-[1.5] outline-none"
          />
        </div>
      )}
    </div>
  );
}

export function MockServerModal({ serverId, onClose }: { serverId: string; onClose: () => void }) {
  const { mockServers, updateMockServer, addMockEndpoint, toast } = useApiTester();
  const server = mockServers.find((s) => s.id === serverId);
  const baseUrl = typeof window !== "undefined" ? `${window.location.origin}/api/mock/${serverId}` : "";

  if (!server) return null;

  return (
    <Modal title={server.name} onClose={onClose} width={680}>
      <div className="mb-3 flex items-center gap-2">
        <input value={server.name} onChange={(e) => updateMockServer(serverId, { name: e.target.value })} className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-1.5 text-[13px] font-semibold" />
        <label className="flex cursor-pointer items-center gap-1.5 text-[11.5px] font-semibold text-[var(--text-dim)]">
          <input type="checkbox" className="h-3.5 w-3.5 accent-[var(--primary)]" checked={server.enabled} onChange={(e) => updateMockServer(serverId, { enabled: e.target.checked })} />
          Enabled
        </label>
      </div>
      <div className="mb-3.5 flex items-center gap-1.5 rounded-lg bg-[var(--bg-elev)] px-2.5 py-2">
        <span className="text-[11px] font-semibold text-[var(--text-faint)]">Base URL</span>
        <code className="flex-1 overflow-x-auto whitespace-nowrap font-[family-name:var(--font-mono)] text-[11.5px]">{baseUrl}</code>
        <button onClick={() => { navigator.clipboard?.writeText(baseUrl); toast("Base URL copied"); }} className="flex-shrink-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[11px] font-semibold text-[var(--text-dim)] hover:text-[var(--text)]">
          <Copy size={11} className="mr-1 inline" /> Copy
        </button>
      </div>
      <div className="mb-2 text-[11px] leading-[1.6] text-[var(--text-faint)]">
        Point any app at this URL — <span className="font-[family-name:var(--font-mono)]">{baseUrl}/users/1</span> matches an endpoint path of <span className="font-[family-name:var(--font-mono)]">/users/:id</span>. Config is pushed to the server automatically whenever you edit it here.
      </div>
      <div className="max-h-[360px] overflow-y-auto pr-0.5">
        {server.endpoints.map((ep) => <MockEndpointRow key={ep.id} serverId={serverId} endpoint={ep} />)}
      </div>
      <button onClick={() => addMockEndpoint(serverId)} className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-[11.5px] font-semibold text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)]">
        <Plus size={12} /> Add endpoint
      </button>
    </Modal>
  );
}
