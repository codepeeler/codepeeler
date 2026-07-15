import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import MobileFooter from "@/components/layout/mobile/MobileFooter";

const ENTRIES = [
  {
    date: "July 2026",
    title: "Recent Activity timeline",
    items: [
      "Dashboard and admin panel now show a real, chronological activity feed — tools used, snippets created/viewed, collections and workflows created/updated.",
    ],
  },
  {
    date: "July 2026",
    title: "Real usage tracking",
    items: [
      "Per-tool usage is now tracked against your account (not just your browser), powering a real \"Favorite Tools\" list on your dashboard.",
      "Admin panel shows real per-user plan, usage, and content counts instead of placeholder data.",
    ],
  },
  {
    date: "June 2026",
    title: "Community Snippets",
    items: ["Save, bookmark, and share code snippets with the community. Track views, uses, and ratings."],
  },
  {
    date: "June 2026",
    title: "Pro plan & billing",
    items: ["Introduced the Pro plan with Razorpay checkout, higher execution limits, and unlimited workflows/collections."],
  },
];

export default function ChangelogPage() {
  return (
    <div className="relative flex min-h-0 flex-1">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[760px] px-6 py-7">
          <div className="mb-1 flex items-center gap-1.5 text-[12px] text-[var(--text-faint)]">
            <Link href="/">Home</Link>
            <span>›</span>
            <span className="text-[var(--text-dim)]">Changelog</span>
          </div>
          <h1 className="mb-1 mt-3 font-[family-name:var(--font-display)] text-[28px] font-bold tracking-[-0.01em]">
            Changelog
          </h1>
          <p className="mb-8 text-[13.5px] text-[var(--text-dim)]">What&apos;s new in CodePeeler.</p>

          <div className="flex flex-col">
            {ENTRIES.map((e, i) => (
              <div key={i} className="relative border-l border-[var(--border-soft)] pb-8 pl-6 last:pb-0">
                <span className="absolute -left-[5px] top-1 h-[9px] w-[9px] rounded-full bg-[var(--primary)]" />
                <div className="mb-1 text-[11.5px] font-semibold uppercase tracking-[0.04em] text-[var(--text-faint)]">{e.date}</div>
                <h2 className="mb-2 text-[15px] font-semibold">{e.title}</h2>
                <ul className="flex flex-col gap-1.5">
                  {e.items.map((it, j) => (
                    <li key={j} className="text-[13px] leading-[1.6] text-[var(--text-dim)]">
                      • {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Footer />
        <MobileFooter variant="compact" />
      </main>
    </div>
  );
}
