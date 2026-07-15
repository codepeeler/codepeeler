"use client";

import { Eye, Play, Star, Bookmark, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import CopyButton from "@/components/tools/CopyButton";
import { LANGUAGE_COLOR, type Snippet } from "@/lib/data/snippets";

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${n}`;
}

export default function SnippetCard({
  snippet,
  onOpen,
  onToggleBookmark,
  onUse,
  onEdit,
  onDelete,
}: {
  snippet: Snippet;
  onOpen: () => void;
  onToggleBookmark: () => void;
  onUse?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const s = snippet;
  const color = LANGUAGE_COLOR[s.language];
  const lines = s.code.split("\n");

  return (
    <div className="flex flex-col rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] hover:shadow-[var(--shadow-soft)]">
      <div className="mb-1 flex items-start justify-between gap-2">
        <button
          onClick={onOpen}
          className="text-left text-[14.5px] font-semibold leading-tight hover:text-[var(--primary)]"
        >
          {s.title}
        </button>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          {s.mine && onEdit && (
            <button
              onClick={onEdit}
              title="Edit snippet"
              className="text-[var(--text-faint)] transition-colors duration-150 hover:text-[var(--primary)]"
            >
              <Pencil size={13} />
            </button>
          )}
          {s.mine && onDelete && (
            <button
              onClick={onDelete}
              title="Delete snippet"
              className="text-[var(--text-faint)] transition-colors duration-150 hover:text-[var(--danger)]"
            >
              <Trash2 size={13} />
            </button>
          )}
          <span
            className="rounded-full border px-2 py-0.5 text-[10.5px] font-semibold"
            style={{
              color,
              borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
              background: `color-mix(in srgb, ${color} 14%, transparent)`,
            }}
          >
            {s.language}
          </span>
        </div>
      </div>

      <p className="mb-3 text-[12px] leading-[1.5] text-[var(--text-faint)]">{s.desc}</p>

      <div className="relative mb-3 overflow-hidden rounded-[9px] border border-[var(--border-soft)] bg-[var(--bg)]">
        <div className="absolute right-2 top-2 z-10" onClickCapture={onUse}>
          <CopyButton value={s.code} />
        </div>
        <pre className="max-h-[168px] overflow-hidden px-3.5 py-3 font-[family-name:var(--font-mono)] text-[11.5px] leading-[1.7] text-[var(--text-dim)]">
          <code>
            {lines.slice(0, 8).map((line, i) => (
              <div key={i} className="flex gap-3">
                <span className="w-4 flex-shrink-0 select-none text-right text-[var(--text-faint)]">{i + 1}</span>
                <span className="whitespace-pre">{line || " "}</span>
              </div>
            ))}
          </code>
        </pre>
        {lines.length > 8 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[var(--bg)] to-transparent" />
        )}
      </div>

      <div className="flex items-center justify-between text-[11.5px] text-[var(--text-faint)]">
        <span className="truncate font-medium text-[var(--text-dim)]">@{s.author}</span>
        <div className="flex flex-shrink-0 items-center gap-3">
          <span className="flex items-center gap-1" title="Views">
            <Eye size={12} /> {formatCount(s.views)}
          </span>
          <span className="flex items-center gap-1" title="Uses">
            <Play size={12} /> {formatCount(s.uses)}
          </span>
          <span className="flex items-center gap-1" title="Rating">
            <Star size={12} className="fill-[var(--warning)] text-[var(--warning)]" /> {s.rating || "—"}
          </span>
          <button
            onClick={onToggleBookmark}
            title="Bookmark"
            className={cn(
              "flex items-center transition-colors duration-150",
              s.bookmarked ? "text-[var(--primary)]" : "text-[var(--text-faint)] hover:text-[var(--text)]"
            )}
          >
            <Bookmark size={13} className={s.bookmarked ? "fill-[var(--primary)]" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}
