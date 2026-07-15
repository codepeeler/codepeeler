import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import MobileFooter from "@/components/layout/mobile/MobileFooter";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: (
      <>
        <p>When you create a CodePeeler account we store your name, email address, and authentication details. Snippets, collections, and workflows you save are stored against your account so they sync across devices.</p>
        <p>Tool inputs/outputs on individual tool pages (JSON formatting, JWT decoding, etc.) are processed entirely in your browser and are never sent to our servers unless you explicitly save them as a snippet or run them inside a workflow.</p>
      </>
    ),
  },
  {
    title: "2. How We Use Your Data",
    body: <p>Account data is used to authenticate you, sync your workspace across devices, and enforce plan limits (e.g. executions/month). We do not sell your data or share it with advertisers.</p>,
  },
  {
    title: "3. Data Storage",
    body: <p>Account data, snippets, collections, and workflows are stored in our database (hosted on Neon/Postgres). Some preferences (theme, recently used tools) are kept in your browser&apos;s local storage.</p>,
  },
  {
    title: "4. Cookies",
    body: <p>We use only essential cookies required for authentication (keeping you signed in). We do not use third-party advertising or tracking cookies.</p>,
  },
  {
    title: "5. Third-Party Services",
    body: <p>Billing is processed by Razorpay; we don&apos;t store your card details. Avatar uploads are stored on Cloudflare R2. Neither is used for tracking or advertising purposes.</p>,
  },
  {
    title: "6. Your Rights",
    body: <p>You can update your profile at any time from Settings, and request account deletion by contacting us — see the Contact page.</p>,
  },
  {
    title: "7. Changes to This Policy",
    body: <p>We may update this policy as CodePeeler evolves. Material changes will be reflected here with an updated date.</p>,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="relative flex min-h-0 flex-1">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[820px] px-6 py-7">
          <div className="mb-1 flex items-center gap-1.5 text-[12px] text-[var(--text-faint)]">
            <Link href="/">Home</Link>
            <span>›</span>
            <span className="text-[var(--text-dim)]">Privacy Policy</span>
          </div>
          <h1 className="mb-1 mt-3 font-[family-name:var(--font-display)] text-[28px] font-bold tracking-[-0.01em]">
            Privacy Policy
          </h1>
          <p className="mb-6 text-[12.5px] text-[var(--text-faint)]">Last updated: July 2026</p>

          <div className="mb-8 flex items-start gap-3 rounded-[12px] border border-[var(--border)] bg-[linear-gradient(160deg,var(--primary-dim),transparent)] p-4">
            <ShieldCheck size={20} className="mt-0.5 flex-shrink-0 text-[var(--primary)]" />
            <p className="text-[13px] leading-[1.6] text-[var(--text-dim)]">
              CodePeeler is built privacy-first — most tools run entirely in your browser. This page explains
              exactly what we do (and don&apos;t) collect once you create an account.
            </p>
          </div>

          <div className="flex flex-col gap-7">
            {SECTIONS.map((s) => (
              <section key={s.title}>
                <h2 className="mb-2 text-[17px] font-semibold">{s.title}</h2>
                <div className="flex flex-col gap-2 text-[13.5px] leading-[1.7] text-[var(--text-dim)]">{s.body}</div>
              </section>
            ))}
          </div>

          <div className="mt-9 rounded-[12px] border border-[var(--border)] p-4 text-[13px] text-[var(--text-dim)]">
            Questions about this policy? <Link href="/contact" className="font-medium text-[var(--primary)] hover:underline">Contact us</Link>.
          </div>
        </div>

        <Footer />
        <MobileFooter variant="compact" />
      </main>
    </div>
  );
}
