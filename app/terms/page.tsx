import Link from "next/link";
import { Scale } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import MobileFooter from "@/components/layout/mobile/MobileFooter";

const SECTIONS = [
  { title: "1. Acceptance of Terms", body: "By accessing or using CodePeeler (\"the Service\"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the Service." },
  { title: "2. Description of Service", body: "CodePeeler provides developer tools and a visual workflow builder. Most tools run entirely in your browser; snippets, collections, and workflows you save are stored on our servers against your account." },
  { title: "3. User Accounts", body: "You need an account to save snippets, collections, and workflows, and to use plan-limited features. You are responsible for keeping your account credentials secure." },
  { title: "4. Acceptable Use", body: "You agree not to: use the Service for any unlawful purpose, attempt to reverse-engineer or exploit the platform, upload malicious code, or interfere with the security or performance of the Service." },
  { title: "5. Plans & Billing", body: "Free and Pro plans are described on the Pricing page. Pro subscriptions are billed via Razorpay and can be cancelled anytime from Settings; access continues until the end of the current billing period." },
  { title: "6. Data & Privacy", body: "Our handling of your data is described in the Privacy Policy, which forms part of these Terms." },
  { title: "7. Intellectual Property", body: "CodePeeler's code, design, and branding are our property. Snippets and workflows you create remain yours; community snippets you publish are visible to other signed-in users." },
  { title: "8. Disclaimers", body: "The Service is provided \"as is\" without warranties of any kind. We do not guarantee uninterrupted or error-free operation." },
  { title: "9. Limitation of Liability", body: "To the extent permitted by law, CodePeeler is not liable for indirect, incidental, or consequential damages arising from your use of the Service." },
  { title: "10. Termination", body: "We may suspend or terminate accounts that violate these Terms. You may stop using the Service and request account deletion at any time." },
  { title: "11. Changes to Terms", body: "We may update these Terms as CodePeeler evolves. Continued use after changes take effect constitutes acceptance of the updated Terms." },
];

export default function TermsPage() {
  return (
    <div className="relative flex min-h-0 flex-1">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[820px] px-6 py-7">
          <div className="mb-1 flex items-center gap-1.5 text-[12px] text-[var(--text-faint)]">
            <Link href="/">Home</Link>
            <span>›</span>
            <span className="text-[var(--text-dim)]">Terms of Service</span>
          </div>
          <h1 className="mb-1 mt-3 font-[family-name:var(--font-display)] text-[28px] font-bold tracking-[-0.01em]">
            Terms of Service
          </h1>
          <p className="mb-6 text-[12.5px] text-[var(--text-faint)]">Last updated: July 2026</p>

          <div className="mb-8 flex items-start gap-3 rounded-[12px] border border-[var(--border)] bg-[linear-gradient(160deg,var(--primary-dim),transparent)] p-4">
            <Scale size={20} className="mt-0.5 flex-shrink-0 text-[var(--primary)]" />
            <p className="text-[13px] leading-[1.6] text-[var(--text-dim)]">
              These terms govern your use of CodePeeler, the developer toolkit and workflow builder. By using the
              platform, you agree to them.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {SECTIONS.map((s) => (
              <section key={s.title}>
                <h2 className="mb-2 text-[17px] font-semibold">{s.title}</h2>
                <p className="text-[13.5px] leading-[1.7] text-[var(--text-dim)]">{s.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-9 rounded-[12px] border border-[var(--border)] p-4 text-[13px] text-[var(--text-dim)]">
            Questions about these terms? <Link href="/contact" className="font-medium text-[var(--primary)] hover:underline">Contact us</Link>.
          </div>
        </div>

        <Footer />
        <MobileFooter variant="compact" />
      </main>
    </div>
  );
}
