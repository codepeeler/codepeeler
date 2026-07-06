import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "md" | "lg";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** If provided, renders as a Next.js Link (navigation) instead of a <button> (action). */
  href?: string;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-[var(--primary)] text-white hover:brightness-[1.08]",
  outline:
    "border border-[var(--border)] bg-[var(--card)] text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)]",
  ghost: "text-[var(--text-dim)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  // Utility size — used across tool pages (Clear / Copy / Convert / Generate...)
  md: "rounded-[7px] px-3.5 py-[7px] text-[12.5px] font-semibold gap-1.5",
  // Marketing CTA size — used on the homepage and other promotional sections
  lg: "rounded-[9px] px-5 py-[11px] text-sm font-semibold gap-[7px] hover:-translate-y-px hover:shadow-[var(--shadow-glow)]",
};

/**
 * The single Button component for the entire site. Every clickable action —
 * from a tool's "Convert" button to the homepage's "Explore tools" CTA —
 * renders through this component so variants and sizes only exist in one place.
 */
export default function Button({ children, onClick, disabled, className, variant = "primary", size = "md", href }: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
