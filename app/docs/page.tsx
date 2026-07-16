import Link from "next/link";
import { Wrench, Workflow, Layers, Code2, Rocket } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import MobileFooter from "@/components/layout/mobile/MobileFooter";
import Button from "@/components/ui/Button";
import { TOOLS } from "@/lib/data/tools";

const FEATURES = [
  { icon: Wrench, title: `${TOOLS.length}+ Tools`, desc: "For every developer use case", href: "/tools" },
  { icon: Workflow, title: "Visual Workflows", desc: "Drag, drop, and connect tools", href: "/workspace" },
  { icon: Layers, title: "Collections", desc: "Organize tools and workflows together", href: "/collections" },
  { icon: Code2, title: "Snippets", desc: "Save and share reusable code", href: "/snippets" },
];

const TOPICS = [
  "Quick Start",
  "Core Concepts",
  "Workspace Overview",
  "Import & Export",
  "Sharing Workflows",
  "Error Handling",
];

export default function DocsPage() {
  return (
    <div className="relative flex min-h-0 flex-1">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1000px] px-6 py-7">
          <div className="mb-1 flex items-center gap-1.5 text-[12px] text-[var(--text-faint)]">
            <Link href="/">Home</Link>
            <span>›</span>
            <span className="text-[var(--text-dim)]">Documentation</span>
          </div>
          <h1 className="mb-2 mt-3 font-[family-name:var(--font-display)] text-[28px] font-bold tracking-[-0.01em]">
            Documentation
          </h1>
          <p className="mb-7 max-w-[560px] text-[13.5px] leading-[1.6] text-[var(--text-dim)]">
            CodePeeler helps you build, run, and manage powerful workflows using {TOOLS.length}+ developer tools. No
            code — just drag, drop, and execute.
          </p>

          <div className="mb-9 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4 transition-colors duration-150 hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))]"
              >
                <f.icon size={17} className="mb-2.5 text-[var(--primary)]" />
                <div className="mb-0.5 text-[13px] font-semibold">{f.title}</div>
                <div className="text-[11.5px] text-[var(--text-faint)]">{f.desc}</div>
              </Link>
            ))}
          </div>

          <div className="mb-9 rounded-[14px] border border-[var(--border)] bg-[linear-gradient(160deg,var(--primary-dim),transparent)] p-5">
            <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold">
              <Rocket size={16} className="text-[var(--primary)]" /> Ready to get started?
            </div>
            <p className="mb-3 text-[13px] text-[var(--text-dim)]">Create your first workflow in less than a minute.</p>
            <Button href="/workspace">Create New Workflow</Button>
          </div>

          <div>
            <h2 className="mb-3 text-[16px] font-semibold">More Topics</h2>
            <p className="mb-3 text-[12.5px] text-[var(--text-faint)]">
              In-depth guides for each topic below are still being written — for now, the linked pages above cover
              the core workflow.
            </p>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <span
                  key={t}
                  className="rounded-[8px] border border-dashed border-[var(--border)] px-3 py-1.5 text-[11.5px] text-[var(--text-faint)]"
                  title="Coming soon"
                >
                  {t} · Coming soon
                </span>
              ))}
            </div>
          </div>
        </div>

        <Footer />
        <MobileFooter variant="compact" />
      </main>
    </div>
  );
}
