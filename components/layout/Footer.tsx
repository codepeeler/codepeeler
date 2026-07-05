import Link from "next/link";
import Image from "next/image";
import { FOOTER_COLUMNS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mx-auto mt-[60px] max-w-[1400px] border-t border-[var(--border-soft)] px-8 pb-6 pt-10">
      <div className="flex flex-wrap gap-[60px]">
        <div>
          <Image
            src="/logo.png"
            alt="CodePeeler"
            width={130}
            height={32}
            style={{ height: "auto",width: "auto" }}
          />
        </div>

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

      <div className="mt-9 border-t border-[var(--border-soft)] pt-5 text-xs text-[var(--text-faint)]">
        © 2026 CodePeeler. Built for developers, run entirely in your browser.
      </div>
    </footer>
  );
}
