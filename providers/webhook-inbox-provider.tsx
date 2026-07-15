"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CapturedRequest, WebhookInboxRef } from "@/lib/webhook-inbox/types";

const STORAGE_KEY = "codepeeler:webhook-inboxes";
const MAX_REQUESTS_IN_MEMORY = 300;

interface WebhookInboxContextValue {
  configured: boolean;
  inboxes: WebhookInboxRef[];
  activeInbox: WebhookInboxRef | null;
  activeSlug: string | null;
  setActiveSlug: (slug: string | null) => void;
  requests: CapturedRequest[];
  loadingRequests: boolean;
  creating: boolean;
  error: string | null;
  createInbox: (name?: string) => Promise<void>;
  removeInboxLocally: (slug: string) => void;
  deleteInboxEverywhere: (slug: string) => Promise<void>;
  clearRequests: (slug: string) => Promise<void>;
}

const WebhookInboxContext = createContext<WebhookInboxContextValue | null>(null);

function loadRefs(): WebhookInboxRef[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WebhookInboxRef[]) : [];
  } catch {
    return [];
  }
}

function saveRefs(refs: WebhookInboxRef[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(refs));
  } catch {
    /* storage full/unavailable — non-fatal, inbox still works server-side */
  }
}

export function WebhookInboxProvider({ children }: { children: React.ReactNode }) {
  // Start empty on both the server render and the client's first render —
  // localStorage doesn't exist on the server, so seeding this from
  // loadRefs() in the initializer (as before) made the client's first
  // paint differ from the server-rendered HTML and triggered a hydration
  // mismatch. Loading the real refs in the effect below means the empty
  // state flashes for one frame instead, which is the correct trade-off.
  const [inboxes, setInboxes] = useState<WebhookInboxRef[]>([]);
  const [activeSlug, setActiveSlugState] = useState<string | null>(null);
  const [requests, setRequests] = useState<CapturedRequest[]>([]);
  const [requestsInboxId, setRequestsInboxId] = useState<string | null>(null);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const configured = !!supabase;
  const channelRef = useRef<ReturnType<NonNullable<typeof supabase>["channel"]> | null>(null);

  // Runs once after mount, client-only — safe to touch localStorage here.
  useEffect(() => {
    const refs = loadRefs();
    setInboxes(refs);
    setActiveSlugState(refs[0]?.slug ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeInbox = useMemo(() => inboxes.find((i) => i.slug === activeSlug) || null, [inboxes, activeSlug]);

  // Resetting derived state when switching to a different inbox, done during render rather
  // than in an effect — see react.dev "Resetting state without an effect". This avoids a
  // stale-data flash (old inbox's requests briefly visible) that an effect-based reset would
  // cause, and sidesteps a synchronous setState-in-effect entirely.
  const activeInboxId = activeInbox?.id ?? null;
  if (activeInboxId !== requestsInboxId) {
    setRequestsInboxId(activeInboxId);
    setRequests([]);
    setLoadingRequests(activeInboxId !== null);
  }

  const setActiveSlug = useCallback((slug: string | null) => {
    setActiveSlugState(slug);
    setError(null);
  }, []);

  // Load existing history + subscribe to live inserts whenever the active inbox changes.
  useEffect(() => {
    if (channelRef.current && supabase) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (!activeInbox || !supabase) return;

    let cancelled = false;
    supabase
      .from("webhook_requests")
      .select("*")
      .eq("inbox_id", activeInbox.id)
      .order("received_at", { ascending: false })
      .limit(MAX_REQUESTS_IN_MEMORY)
      .then(({ data, error: fetchErr }) => {
        if (cancelled) return;
        setLoadingRequests(false);
        if (fetchErr) {
          setError(fetchErr.message);
          return;
        }
        setRequests((data as CapturedRequest[]) || []);
      });

    const channel = supabase
      .channel(`webhook_requests:${activeInbox.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "webhook_requests", filter: `inbox_id=eq.${activeInbox.id}` },
        (payload) => {
          setRequests((prev) => [payload.new as CapturedRequest, ...prev].slice(0, MAX_REQUESTS_IN_MEMORY));
        }
      )
      .subscribe();
    channelRef.current = channel;

    return () => {
      cancelled = true;
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
    // activeInbox is derived from inboxes+activeSlug; only its identity (id) matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeInbox?.id, supabase]);

  const createInbox = useCallback(async (name?: string) => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/webhook-inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}) as Record<string, unknown>);
      if (!res.ok || data.error) throw new Error((data.error as string) || `Request failed (${res.status})`);
      const ref: WebhookInboxRef = { id: data.id, slug: data.slug, name: data.name, createdAt: data.createdAt };
      setInboxes((prev) => {
        const next = [ref, ...prev];
        saveRefs(next);
        return next;
      });
      setActiveSlug(ref.slug);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't create an inbox.");
    } finally {
      setCreating(false);
    }
  }, [setActiveSlug]);

  const removeInboxLocally = useCallback(
    (slug: string) => {
      setInboxes((prev) => {
        const next = prev.filter((i) => i.slug !== slug);
        saveRefs(next);
        return next;
      });
      if (activeSlug === slug) setActiveSlugState(null);
    },
    [activeSlug]
  );

  const deleteInboxEverywhere = useCallback(
    async (slug: string) => {
      try {
        await fetch(`/api/webhook-inbox/${slug}`, { method: "DELETE" });
      } catch {
        /* still forget it locally even if the network call failed — best effort */
      }
      removeInboxLocally(slug);
    },
    [removeInboxLocally]
  );

  const clearRequests = useCallback(async (slug: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/webhook-inbox/${slug}/requests`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}) as Record<string, unknown>);
      if (!res.ok || data.error) throw new Error((data.error as string) || `Request failed (${res.status})`);
      setRequests([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't clear requests.");
    }
  }, []);

  return (
    <WebhookInboxContext.Provider
      value={{
        configured,
        inboxes,
        activeInbox,
        activeSlug,
        setActiveSlug,
        requests,
        loadingRequests,
        creating,
        error,
        createInbox,
        removeInboxLocally,
        deleteInboxEverywhere,
        clearRequests,
      }}
    >
      {children}
    </WebhookInboxContext.Provider>
  );
}

export function useWebhookInbox() {
  const ctx = useContext(WebhookInboxContext);
  if (!ctx) throw new Error("useWebhookInbox must be used within WebhookInboxProvider");
  return ctx;
}
