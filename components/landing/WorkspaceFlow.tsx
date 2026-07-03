import Link from "next/link";
import { FLOW } from "@/lib/data/tools";
import CategoryBadge from "@/components/ui/CategoryBadge";

export default function WorkspaceFlow() {
  return (
    <section id="workspace-flow" className="mx-auto max-w-[1400px] px-8 pt-11">
      <div className="mb-[18px] flex flex-wrap items-baseline justify-between gap-2.5">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.01em]">
            Chain tools into a workspace
          </h2>
          <p className="mt-1 text-[13.5px] text-[var(--text-dim)]">
            Output from one tool becomes input for the next — build a workflow
            once, reuse it every time.
          </p>
        </div>
        <Link
          href="/workspace"
          className="flex items-center gap-1 text-[13px] font-medium text-[var(--primary)]"
        >
          Open the workspace →
        </Link>
      </div>

      <div className="flex items-center justify-between gap-1.5 overflow-x-auto rounded-[18px] border border-[var(--border-soft)] bg-[var(--bg-elev)] px-6 py-8">
        {FLOW.map((step, idx) => (
          <div key={step.label} className="flex items-center">
            <div className="flex min-w-[88px] flex-shrink-0 flex-col items-center gap-2">
              <CategoryBadge cat={step.cat} size="lg">
                {step.badge}
              </CategoryBadge>
              <div className="text-center text-xs font-semibold">{step.label}</div>
              <div className="max-w-[100px] text-center text-[10.5px] leading-[1.3] text-[var(--text-faint)]">
                {step.hint}
              </div>
            </div>
            {idx < FLOW.length - 1 && (
              <div className="relative mx-2 h-0.5 w-10 flex-shrink-0">
                <div className="absolute inset-y-0 left-0 right-[14px] h-0.5 -translate-y-1/2 bg-[repeating-linear-gradient(90deg,var(--primary)_0_6px,transparent_6px_12px)]" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
