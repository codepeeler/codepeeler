"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Check, Sparkles, Rocket, CreditCard, ShieldCheck, LifeBuoy } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCheckout } from "@/hooks/use-checkout";
import { useToast } from "@/providers/toast-provider";
import {
  PLANS,
  COMPARE_ROWS,
  PRICING_BADGES,
  PRICING_FAQ,
  type Plan,
  type BillingCycle,
} from "@/lib/data/pricing";

function BillingToggle({ cycle, onChange }: { cycle: BillingCycle; onChange: (c: BillingCycle) => void }) {
  return (
    <div className="inline-flex rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-1">
      {(["monthly", "yearly"] as const).map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`rounded-[7px] px-4 py-[7px] text-[12.5px] font-semibold capitalize transition-colors duration-150 ${
            cycle === c ? "bg-[var(--primary)] text-white" : "text-[var(--text-dim)] hover:text-[var(--text)]"
          }`}
        >
          {c}
          {c === "yearly" && (
            <span className={cycle === "yearly" ? "ml-1.5 text-white/80" : "ml-1.5 text-[var(--success)]"}>
              (Save 20%)
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function PlanCard({ plan, cycle }: { plan: Plan; cycle: BillingCycle }) {
  const { startCheckout, loading } = useCheckout();
  const { toast } = useToast();
  const price = plan.price[cycle];

  const handleCta = () => {
    if (plan.cta.type === "checkout") {
      startCheckout(cycle);
    } else if (plan.cta.type === "team") {
      toast("Team billing is coming soon — reach out and we'll set you up early");
    }
    // "signup" and "contact" render as real links below, no click handler needed.
  };

  return (
    <div
      className={`relative flex flex-col rounded-[var(--radius-lg)] border p-5 ${
        plan.badge
          ? "border-[var(--primary)] bg-[var(--card)] shadow-[var(--shadow-glow)]"
          : "border-[var(--border)] bg-[var(--card)]"
      } ${plan.comingSoon ? "opacity-55" : ""}`}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[var(--primary)] px-3 py-1 text-[11px] font-semibold text-white">
          <Sparkles size={11} /> {plan.badge}
        </span>
      )}
      {plan.comingSoon && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-[var(--border)] bg-[var(--bg-elev)] px-3 py-1 text-[11px] font-semibold text-[var(--text-dim)]">
          Coming Soon
        </span>
      )}

      <h3 className="text-[16px] font-bold">{plan.name}</h3>
      <p className="mt-0.5 text-[12px] text-[var(--text-faint)]">{plan.tagline}</p>

      <div className="mt-4">
        {price === null ? (
          <div className="font-[family-name:var(--font-display)] text-[30px] font-bold">Custom</div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="font-[family-name:var(--font-display)] text-[30px] font-bold">${price}</span>
            <span className="text-[13px] text-[var(--text-faint)]">/ month</span>
          </div>
        )}
        <p className="mt-0.5 text-[11.5px] text-[var(--text-faint)]">
          {price === null
            ? "Tailored to your needs"
            : plan.perUser
              ? `Per user, billed ${cycle}`
              : price === 0
                ? " "
                : `Billed ${cycle}`}
        </p>
      </div>

      <div className="mt-4">
        {plan.cta.type === "signup" && (
          <Button href="/signup" size="lg" variant="outline" className="w-full justify-center">
            {plan.cta.label}
          </Button>
        )}
        {plan.cta.type === "contact" && (
          <Button
            href={plan.comingSoon ? undefined : "mailto:sales@codepeeler.com"}
            disabled={plan.comingSoon}
            size="lg"
            variant="outline"
            className="w-full justify-center"
          >
            {plan.cta.label} <ChevronRight size={14} />
          </Button>
        )}
        {(plan.cta.type === "checkout" || plan.cta.type === "team") && (
          <Button onClick={handleCta} disabled={loading} size="lg" className="w-full justify-center">
            {plan.cta.label} <ChevronRight size={14} />
          </Button>
        )}
        {plan.trialDays && (
          <p className="mt-2 text-center text-[11px] text-[var(--text-faint)]">{plan.trialDays}-day free trial</p>
        )}
      </div>

      <ul className="mt-5 flex flex-1 flex-col gap-2.5 border-t border-[var(--border-soft)] pt-4">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[12.5px] text-[var(--text-dim)]">
            <Check size={14} className="mt-[1px] flex-shrink-0 text-[var(--success)]" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--border-soft)] py-3.5 last:border-0">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-left">
        <span className="text-[13px] font-semibold">{question}</span>
        <ChevronRight size={15} className={`flex-shrink-0 text-[var(--text-faint)] transition-transform duration-150 ${open ? "rotate-90" : ""}`} />
      </button>
      {open && <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--text-dim)]">{answer}</p>}
    </div>
  );
}

export default function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-7 lg:px-8 lg:py-9">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-1.5 text-[12px] text-[var(--text-faint)]">
        <Link href="/" className="hover:text-[var(--text)]">Home</Link>
        <ChevronRight size={12} />
        <span className="text-[var(--text-dim)]">Pricing</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[32px] font-bold tracking-[-0.01em] lg:text-[38px]">
            Pricing
          </h1>
          <p className="mt-1.5 max-w-[420px] text-[13.5px] text-[var(--text-dim)]">
            Choose the perfect plan for your workflow needs. Start for free, upgrade anytime.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {PRICING_BADGES.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-[11.5px] text-[var(--text-faint)]">
                <Icon size={13} className="text-[var(--text-dim)]" /> {label}
              </span>
            ))}
          </div>
        </div>
        <BillingToggle cycle={cycle} onChange={setCycle} />
      </div>

      {/* Plan cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => (
          <PlanCard key={plan.key} plan={plan} cycle={cycle} />
        ))}
      </div>

      {/* Compare table + FAQ */}
      <div className="mt-12 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_360px]">
        <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)]">
          <table className="w-full min-w-[560px] border-collapse text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-elev)]">
                <th className="px-4 py-3 font-semibold text-[var(--text-dim)]">Compare Plans</th>
                {PLANS.map((p) => (
                  <th key={p.key} className={`px-4 py-3 font-semibold ${p.key === "pro" ? "text-[var(--primary)]" : "text-[var(--text-dim)]"}`}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.label} className="border-b border-[var(--border-soft)] last:border-0">
                  <td className="px-4 py-3 text-[var(--text-dim)]">{row.label}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className="px-4 py-3 text-[var(--text)]">
                      {v === "✓" ? <Check size={14} className="text-[var(--success)]" /> : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="mb-1 text-[15px] font-bold">Frequently Asked Questions</h2>
          {PRICING_FAQ.map((f) => (
            <FaqItem key={f.question} {...f} />
          ))}
        </div>
      </div>

      {/* Bottom strip */}
      <div className="mt-12 grid grid-cols-1 gap-6 border-t border-[var(--border-soft)] pt-8 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Rocket, title: "Start Free", desc: "Explore CodePeeler with our free plan. No credit card required." },
          { icon: CreditCard, title: "Upgrade Anytime", desc: "Unlock more power when you need it. Upgrade in one click." },
          { icon: ShieldCheck, title: "Secure & Private", desc: "Your data is encrypted and never shared with anyone." },
          { icon: LifeBuoy, title: "We're Here to Help", desc: "Our team is always ready to support your success." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--primary-dim)] text-[var(--primary)]">
              <Icon size={16} />
            </div>
            <div>
              <p className="text-[13px] font-semibold">{title}</p>
              <p className="mt-0.5 text-[12px] leading-snug text-[var(--text-faint)]">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
