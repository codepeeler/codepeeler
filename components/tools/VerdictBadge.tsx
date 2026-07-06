import { cn } from "@/lib/utils";

type VerdictBadgeProps = {
  pass: boolean;
  passLabel: string;
  failLabel: string;
};

/** The single colored pass/fail pill reused by every validator-style tool (palindrome, anagram, future checkers). */
export default function VerdictBadge({ pass, passLabel, failLabel }: VerdictBadgeProps) {
  return (
    <span
      className={cn(
        "rounded-[7px] px-3 py-1.5 text-[13px] font-semibold text-white",
        pass ? "bg-[var(--success)]" : "bg-[var(--danger)]"
      )}
    >
      {pass ? passLabel : failLabel}
    </span>
  );
}
