import type { LucideIcon } from "lucide-react";
import { CreditCard, Ban, ShieldCheck, Lock } from "lucide-react";

export type PlanKey = "free" | "pro" | "team" | "enterprise";
export type BillingCycle = "monthly" | "yearly";

export type Plan = {
  key: PlanKey;
  name: string;
  tagline: string;
  /** null = "Custom" pricing (Enterprise) */
  price: { monthly: number | null; yearly: number | null };
  perUser?: boolean;
  badge?: string;
  trialDays?: number;
  features: string[];
  cta: { label: string; type: "signup" | "checkout" | "team" | "contact" };
  comingSoon?: boolean;
};

export const PLANS: Plan[] = [
  {
    key: "free",
    name: "Free",
    tagline: "For beginners and hobbyists",
    price: { monthly: 0, yearly: 0 },
    features: [
      "5 Workflows",
      "All Tools — Unlimited",
      "2 Collections",
      "100 Executions / month",
      "100 MB Storage",
      "Export (JSON)",
      "Community Support",
    ],
    cta: { label: "Get Started Free", type: "signup" },
  },
  {
    key: "pro",
    name: "Pro",
    tagline: "For developers and power users",
    price: { monthly: 749, yearly: 599 },
    badge: "Most Popular",
    trialDays: 14,
    features: [
      "Unlimited Workflows",
      "All Tools Access",
      "Unlimited Collections",
      "10,000 Executions / month",
      "10 GB Storage",
      "Import / Export (All Formats)",
      "Priority Support",
      "Advanced Workflow Features",
      "Variables & Secrets",
      "Workflow Version History",
    ],
    cta: { label: "Start Pro Trial", type: "checkout" },
  },
  {
    key: "team",
    name: "Team",
    tagline: "For small teams and collaboration",
    price: { monthly: 29, yearly: 23 },
    perUser: true,
    trialDays: 14,
    features: [
      "Everything in Pro",
      "Team Workspaces",
      "Role-Based Access",
      "Shared Collections",
      "50,000 Executions / user / month",
      "100 GB Storage / user",
      "Audit Logs",
      "SSO (SAML)",
      "Priority Support",
      "Team Analytics",
    ],
    cta: { label: "Start Team Trial", type: "team" },
  },
  {
    key: "enterprise",
    name: "Enterprise",
    tagline: "For large organizations",
    price: { monthly: null, yearly: null },
    comingSoon: true,
    features: [
      "Everything in Team",
      "Unlimited Executions",
      "Unlimited Storage",
      "On-Premise Deployment",
      "Custom Tool Integration",
      "Dedicated Support",
      "SLA & Uptime Guarantee",
      "Advanced Security",
      "Private Cloud Option",
      "Custom Training",
    ],
    cta: { label: "Contact Sales", type: "contact" },
  },
];

export const COMPARE_ROWS: { label: string; values: [string, string, string, string] }[] = [
  { label: "Workflows", values: ["5", "Unlimited", "Unlimited", "Unlimited"] },
  { label: "Tools Access", values: ["All Tools", "All Tools", "All Tools", "All Tools"] },
  { label: "Executions / month", values: ["100", "10,000", "50,000 / user", "Unlimited"] },
  { label: "Storage", values: ["100 MB", "10 GB", "100 GB / user", "Unlimited"] },
  { label: "Team Collaboration", values: ["—", "—", "✓", "✓"] },
  { label: "SSO", values: ["—", "—", "✓", "✓"] },
  { label: "Priority Support", values: ["Community", "Priority", "Priority", "Dedicated"] },
  { label: "Custom Deployment", values: ["—", "—", "—", "✓"] },
];

export const PRICING_BADGES: { icon: LucideIcon; label: string }[] = [
  { icon: CreditCard, label: "No charge during your 14-day trial" },
  { icon: Ban, label: "Cancel anytime" },
  { icon: ShieldCheck, label: "14-day money back guarantee" },
  { icon: Lock, label: "Secure & Private" },
];

export const PRICING_FAQ: { question: string; answer: string }[] = [
  {
    question: "Can I upgrade or downgrade anytime?",
    answer:
      "Yes — switch plans whenever you need to. Upgrades apply immediately; downgrades take effect at the end of your current billing cycle.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer: "Every paid plan comes with a 14-day free trial. You'll authorize a payment method to start, but you're not charged until the trial ends.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "Cards, UPI, netbanking, and wallets — everything supported by Razorpay's checkout.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes. Your data is encrypted in transit and at rest, and it's never shared with third parties.",
  },
  {
    question: "Can I get a refund?",
    answer: "All paid plans are covered by a 14-day money-back guarantee — no questions asked.",
  },
];
