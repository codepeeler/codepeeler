"use client";

import { Star, Workflow, Wrench, FolderOpen, Pencil, Copy, Share2, Download, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Collection } from "@/lib/data/collections";
import CollectionIcon from "./CollectionIcon";
import CollectionCardMenu, { type CollectionMenuItem } from "./CollectionCardMenu";

export default function CollectionCard({
  collection,
  selected,
  view = "grid",
  onSelect,
  onToggleStar,
  onRename,
  onDuplicate,
  onShare,
  onExport,
  onDelete,
}: {
  collection: Collection;
  selected: boolean;
  view?: "grid" | "list";
  onSelect: () => void;
  onToggleStar: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onShare: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  const c = collection;

  const menuItems: CollectionMenuItem[] = [
    { key: "open", label: "Open Collection", icon: FolderOpen, onClick: onSelect },
    { key: "rename", label: "Rename", icon: Pencil, onClick: onRename },
    { key: "duplicate", label: "Duplicate", icon: Copy, onClick: onDuplicate },
    { key: "share", label: "Share", icon: Share2, onClick: onShare },
    { key: "export", label: "Export", icon: Download, onClick: onExport },
    { key: "delete", label: "Delete", icon: Trash2, danger: true, onClick: onDelete },
  ];

  if (view === "list") {
    return (
      <div
        role="button"
        onClick={onSelect}
        className={cn(
          "flex w-full cursor-pointer items-center gap-3.5 rounded-[12px] border bg-[var(--card)] p-3.5 text-left transition-all duration-150 hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] hover:shadow-[var(--shadow-soft)]",
          selected ? "border-[var(--primary)] shadow-[var(--shadow-glow)]" : "border-[var(--border)]"
        )}
      >
        <CollectionIcon icon={c.icon} color={c.color} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13.5px] font-semibold">{c.name}</span>
            {c.starred && <Star size={12} className="flex-shrink-0 fill-[var(--warning)] text-[var(--warning)]" />}
          </div>
          <div className="truncate text-[11.5px] text-[var(--text-faint)]">{c.desc}</div>
        </div>
        <div className="hidden flex-shrink-0 items-center gap-4 text-[11.5px] text-[var(--text-dim)] sm:flex">
          <span className="flex items-center gap-1.5">
            <Workflow size={13} className="text-[var(--text-faint)]" />
            {c.workflows} workflows
          </span>
          <span className="flex items-center gap-1.5">
            <Wrench size={13} className="text-[var(--text-faint)]" />
            {c.tools} tools
          </span>
        </div>
        <span
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar();
          }}
          role="button"
          title="Toggle favorite"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-faint)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--warning)]"
        >
          <Star size={14} className={c.starred ? "fill-[var(--warning)] text-[var(--warning)]" : ""} />
        </span>
        <CollectionCardMenu items={menuItems} />
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      role="button"
      className={cn(
        "group relative flex h-full cursor-pointer flex-col gap-3 rounded-[12px] border bg-[var(--card)] p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] hover:shadow-[var(--shadow-soft)]",
        selected ? "border-[var(--primary)] shadow-[var(--shadow-glow)]" : "border-[var(--border)]"
      )}
    >
      <div className="flex items-start justify-between">
        <CollectionIcon icon={c.icon} color={c.color} size="md" />
        <div className="flex items-center gap-0.5">
          <span
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar();
            }}
            role="button"
            title="Toggle favorite"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-faint)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--warning)]"
          >
            <Star size={15} className={c.starred ? "fill-[var(--warning)] text-[var(--warning)]" : ""} />
          </span>
          <CollectionCardMenu items={menuItems} triggerClassName="opacity-0 group-hover:opacity-100" />
        </div>
      </div>

      <div className="flex-1">
        <div className="mb-1 text-[14.5px] font-semibold leading-tight">{c.name}</div>
        <p className="line-clamp-2 text-[12px] leading-[1.5] text-[var(--text-faint)]">{c.desc}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {c.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-[8px] border border-[var(--border-soft)] bg-[var(--bg)] px-2 py-0.5 text-[10.5px] text-[var(--text-dim)]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border-soft)] pt-3 text-[11.5px] text-[var(--text-faint)]">
        <span className="flex items-center gap-1.5">
          <Workflow size={13} />
          {c.workflows} workflows
        </span>
        <span className="flex items-center gap-1.5">
          <Wrench size={13} />
          {c.tools} tools
        </span>
      </div>
    </div>
  );
}
