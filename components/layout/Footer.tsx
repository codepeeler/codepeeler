import Link from "next/link";
import Image from "next/image";
import { FOOTER_COLUMNS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mx-auto mt-[60px] w-full max-w-[1400px] flex-shrink-0 border-t border-[var(--border-soft)] px-8 pb-6 pt-10">
      <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-8">
        <div>
          <Image
            src="/logo.png"
            alt="CodePeeler"
            width={170}
            height={80}
            className="logo-img h-auto w-auto"
          />
        </div>

        <div className="flex flex-1 flex-wrap justify-end gap-x-[60px] gap-y-8">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-2">
              <div className="mb-1 text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-faint)]">
                {col.title}
              </div>
              {col.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] text-[var(--text-dim)] transition-colors duration-150 hover:text-[var(--text)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-9 border-t border-[var(--border-soft)] pt-5 text-xs text-[var(--text-faint)]">
        © 2026 CodePeeler. Built for developers, run entirely in your browser.
      </div>
    </footer>
  );
}
