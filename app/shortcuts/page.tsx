import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import MobileFooter from "@/components/layout/mobile/MobileFooter";

function Keys({ keys }: { keys: string[] }) {
  return (
    <div className="flex flex-shrink-0 items-center gap-1">
      {keys.map((k, i) => (
        <span key={i} className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[11px] font-semibold text-[var(--text-dim)]">
          {k}
        </span>
      ))}
    </div>
  );
}

const GROUPS: { title: string; rows: { action: string; desc: string; keys: string[] }[] }[] = [
  {
    title: "General",
    rows: [
      { action: "Command Palette", desc: "Open command palette to search tools, workflows, and more.", keys: ["Ctrl", "K"] },
      { action: "Quick Search", desc: "Alternate shortcut for the command palette.", keys: ["Ctrl", "/"] },
      { action: "Close / Deselect", desc: "Close dialogs, or clear the current canvas selection.", keys: ["Esc"] },
    ],
  },
  {
    title: "Workflow Canvas",
    rows: [
      { action: "Undo", desc: "Undo the last change on the canvas.", keys: ["Ctrl", "Z"] },
      { action: "Redo", desc: "Redo the last undone change.", keys: ["Ctrl", "Shift", "Z"] },
      { action: "Delete Node", desc: "Delete the selected node(s).", keys: ["Delete"] },
      { action: "Zoom Canvas", desc: "Zoom in/out, centered on your cursor.", keys: ["Ctrl", "Scroll"] },
    ],
  },
  {
    title: "API Tester",
    rows: [{ action: "Send Request", desc: "Run the current request.", keys: ["Ctrl", "Enter"] }],
  },
];

export default function ShortcutsPage() {
  return (
    <div className="relative flex min-h-0 flex-1">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[900px] px-6 py-7">
          <div className="mb-1 flex items-center gap-1.5 text-[12px] text-[var(--text-faint)]">
            <Link href="/">Home</Link>
            <span>›</span>
            <span className="text-[var(--text-dim)]">Keyboard Shortcuts</span>
          </div>
          <h1 className="mb-1 mt-3 font-[family-name:var(--font-display)] text-[28px] font-bold tracking-[-0.01em]">
            Keyboard Shortcuts
          </h1>
          <p className="mb-7 text-[13.5px] text-[var(--text-dim)]">Work faster with these shortcuts across CodePeeler.</p>

          <div className="flex flex-col gap-8">
            {GROUPS.map((g) => (
              <section key={g.title}>
                <h2 className="mb-2.5 text-[15px] font-semibold">{g.title}</h2>
                <div className="overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--card)]">
                  {g.rows.map((r, i) => (
                    <div
                      key={r.action}
                      className={`flex items-center justify-between gap-4 px-4 py-3 ${i !== g.rows.length - 1 ? "border-b border-[var(--border-soft)]" : ""}`}
                    >
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium">{r.action}</div>
                        <div className="text-[11.5px] text-[var(--text-faint)]">{r.desc}</div>
                      </div>
                      <Keys keys={r.keys} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-8 text-[12px] text-[var(--text-faint)]">
            More editor-level shortcuts (per-tool) are on the roadmap — see the{" "}
            <Link href="/changelog" className="font-medium text-[var(--primary)] hover:underline">Changelog</Link> for updates.
          </p>
        </div>

        <Footer />
        <MobileFooter variant="compact" />
      </main>
    </div>
  );
}
