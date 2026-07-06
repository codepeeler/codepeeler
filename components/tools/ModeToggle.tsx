import { cn } from "@/lib/utils";

export type ModeOption = { value: string; label: string };

type ModeToggleProps = {
  options: ModeOption[];
  value: string;
  onChange: (value: string) => void;
};

/** The single segmented pill-toggle component used for every mode switch (Encode/Decode, Format/Minify, tabs, etc). */
export default function ModeToggle({ options, value, onChange }: ModeToggleProps) {
  return (
    <div className="flex rounded-[8px] border border-[var(--border)] bg-[var(--card)] p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-[6px] px-3 py-1.5 text-[12.5px] font-semibold transition-colors duration-150",
            value === o.value ? "bg-[var(--primary)] text-white" : "text-[var(--text-dim)] hover:text-[var(--text)]"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
