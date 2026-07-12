"use client";

import Link from "next/link";
import { Zap, ShieldCheck, Cloud, Star } from "lucide-react";
import Logo from "@/components/core/Logo";
import SignupFormCard from "@/components/auth/SignupFormCard";
import { useSignupForm } from "@/hooks/use-signup-form";

const FEATURES = [
  { icon: Zap, title: "Build Workflows", desc: "Connect 150+ tools visually", color: "var(--primary)" },
  { icon: ShieldCheck, title: "Secure & Private", desc: "Your data stays in your browser", color: "var(--success)" },
  { icon: Cloud, title: "Work Anywhere", desc: "All in your browser, always synced", color: "var(--secondary)" },
];

const AVATAR_LETTERS = ["A", "R", "S"];

export default function DesktopSignupView() {
  const form = useSignupForm();

  return (
    <div className="grid min-h-screen grid-cols-[1.1fr_1fr] bg-[var(--bg)] text-[var(--text)]">
      <div className="relative flex flex-col justify-between overflow-hidden bg-[var(--bg-elev)] px-14 py-10">
        <div>
          <Logo width={150} height={40} />

          <div className="mt-10 inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[11.5px] font-semibold text-[var(--primary)]">
            <Star size={12} className="fill-[var(--primary)]" /> Developer Toolkit &amp; Workflow Builder
          </div>

          <h1 className="mt-5 font-[family-name:var(--font-display)] text-[40px] font-bold leading-[1.1] tracking-[-0.02em]">
            Start building
            <br />
            <span className="bg-[linear-gradient(100deg,var(--primary),var(--secondary))] bg-clip-text text-transparent">
              in minutes
            </span>
          </h1>
          <p className="mt-4 max-w-[420px] text-[14.5px] leading-[1.6] text-[var(--text-dim)]">
            Create your free account and get access to workspaces, workflows, and powerful developer tools.
          </p>

          <div className="mt-8 flex flex-col gap-3.5">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px]"
                  style={{ color, background: `color-mix(in srgb, ${color} 16%, transparent)` }}
                >
                  <Icon size={17} />
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold">{title}</div>
                  <div className="text-[12px] text-[var(--text-faint)]">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {AVATAR_LETTERS.map((l, i) => (
              <div
                key={i}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--bg-elev)] bg-[linear-gradient(140deg,var(--secondary),var(--primary))] text-[11px] font-bold text-white"
              >
                {l}
              </div>
            ))}
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--bg-elev)] bg-[var(--card)] text-[10px] font-semibold text-[var(--text-faint)]">
              +1.2K
            </div>
          </div>
          <div>
            <div className="flex items-center gap-0.5 text-[var(--warning)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} className="fill-current" />
              ))}
              <span className="ml-1 text-[12px] font-semibold text-[var(--text)]">4.9 / 5</span>
            </div>
            <div className="text-[11.5px] text-[var(--text-faint)]">Trusted by 1,200+ developers worldwide</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center px-10 py-10">
        <div className="mb-6 flex w-full max-w-[420px] justify-end">
          <span className="text-[12.5px] font-medium text-[var(--text-faint)]">English</span>
        </div>
        <SignupFormCard {...form} />
        <p className="mt-8 text-center text-[11px] text-[var(--text-faint)]">
          © 2026 CodePeeler ·{" "}
          <Link href="/" className="hover:text-[var(--text-dim)]">
            Privacy Policy
          </Link>{" "}
          ·{" "}
          <Link href="/" className="hover:text-[var(--text-dim)]">
            Terms of Service
          </Link>
        </p>
      </div>
    </div>
  );
}
