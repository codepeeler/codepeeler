import Link from "next/link";
import { Users, Code2, Clock } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import MobileFooter from "@/components/layout/mobile/MobileFooter";
import Button from "@/components/ui/Button";

export default function CommunityPage() {
  return (
    <div className="relative flex min-h-0 flex-1">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[760px] px-6 py-7">
          <div className="mb-1 flex items-center gap-1.5 text-[12px] text-[var(--text-faint)]">
            <Link href="/">Home</Link>
            <span>›</span>
            <span className="text-[var(--text-dim)]">Community</span>
          </div>

          <div className="mt-3 rounded-[16px] border border-[var(--border)] bg-[linear-gradient(160deg,var(--primary-dim),transparent)] p-7 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[color-mix(in_srgb,var(--primary)_16%,transparent)] text-[var(--primary)]">
              <Users size={22} />
            </div>
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.04em] text-[var(--text-faint)]">
              <Clock size={11} /> Coming Soon
            </span>
            <h1 className="mb-2 font-[family-name:var(--font-display)] text-[24px] font-bold tracking-[-0.01em]">
              A dedicated space for the CodePeeler community
            </h1>
            <p className="mx-auto mb-5 max-w-[440px] text-[13.5px] leading-[1.6] text-[var(--text-dim)]">
              Shared workflow feeds, discussions, and a contributor leaderboard are on the roadmap. In the meantime,
              the community-facing feature that&apos;s live today is Snippets.
            </p>
            <Button href="/snippets">
              <Code2 size={14} /> Browse Community Snippets
            </Button>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              ["Workflow Sharing", "Publish and discover community workflows"],
              ["Discussions", "Ask questions, share ideas"],
              ["Leaderboard", "Top contributors, recognized"],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-[12px] border border-dashed border-[var(--border)] p-4">
                <div className="mb-1 text-[12.5px] font-semibold text-[var(--text-dim)]">{title}</div>
                <div className="text-[11.5px] text-[var(--text-faint)]">{desc}</div>
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
