"use client";

import { useState } from "react";
import Link from "next/link";
import {
  X,
  Pencil,
  Plus,
  Share2,
  Download,
  Copy,
  Trash2,
  Workflow,
  Clock,
  ExternalLink,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import type { Collection } from "@/lib/data/collections";
import { TOOLS } from "@/lib/data/tools";
import CollectionIcon from "./CollectionIcon";
import CategoryBadge from "@/components/ui/CategoryBadge";
import Toggle from "@/components/ui/Toggle";

const TABS = ["Overview", "Workflows", "Tools", "Activity"] as const;

const OWNER_BADGE: Record<Collection["owner"], string> = {
  me: "My Collection",
  shared: "Shared Collection",
  public: "Public Collection",
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "var(--success)" },
  draft: { label: "Draft", color: "var(--text-faint)" },
  paused: { label: "Paused", color: "var(--warning)" },
};

export default function CollectionDetailsPanel({
  collection,
  onClose,
  onToggleAutoUpdate,
  onToggleAllowDuplicate,
  onRename,
  onDuplicate,
  onShare,
  onExport,
  onDelete,
}: {
  collection: Collection;
  onClose: () => void;
  onToggleAutoUpdate: () => void;
  onToggleAllowDuplicate: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onShare: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  const { toast } = useToast();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

  const tools = collection.toolIds
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter((t): t is (typeof TOOLS)[number] => !!t);

  return (
    <aside
      className="fixed inset-x-0 z-[45] flex flex-shrink-0 flex-col overflow-y-auto border-l border-[var(--border-soft)] bg-[var(--bg-elev)] lg:static lg:inset-auto lg:z-30 lg:w-[var(--w-inspector)]"
      style={{
        top: "calc(52px + env(safe-area-inset-top))",
        bottom: "calc(56px + env(safe-area-inset-bottom))",
      }}
    >
      <div className="sticky top-0 z-10 flex-shrink-0 bg-[var(--bg-elev)]">
        <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-4 py-3.5">
          <span className="font-[family-name:var(--font-display)] text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--text-faint)]">
            Collection Details
          </span>
          <button
            onClick={onClose}
            title="Close"
            className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-faint)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="mb-3 flex items-start gap-3">
            <CollectionIcon icon={collection.icon} color={collection.color} size="lg" />
            <div className="min-w-0 pt-0.5">
              <div className="flex items-center gap-2">
                <span className="truncate font-[family-name:var(--font-display)] text-[15px] font-semibold">
                  {collection.name}
                </span>
                <span className="flex-shrink-0 rounded-full bg-[var(--primary-dim)] px-2 py-[3px] text-[9.5px] font-semibold text-[var(--primary)]">
                  {OWNER_BADGE[collection.owner]}
                </span>
              </div>
              <div className="mt-0.5 text-[10.5px] text-[var(--text-faint)]">
                Created {collection.createdAgo} · Updated {collection.updatedAgo}
              </div>
            </div>
          </div>

          <div className="flex gap-1 border-b border-[var(--border-soft)]">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "relative px-2.5 pb-2.5 text-[12px] font-semibold transition-colors duration-150",
                  tab === t ? "text-[var(--text)]" : "text-[var(--text-faint)] hover:text-[var(--text-dim)]"
                )}
              >
                {t}
                {tab === t && (
                  <span className="absolute -bottom-px left-0 right-0 h-[2px] rounded-full bg-[var(--primary)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tab === "Overview" && (
        <div className="flex-1 px-4 pb-4">
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-faint)]">
                Description
              </span>
              <button
                onClick={() => toast("Editing description is coming soon")}
                className="flex items-center gap-1 text-[11px] font-medium text-[var(--primary)] hover:underline"
              >
                <Pencil size={11} /> Edit
              </button>
            </div>
            <p className="text-[12.5px] leading-[1.55] text-[var(--text-dim)]">{collection.desc}</p>
          </div>

          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-faint)]">
                Tags
              </span>
              <button
                onClick={() => toast("Editing tags is coming soon")}
                className="flex items-center gap-1 text-[11px] font-medium text-[var(--primary)] hover:underline"
              >
                <Pencil size={11} /> Edit
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {collection.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--border-soft)] bg-[var(--card)] px-2 py-1 text-[11px] text-[var(--text-dim)]"
                >
                  {tag}
                </span>
              ))}
              <button
                onClick={() => toast("Adding tags is coming soon")}
                className="flex items-center gap-1 rounded-full border border-dashed border-[var(--border)] px-2 py-1 text-[11px] text-[var(--text-faint)] transition-colors duration-150 hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                <Plus size={11} /> Add Tag
              </button>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-[var(--border-soft)] p-2.5 text-center">
              <div className="text-[15px] font-bold">{collection.workflows}</div>
              <div className="text-[10px] text-[var(--text-faint)]">Workflows</div>
            </div>
            <div className="rounded-lg border border-[var(--border-soft)] p-2.5 text-center">
              <div className="text-[15px] font-bold">{collection.tools}</div>
              <div className="text-[10px] text-[var(--text-faint)]">Tools</div>
            </div>
            <div className="rounded-lg border border-[var(--border-soft)] p-2.5 text-center">
              <div className="text-[15px] font-bold">{collection.dataSize}</div>
              <div className="text-[10px] text-[var(--text-faint)]">Data Size</div>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between rounded-lg border border-[var(--border-soft)] px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-[11.5px] text-[var(--text-dim)]">
              <Workflow size={13} className="text-[var(--success)]" />
              Executions
            </span>
            <b className="text-[12.5px]">{collection.executions}</b>
          </div>

          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-faint)]">
                Settings
              </span>
              <button
                onClick={() => toast("Editing settings is coming soon")}
                className="flex items-center gap-1 text-[11px] font-medium text-[var(--primary)] hover:underline"
              >
                <Pencil size={11} /> Edit
              </button>
            </div>
            <div className="space-y-2 rounded-lg border border-[var(--border-soft)] p-3 text-[11.5px]">
              <div className="flex items-center justify-between text-[var(--text-dim)]">
                <span>Visibility</span>
                <span className="font-medium text-[var(--text)]">{collection.visibility}</span>
              </div>
              <div className="flex items-center justify-between text-[var(--text-dim)]">
                <span>Share</span>
                <span className="font-medium text-[var(--text)]">
                  {collection.owner === "me" ? "Only me" : "Team"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[var(--text-dim)]">
                <span>Collection Type</span>
                <span className="font-medium text-[var(--text)]">
                  {collection.owner === "public" ? "Public" : "Personal"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[var(--text-dim)]">
                <span>Auto Update</span>
                <Toggle checked={!!collection.autoUpdate} onChange={onToggleAutoUpdate} />
              </div>
              <div className="flex items-center justify-between text-[var(--text-dim)]">
                <span>Allow Duplicate</span>
                <Toggle checked={!!collection.allowDuplicate} onChange={onToggleAllowDuplicate} />
              </div>
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-faint)]">
              Actions
            </div>
            <div className="space-y-1">
              <button
                onClick={onRename}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
              >
                <Pencil size={14} /> Rename Collection
              </button>
              <button
                onClick={onShare}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
              >
                <Share2 size={14} /> Share Collection
              </button>
              <button
                onClick={onExport}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
              >
                <Download size={14} /> Export Collection
              </button>
              <button
                onClick={onDuplicate}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
              >
                <Copy size={14} /> Duplicate Collection
              </button>
              <button
                onClick={onDelete}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] font-medium text-[var(--danger)] transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--danger)_14%,transparent)]"
              >
                <Trash2 size={14} /> Delete Collection
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "Workflows" && (
        <div className="flex-1 px-4 pb-4">
          {collection.workflowsList.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-[var(--border)] px-3 py-8 text-center text-[12px] text-[var(--text-faint)]">
              No workflows in this collection yet.
            </div>
          ) : (
            <div className="space-y-2">
              {collection.workflowsList.map((wf) => (
                <div
                  key={wf.id}
                  className="rounded-lg border border-[var(--border-soft)] p-3"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="truncate text-[12.5px] font-semibold">{wf.name}</span>
                    <span
                      className="flex flex-shrink-0 items-center gap-1 text-[10px] font-semibold"
                      style={{ color: STATUS_META[wf.status].color }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {STATUS_META[wf.status].label}
                    </span>
                  </div>
                  <div className="mb-2.5 flex items-center gap-3 text-[11px] text-[var(--text-faint)]">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {wf.lastRun}
                    </span>
                    <span>{wf.steps} steps</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toast(`Running "${wf.name}"…`)}
                      className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-[7px] bg-[var(--primary)] text-[11.5px] font-semibold text-white transition-[filter] duration-150 hover:brightness-[1.08]"
                    >
                      <Play size={12} /> Run
                    </button>
                    <Link
                      href="/workspace"
                      className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-[7px] border border-[var(--border)] text-[11.5px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:text-[var(--text)]"
                    >
                      <ExternalLink size={12} /> Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "Tools" && (
        <div className="flex-1 px-4 pb-4">
          {tools.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-[var(--border)] px-3 py-8 text-center text-[12px] text-[var(--text-faint)]">
              No tools linked to this collection yet.
            </div>
          ) : (
            <div className="space-y-2">
              {tools.map((tool) => {
                const row = (
                  <div className="flex items-center gap-2.5 rounded-lg border border-[var(--border-soft)] p-2.5 transition-colors duration-150 hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))]">
                    <CategoryBadge cat={tool.cat} size="sm">
                      {tool.badge}
                    </CategoryBadge>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-semibold">{tool.name}</div>
                      <div className="truncate text-[10.5px] text-[var(--text-faint)]">{tool.desc}</div>
                    </div>
                  </div>
                );
                return tool.page ? (
                  <Link key={tool.id} href={tool.page}>
                    {row}
                  </Link>
                ) : (
                  <button
                    key={tool.id}
                    className="w-full text-left"
                    onClick={() => toast(`${tool.name} is coming soon`)}
                  >
                    {row}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "Activity" && (
        <div className="flex-1 px-4 pb-4">
          {collection.activity.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-[var(--border)] px-3 py-8 text-center text-[12px] text-[var(--text-faint)]">
              No activity recorded yet.
            </div>
          ) : (
            <div className="space-y-3.5">
              {collection.activity.map((item, i) => (
                <div key={item.id} className="relative flex gap-2.5 pl-1">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--primary)]" />
                    {i < collection.activity.length - 1 && (
                      <span className="w-px flex-1 bg-[var(--border-soft)]" />
                    )}
                  </div>
                  <div className="pb-1">
                    <div className="text-[12px] leading-[1.5] text-[var(--text-dim)]">{item.text}</div>
                    <div className="text-[10.5px] text-[var(--text-faint)]">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </aside>
  );
}
