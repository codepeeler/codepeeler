"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useCommandPalette } from "@/providers/command-palette-provider";
import { useToast } from "@/providers/toast-provider";
import { useTheme } from "next-themes";
import { TOOLS } from "@/lib/data/tools";
import CategoryBadge from "@/components/ui/CategoryBadge";

type CmdItem = {
  group: "Tools" | "Commands";
  label: string;
  badge: string;
  cat: "data" | "encode" | "gen" | "web" | "image" | "sec";
  shortcut?: string;
  action: () => void;
};

export default function CommandPalette() {
  const { isOpen, close } = useCommandPalette();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items: CmdItem[] = useMemo(
    () => [
      ...TOOLS.map((t) => ({
        group: "Tools" as const,
        label: t.name,
        badge: t.badge,
        cat: t.cat,
        action: () => {
          if (t.page) router.push(t.page);
          else toast(`${t.name} is coming soon`);
        },
      })),
      {
        group: "Commands" as const,
        label: "Toggle theme",
        badge: "⌘",
        cat: "web" as const,
        shortcut: "⌘ J",
        action: () => setTheme(theme === "dark" ? "light" : "dark"),
      },
      {
        group: "Commands" as const,
        label: "Open workspace",
        badge: "→",
        cat: "gen" as const,
        action: () => router.push("/workspace"),
      },
    ],
    [theme, router, toast, setTheme]
  );

  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  useEffect(() => setActive(0), [query]);

  const selectItem = (idx: number) => {
    const item = filtered[idx];
    if (!item) return;
    close();
    item.action();
  };

  if (!isOpen) return null;

  let lastGroup = "";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-[rgba(5,5,7,0.6)] pt-[12vh] backdrop-blur-[3px]"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-[560px] max-w-[90vw] overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--card)] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center gap-2.5 border-b border-[var(--border-soft)] px-4 py-3.5 text-[var(--text-faint)]">
          <Search size={16} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, commands, collections..."
            autoComplete="off"
            className="flex-1 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)]"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, filtered.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                selectItem(active);
              }
            }}
          />
          <span className="rounded-[5px] border border-[var(--border)] bg-[var(--border-soft)] px-[5px] py-0.5 font-[family-name:var(--font-mono)] text-[10.5px] text-[var(--text-faint)]">
            esc
          </span>
        </div>

        <div className="max-h-[340px] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-[var(--text-faint)]">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
          {filtered.map((item, idx) => {
            const showGroupLabel = item.group !== lastGroup;
            lastGroup = item.group;
            return (
              <div key={`${item.group}-${item.label}`}>
                {showGroupLabel && (
                  <div className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-faint)]">
                    {item.group}
                  </div>
                )}
                <div
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => selectItem(idx)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-[9px] text-[13.5px] ${
                    active === idx ? "bg-[var(--primary-dim)]" : ""
                  }`}
                >
                  <CategoryBadge cat={item.cat} size="sm">
                    {item.badge}
                  </CategoryBadge>
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <span className="ml-auto rounded-[5px] border border-[var(--border)] bg-[var(--border-soft)] px-[5px] py-0.5 font-[family-name:var(--font-mono)] text-[10.5px] text-[var(--text-faint)]">
                      {item.shortcut}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
