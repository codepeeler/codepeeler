"use client";

import { cn } from "@/lib/utils";

export default function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className={cn(
        "relative h-[18px] w-8 flex-shrink-0 rounded-full transition-colors duration-150",
        checked ? "bg-[var(--primary)]" : "bg-[var(--border)]"
      )}
    >
      <span
        className={cn(
          "absolute top-[2px] left-[2px] h-3.5 w-3.5 rounded-full bg-white transition-transform duration-150",
          checked ? "translate-x-[14px]" : "translate-x-0"
        )}
      />
    </button>
  );
}
