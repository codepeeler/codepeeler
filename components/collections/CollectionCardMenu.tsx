"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type CollectionMenuItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  danger?: boolean;
  onClick: () => void;
};

export default function CollectionCardMenu({
  items,
  triggerClassName,
}: {
  items: CollectionMenuItem[];
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
      <span
        onClick={() => setOpen((v) => !v)}
        role="button"
        title="More"
        className={cn(
          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-faint)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]",
          open && "bg-[var(--card-hover)] text-[var(--text)]",
          triggerClassName
        )}
      >
        <MoreVertical size={15} />
      </span>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-[168px] rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-1 shadow-[var(--shadow-soft)]">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-[7px] px-2.5 py-[7px] text-left text-[12px] font-medium transition-colors duration-150",
                item.danger
                  ? "text-[var(--danger)] hover:bg-[color-mix(in_srgb,var(--danger)_14%,transparent)]"
                  : "text-[var(--text-dim)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
              )}
            >
              <item.icon size={13} className="flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
