"use client";

import { useState } from "react";
import { Braces, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { COMMON_HEADERS } from "@/lib/api-tester/engine";
import KeyValueTable from "@/components/api-tester/KeyValueTable";
import { useApiTester } from "@/providers/api-tester-provider";
import type { ApiRequest, AuthType, BodyMode, ReqTabKey } from "@/lib/api-tester/types";

const REQUEST_TABS: { key: ReqTabKey; label: string }[] = [
  { key: "params", label: "Params" },
  { key: "headers", label: "Headers" },
  { key: "body", label: "Body" },
  { key: "auth", label: "Auth" },
  { key: "prescript", label: "Pre-request Script" },
  { key: "tests", label: "Tests" },
  { key: "settings", label: "Settings" },
  { key: "docs", label: "Docs" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="mb-[5px] text-[11.5px] font-bold text-[var(--text-dim)]">{label}</div>
      {children}
    </div>
  );
}

function ParamsPanel({ request, updateRequest }: { request: ApiRequest; updateRequest: (p: Partial<ApiRequest>) => void }) {
  const count = request.params.filter((p) => p.enabled && p.key).length;
  return (
    <div className="p-3.5 px-1.5">
      <div className="flex items-center justify-between px-2 pb-2.5">
        <span className="text-[12.5px] font-bold">
          Query Params {count > 0 && <span className="font-medium text-[var(--text-faint)]">({count})</span>}
        </span>
      </div>
      <KeyValueTable rows={request.params} onChange={(params) => updateRequest({ params })} />
    </div>
  );
}

function HeadersPanel({ request, updateRequest }: { request: ApiRequest; updateRequest: (p: Partial<ApiRequest>) => void }) {
  const count = request.headers.filter((h) => h.enabled && h.key).length;
  return (
    <div className="p-3.5 px-1.5">
      <div className="flex items-center justify-between px-2 pb-2.5">
        <span className="text-[12.5px] font-bold">
          Headers {count > 0 && <span className="font-medium text-[var(--text-faint)]">({count})</span>}
        </span>
      </div>
      <KeyValueTable rows={request.headers} onChange={(headers) => updateRequest({ headers })} suggestions={COMMON_HEADERS} />
    </div>
  );
}

const BODY_MODES: { key: BodyMode; label: string }[] = [
  { key: "none", label: "None" },
  { key: "raw", label: "Raw" },
  { key: "form-data", label: "Form Data" },
  { key: "urlencoded", label: "x-www-form-urlencoded" },
  { key: "graphql", label: "GraphQL" },
];
const RAW_TYPES = ["json", "text", "html", "xml", "js"] as const;

function BodyPanel({ request, updateRequest }: { request: ApiRequest; updateRequest: (p: Partial<ApiRequest>) => void }) {
  const body = request.body;
  const setBody = (patch: Partial<ApiRequest["body"]>) => updateRequest({ body: { ...body, ...patch } });
  let jsonValid = true;
  let jsonError = "";
  if (body.mode === "raw" && body.rawType === "json" && body.raw.trim()) {
    try { JSON.parse(body.raw); } catch (e: any) { jsonValid = false; jsonError = e.message; }
  }
  const beautify = () => { try { setBody({ raw: JSON.stringify(JSON.parse(body.raw), null, 2) }); } catch {} };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3.5 p-2.5 px-3.5">
        {BODY_MODES.map((m) => (
          <label key={m.key} className="flex cursor-pointer items-center gap-1.5 text-[12.5px]" style={{ color: body.mode === m.key ? "var(--text)" : "var(--text-dim)", fontWeight: body.mode === m.key ? 700 : 500 }}>
            <span
              onClick={() => setBody({ mode: m.key })}
              className="flex h-[14px] w-[14px] items-center justify-center rounded-full border-[1.5px]"
              style={{ borderColor: body.mode === m.key ? "var(--primary)" : "var(--border)" }}
            >
              {body.mode === m.key && <span className="h-[7px] w-[7px] rounded-full bg-[var(--primary)]" />}
            </span>
            <span onClick={() => setBody({ mode: m.key })}>{m.label}</span>
          </label>
        ))}
        {body.mode === "raw" && (
          <div className="ml-auto flex items-center gap-1.5">
            <select className="rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px]" value={body.rawType} onChange={(e) => setBody({ rawType: e.target.value as any })}>
              {RAW_TYPES.map((k) => <option key={k} value={k}>{k.toUpperCase()}</option>)}
            </select>
            {body.rawType === "json" && (
              <button onClick={beautify} className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-[7px] text-xs font-semibold text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)]">
                <Braces size={12} /> Beautify
              </button>
            )}
          </div>
        )}
      </div>
      <div className="h-px flex-shrink-0 bg-[var(--border-soft)]" />
      {body.mode === "none" && (
        <div className="flex flex-1 items-center justify-center text-[12.5px] text-[var(--text-faint)]">This request does not have a body</div>
      )}
      {(body.mode === "raw" || body.mode === "graphql") && (
        <div className="relative min-h-0 flex-1">
          <textarea
            spellCheck={false}
            value={body.raw}
            placeholder={body.mode === "graphql" ? '{\n  "query": "{ users { id name } }",\n  "variables": {}\n}' : body.rawType === "json" ? '{\n  "key": "value"\n}' : "Body content..."}
            onChange={(e) => setBody({ raw: e.target.value })}
            className="h-full w-full resize-none bg-[var(--bg-elev)] p-3.5 font-[family-name:var(--font-mono)] text-[12.5px] leading-[1.6] text-[var(--text)] outline-none"
          />
          {!jsonValid && (
            <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center gap-1.5 rounded-lg bg-[var(--danger-dim)] px-2.5 py-1.5 text-[11.5px] text-[var(--danger)]">
              <AlertTriangle size={13} /> Invalid JSON — {jsonError}
            </div>
          )}
        </div>
      )}
      {(body.mode === "form-data" || body.mode === "urlencoded") && (
        <div className="flex-1 overflow-y-auto p-3 px-1.5">
          <KeyValueTable
            rows={body.mode === "form-data" ? body.formData : body.urlencoded}
            onChange={(rows) => setBody(body.mode === "form-data" ? { formData: rows } : { urlencoded: rows })}
            showDesc={false}
          />
        </div>
      )}
    </div>
  );
}

const AUTH_TYPES: { key: AuthType; label: string }[] = [
  { key: "none", label: "No Auth" },
  { key: "bearer", label: "Bearer Token" },
  { key: "basic", label: "Basic Auth" },
  { key: "apikey", label: "API Key" },
  { key: "oauth2", label: "OAuth 2.0" },
  { key: "awsv4", label: "AWS Signature v4" },
];
function AuthPanel({ request, updateRequest }: { request: ApiRequest; updateRequest: (p: Partial<ApiRequest>) => void }) {
  const auth = request.auth;
  const setAuth = (patch: Partial<ApiRequest["auth"]>) => updateRequest({ auth: { ...auth, ...patch } });
  return (
    <div className="flex h-full">
      <div className="w-[190px] flex-shrink-0 border-r border-[var(--border-soft)] p-3.5 px-2">
        {AUTH_TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => setAuth({ type: t.key })}
            className={cn("mb-0.5 block w-full rounded-lg px-3 py-2 text-left text-[12.5px] font-semibold text-[var(--text-dim)] hover:bg-[var(--card-hover)]",
              auth.type === t.key && "bg-[var(--primary-dim)] text-[var(--primary)] hover:bg-[var(--primary-dim)]")}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="max-w-[420px] flex-1 overflow-y-auto p-[18px]">
        {auth.type === "none" && <div className="text-[12.5px] text-[var(--text-faint)]">This request does not use any authorization.</div>}
        {auth.type === "bearer" && (
          <Field label="Token">
            <input className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px]" placeholder="{{access_token}}" value={auth.token} onChange={(e) => setAuth({ token: e.target.value })} />
          </Field>
        )}
        {auth.type === "basic" && (
          <>
            <Field label="Username"><input className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] text-[12.5px]" value={auth.username} onChange={(e) => setAuth({ username: e.target.value })} /></Field>
            <Field label="Password"><input type="password" className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] text-[12.5px]" value={auth.password} onChange={(e) => setAuth({ password: e.target.value })} /></Field>
          </>
        )}
        {auth.type === "apikey" && (
          <>
            <Field label="Key"><input className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px]" value={auth.apiKeyName} onChange={(e) => setAuth({ apiKeyName: e.target.value })} /></Field>
            <Field label="Value"><input className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px]" value={auth.apiKeyValue} onChange={(e) => setAuth({ apiKeyValue: e.target.value })} /></Field>
            <Field label="Add to">
              <select className="rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-[7px] text-[12.5px]" value={auth.apiKeyIn} onChange={(e) => setAuth({ apiKeyIn: e.target.value as any })}>
                <option value="header">Header</option>
                <option value="query">Query Params</option>
              </select>
            </Field>
          </>
        )}
        {auth.type === "oauth2" && (
          <>
            <Field label="Grant Type">
              <select
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-[7px] text-[12.5px]"
                value={auth.oauth2.grantType}
                onChange={(e) => setAuth({ oauth2: { ...auth.oauth2, grantType: e.target.value as any } })}
              >
                <option value="client_credentials">Client Credentials</option>
                <option value="password">Password (Resource Owner)</option>
                <option value="authorization_code_manual">Paste Existing Access Token</option>
              </select>
            </Field>
            {auth.oauth2.grantType === "authorization_code_manual" ? (
              <Field label="Access Token">
                <input className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px]" placeholder="{{access_token}}" value={auth.oauth2.manualToken} onChange={(e) => setAuth({ oauth2: { ...auth.oauth2, manualToken: e.target.value } })} />
              </Field>
            ) : (
              <>
                <Field label="Access Token URL">
                  <input className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px]" placeholder="https://auth.example.com/oauth/token" value={auth.oauth2.accessTokenUrl} onChange={(e) => setAuth({ oauth2: { ...auth.oauth2, accessTokenUrl: e.target.value } })} />
                </Field>
                <Field label="Client ID"><input className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px]" value={auth.oauth2.clientId} onChange={(e) => setAuth({ oauth2: { ...auth.oauth2, clientId: e.target.value } })} /></Field>
                <Field label="Client Secret"><input type="password" className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px]" value={auth.oauth2.clientSecret} onChange={(e) => setAuth({ oauth2: { ...auth.oauth2, clientSecret: e.target.value } })} /></Field>
                {auth.oauth2.grantType === "password" && (
                  <>
                    <Field label="Username"><input className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] text-[12.5px]" value={auth.oauth2.username} onChange={(e) => setAuth({ oauth2: { ...auth.oauth2, username: e.target.value } })} /></Field>
                    <Field label="Password"><input type="password" className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] text-[12.5px]" value={auth.oauth2.password} onChange={(e) => setAuth({ oauth2: { ...auth.oauth2, password: e.target.value } })} /></Field>
                  </>
                )}
                <Field label="Scope"><input className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px]" placeholder="read write" value={auth.oauth2.scope} onChange={(e) => setAuth({ oauth2: { ...auth.oauth2, scope: e.target.value } })} /></Field>
                <div className="text-[11px] leading-[1.6] text-[var(--text-faint)]">Fetches a fresh token from the URL above the first time this request sends, then caches it in memory until it expires — no separate &quot;Get New Access Token&quot; click needed.</div>
              </>
            )}
            <Field label="Header Prefix"><input className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px]" value={auth.oauth2.headerPrefix} onChange={(e) => setAuth({ oauth2: { ...auth.oauth2, headerPrefix: e.target.value } })} /></Field>
          </>
        )}
        {auth.type === "awsv4" && (
          <>
            <Field label="Access Key ID"><input className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px]" value={auth.awsv4.accessKeyId} onChange={(e) => setAuth({ awsv4: { ...auth.awsv4, accessKeyId: e.target.value } })} /></Field>
            <Field label="Secret Access Key"><input type="password" className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px]" value={auth.awsv4.secretAccessKey} onChange={(e) => setAuth({ awsv4: { ...auth.awsv4, secretAccessKey: e.target.value } })} /></Field>
            <Field label="Session Token (optional)"><input className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px]" value={auth.awsv4.sessionToken} onChange={(e) => setAuth({ awsv4: { ...auth.awsv4, sessionToken: e.target.value } })} /></Field>
            <Field label="Region"><input className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px]" placeholder="us-east-1" value={auth.awsv4.region} onChange={(e) => setAuth({ awsv4: { ...auth.awsv4, region: e.target.value } })} /></Field>
            <Field label="Service"><input className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px]" placeholder="execute-api" value={auth.awsv4.service} onChange={(e) => setAuth({ awsv4: { ...auth.awsv4, service: e.target.value } })} /></Field>
            <div className="text-[11px] leading-[1.6] text-[var(--text-faint)]">Signs the request with Signature Version 4 at send time — works for API Gateway, S3, and other AWS services callable directly from the browser.</div>
          </>
        )}
      </div>
    </div>
  );
}

function ScriptPanel({ value, onChange, variant }: { value: string; onChange: (v: string) => void; variant: "pre" | "test" }) {
  const snippets: [string, string][] =
    variant === "pre"
      ? [["Set environment var", 'pt.environment.set("key", "value");'], ["Set global var", 'pt.variables.set("key", "value");'], ["Read env var", 'const v = pt.environment.get("key");']]
      : [
          ["Status check", 'pt.test("Status is 200", () => {\n  pt.expect(pt.response.status).toBe(200);\n});'],
          ["Body contains", 'pt.test("Body includes text", () => {\n  pt.expect(pt.response.text()).toInclude("success");\n});'],
          ["JSON field check", 'pt.test("Has id field", () => {\n  pt.expect(pt.response.json().id).toExist();\n});'],
          ["Response time", 'pt.test("Responds under 1s", () => {\n  pt.expect(pt.response.duration).toBeLessThan(1000);\n});'],
        ];
  return (
    <div className="flex h-full">
      <textarea
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 resize-none bg-[var(--bg-elev)] p-3.5 font-[family-name:var(--font-mono)] text-[12.5px] leading-[1.6] text-[var(--text)] outline-none"
      />
      <div className="w-[220px] flex-shrink-0 overflow-y-auto border-l border-[var(--border-soft)] p-3">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-faint)]">Snippets</div>
        {snippets.map(([label, code]) => (
          <button
            key={label}
            onClick={() => onChange(value + (value.endsWith("\n") || !value ? "" : "\n") + code + "\n")}
            className="mb-1.5 block w-full rounded-xl border border-[var(--border-soft)] px-2.5 py-2 text-left text-[11.5px] text-[var(--text-dim)] hover:border-[var(--text-faint)]"
          >
            + {label}
          </button>
        ))}
        <div className="my-2.5 h-px bg-[var(--border-soft)]" />
        <div className="text-[11px] leading-[1.6] text-[var(--text-faint)]">
          {variant === "pre"
            ? "Runs in a sandbox before the request is sent. Use it to compute signatures, timestamps, or set variables."
            : "Runs after a response is received. pt.expect(...) assertions determine pass/fail, shown in the Tests tab."}
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({ request, updateRequest }: { request: ApiRequest; updateRequest: (p: Partial<ApiRequest>) => void }) {
  const s = request.settings;
  const setS = (patch: Partial<ApiRequest["settings"]>) => updateRequest({ settings: { ...s, ...patch } });
  return (
    <div className="max-w-[440px] p-[18px]">
      <Field label="Request timeout (ms)">
        <input type="number" className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px]" value={s.timeout} onChange={(e) => setS({ timeout: Number(e.target.value) || 0 })} />
      </Field>
      <label className="flex cursor-pointer items-center gap-2.5 py-2">
        <input type="checkbox" checked={s.followRedirects} onChange={(e) => setS({ followRedirects: e.target.checked })} className="h-3.5 w-3.5 accent-[var(--primary)]" />
        <div>
          <div className="text-[12.5px] font-semibold">Follow redirects</div>
          <div className="text-[11px] text-[var(--text-faint)]">Automatically follow 3xx redirect responses</div>
        </div>
      </label>
      <label className="flex cursor-pointer items-center gap-2.5 py-2">
        <input type="checkbox" checked={s.sslVerify} onChange={(e) => setS({ sslVerify: e.target.checked })} className="h-3.5 w-3.5 accent-[var(--primary)]" />
        <div>
          <div className="text-[12.5px] font-semibold">SSL certificate verification</div>
          <div className="text-[11px] text-[var(--text-faint)]">Browsers always verify certificates; this mirrors desktop client behavior for exported code</div>
        </div>
      </label>
      <div className="my-3.5 h-px bg-[var(--border-soft)]" />
      <label className="flex cursor-pointer items-center gap-2.5 py-2">
        <input type="checkbox" checked={s.forceProxy} onChange={(e) => setS({ forceProxy: e.target.checked })} className="h-3.5 w-3.5 accent-[var(--primary)]" />
        <div>
          <div className="text-[12.5px] font-semibold">Always send through server proxy</div>
          <div className="text-[11px] text-[var(--text-faint)]">
            Off by default: a direct browser request is tried first, and only falls back to the server proxy if it's blocked by CORS. Turn this on to skip straight to the proxy (e.g. for a site you already know blocks browser calls).
          </div>
        </div>
      </label>
      <div className="my-3.5 h-px bg-[var(--border-soft)]" />
      <Field label="Retry on failure (max attempts)">
        <input type="number" min={0} max={10} className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px]" value={s.maxRetries} onChange={(e) => setS({ maxRetries: Math.max(0, Number(e.target.value) || 0) })} />
      </Field>
      <Field label="Delay between retries (ms)">
        <input type="number" min={0} className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px]" value={s.retryDelayMs} onChange={(e) => setS({ retryDelayMs: Math.max(0, Number(e.target.value) || 0) })} />
      </Field>
      <div className="text-[11px] leading-[1.6] text-[var(--text-faint)]">On network errors or timeouts, CodePeeler will retry up to this many times before showing a failure — useful for flaky endpoints during testing.</div>
    </div>
  );
}

function DocsPanel({ request, updateRequest }: { request: ApiRequest; updateRequest: (p: Partial<ApiRequest>) => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--border-soft)] p-3.5 pb-2.5 text-[11px] leading-[1.6] text-[var(--text-faint)]">
        Notes shown alongside this request — describe what it does, expected responses, or gotchas for teammates. Supports plain text or Markdown.
      </div>
      <textarea
        spellCheck={false}
        value={request.description}
        placeholder="e.g. Returns the current user's profile. Requires a valid bearer token. 404 means the user was deleted."
        onChange={(e) => updateRequest({ description: e.target.value })}
        className="flex-1 resize-none bg-[var(--bg-elev)] p-3.5 text-[12.5px] leading-[1.6] text-[var(--text)] outline-none"
      />
    </div>
  );
}

export default function RequestPanel() {
  const { activeTab, updateRequest, setReqTab } = useApiTester();
  if (!activeTab) return null;
  const req = activeTab.request;
  const paramCount = req.params.filter((p) => p.enabled && p.key).length;
  const headerCount = req.headers.filter((h) => h.enabled && h.key).length;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-shrink-0 items-center gap-0.5 overflow-x-auto border-b border-[var(--border-soft)] px-2.5">
        {REQUEST_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setReqTab(t.key)}
            className="flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-[12.5px] font-semibold"
            style={{ color: activeTab.reqTab === t.key ? "var(--text)" : "var(--text-faint)", borderBottom: `2px solid ${activeTab.reqTab === t.key ? "var(--primary)" : "transparent"}` }}
          >
            {t.label}
            {t.key === "params" && paramCount > 0 && <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />}
            {t.key === "headers" && headerCount > 0 && <span className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--text-faint)]">({headerCount})</span>}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeTab.reqTab === "params" && <ParamsPanel request={req} updateRequest={updateRequest} />}
        {activeTab.reqTab === "headers" && <HeadersPanel request={req} updateRequest={updateRequest} />}
        {activeTab.reqTab === "body" && <div className="h-full"><BodyPanel request={req} updateRequest={updateRequest} /></div>}
        {activeTab.reqTab === "auth" && <div className="h-full"><AuthPanel request={req} updateRequest={updateRequest} /></div>}
        {activeTab.reqTab === "prescript" && <div className="h-full"><ScriptPanel value={req.preScript} onChange={(v) => updateRequest({ preScript: v })} variant="pre" /></div>}
        {activeTab.reqTab === "tests" && <div className="h-full"><ScriptPanel value={req.testScript} onChange={(v) => updateRequest({ testScript: v })} variant="test" /></div>}
        {activeTab.reqTab === "settings" && <SettingsPanel request={req} updateRequest={updateRequest} />}
        {activeTab.reqTab === "docs" && <DocsPanel request={req} updateRequest={updateRequest} />}
      </div>
    </div>
  );
}
