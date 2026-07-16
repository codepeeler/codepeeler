import Link from "next/link";
import { Layers, ShieldCheck, Share2, Globe2 } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import MobileFooter from "@/components/layout/mobile/MobileFooter";
import Button from "@/components/ui/Button";
import { TOOLS } from "@/lib/data/tools";

const VALUES = [
  { icon: Layers, title: "Developer First", desc: "Everything we build is designed to empower developers and save time." },
  { icon: ShieldCheck, title: "Privacy Focused", desc: "Your data belongs to you. Most tools run entirely in your browser." },
  { icon: Share2, title: "Open & Transparent", desc: "We believe in open communication and building in public." },
  { icon: Globe2, title: "Continuous Improvement", desc: "We listen, learn, and keep improving every single day." },
];

export default function AboutPage() {
  const toolCount = TOOLS.length;

  return (
    <div className="relative flex min-h-0 flex-1">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1100px] px-6 py-7">
          <div className="mb-1 flex items-center gap-1.5 text-[12px] text-[var(--text-faint)]">
            <Link href="/">Home</Link>
            <span>›</span>
            <span className="text-[var(--text-dim)]">About</span>
          </div>

          <h1 className="mb-3 mt-3 font-[family-name:var(--font-display)] text-[30px] font-bold tracking-[-0.01em]">
            About CodePeeler
          </h1>
          <p className="mb-6 max-w-[640px] text-[14.5px] leading-[1.6] text-[var(--text-dim)]">
            CodePeeler is an all-in-one developer toolkit and workflow builder that helps you connect, transform, and
            automate everything — without switching between a dozen tabs.
          </p>
          <div className="mb-8 flex flex-wrap gap-3">
            <Button href="/workspace">Explore Workspace</Button>
            <Button href="/docs" variant="outline">View Documentation</Button>
          </div>

          <div className="mb-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [`${toolCount}+`, "Developer Tools"],
              ["Workflow Canvas", "Drag & drop builder"],
              ["Secure & Private", "Your data stays in your browser"],
              ["24/7", "Support"],
            ].map(([big, small]) => (
              <div key={small} className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="text-[19px] font-bold">{big}</div>
                <div className="text-[11.5px] text-[var(--text-faint)]">{small}</div>
              </div>
            ))}
          </div>

          <div className="mb-9">
            <h2 className="mb-3 text-[18px] font-semibold">Our Story</h2>
            <div className="flex flex-col gap-2.5 text-[13.5px] leading-[1.7] text-[var(--text-dim)]">
              <p>CodePeeler was born from a simple frustration: as developers, we constantly switch between countless tools, copy-paste data, format JSON, encode strings, validate tokens, test APIs, and more.</p>
              <p>We thought — there has to be a better way. So we built CodePeeler: a visual developer workspace that brings essential tools together in one place and lets you connect them into powerful workflows.</p>
              <p>No code. Just drag, drop, and execute. Our mission is to save developers time, reduce context switching, and make productivity effortless.</p>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-[18px] font-semibold">Our Values</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((v) => (
                <div key={v.title} className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4">
                  <v.icon size={18} className="mb-3 text-[var(--primary)]" />
                  <div className="mb-1 text-[13.5px] font-semibold">{v.title}</div>
                  <p className="text-[12px] leading-[1.5] text-[var(--text-faint)]">{v.desc}</p>
                </div>
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
