import Link from "next/link";
import Image from "next/image";
import { FOOTER_COLUMNS } from "@/lib/constants";

type MobileFooterProps = {
  /**
   * "full" — logo + all three link columns + copyright, for pages that are
   * a destination in their own right (landing page, All Tools, Collections,
   * Snippets).
   * "compact" — a single slim line (copyright left, Terms/Privacy right),
   * for individual tool pages and the API Tester, where a full footer block
   * would just push the actual tool further down for no benefit — those
   * pages are utilities the person is actively using, not pages to browse.
   */
  variant?: "full" | "compact";
};

/**
 * Mobile-only footer. The desktop `Footer` puts the logo and three link
 * columns in one wide `justify-between` row with generous 60px gaps —
 * fine at desktop widths, but on a phone the columns wrap unpredictably
 * and fight for the same line as a full-size logo, producing a cramped,
 * uneven block. This is a separate, from-scratch mobile layout rather than
 * a set of responsive overrides on the desktop version, so each stays
 * simple: desktop's `Footer` is untouched, and `AppShell` swaps between
 * them by breakpoint (`hidden lg:block` here, `hidden lg:hidden`-equivalent
 * there, mirroring the header/nav split already used site-wide).
 *
 * Visual hierarchy, largest to smallest (full variant):
 *   1. Logo — small but still the single largest/heaviest element, sitting
 *      alone on its own line so it reads as the brand anchor, not just
 *      another column.
 *   2. The three link columns (Product / Resources / Company) — laid out
 *      as one even 3-column grid so all three sit on the same visual row
 *      as requested, each column's title slightly bolder/darker than its
 *      links to keep scanning easy without competing with the logo.
 *   3. Copyright line — smallest, faintest, last.
 */
export default function MobileFooter({ variant = "full" }: MobileFooterProps) {
  if (variant === "compact") {
    return (
      <footer
        className="mt-4 flex w-full flex-shrink-0 items-center justify-between gap-3 border-t border-[var(--border-soft)] px-4 py-3 lg:hidden"
        style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
      >
        <span className="truncate text-[11px] text-[var(--text-faint)]">
          © 2026 CodePeeler. All rights reserved.
        </span>
        <div className="flex flex-shrink-0 items-center gap-3">
          <Link
            href="/terms"
            className="text-[11px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:text-[var(--text)]"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-[11px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:text-[var(--text)]"
          >
            Privacy
          </Link>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-10 w-full flex-shrink-0 border-t border-[var(--border-soft)] px-4 pb-6 pt-7 lg:hidden">
      <Image
        src="/logo.png"
        alt="CodePeeler"
        width={110}
        height={52}
        className="logo-img mb-6 h-auto w-auto"
      />

      <div className="grid grid-cols-3 gap-x-3 gap-y-6">
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title} className="flex flex-col gap-2 min-w-0">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-[var(--text-faint)]">
              {col.title}
            </div>
            <div className="flex flex-col gap-[7px]">
              {col.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="truncate text-[12.5px] text-[var(--text-dim)] transition-colors duration-150 hover:text-[var(--text)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-7 border-t border-[var(--border-soft)] pt-4 text-[10.5px] leading-[1.5] text-[var(--text-faint)]">
        © 2026 CodePeeler. Built for developers, run entirely in your browser.
      </div>
    </footer>
  );
}
