"use client";

import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import styles from "./Hero.module.css";

const TRUST_ITEMS = ["No sign-up", "Works fully offline", "Your data stays on-device"];

export default function Hero() {
  const scrollToPopularTools = () => {
    document.getElementById("popular-tools")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="grid w-full grid-cols-1 items-center gap-10 px-8 pb-5 pt-14 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <div className="mb-[18px] inline-flex items-center gap-[7px] rounded-[20px] border border-[rgba(79,157,255,0.25)] bg-[rgba(79,157,255,0.1)] px-3 py-[5px] text-xs font-semibold text-[var(--secondary)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] shadow-[0_0_0_3px_rgba(34,197,94,0.18)]" />
          100% browser-based · no account needed
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-[44px] font-bold leading-[1.08] tracking-[-0.02em]">
          Your all-in-one
          <br />
          <span className="bg-[linear-gradient(100deg,var(--primary),var(--secondary))] bg-clip-text text-transparent">
            developer workspace
          </span>
        </h1>

        <p className="mt-4 max-w-[460px] text-[15.5px] leading-[1.6] text-[var(--text-dim)]">
          Format, convert, decode, and generate — chain tools together into
          workflows instead of juggling forty tabs. Everything runs locally,
          nothing ever leaves your browser.
        </p>

        <div className="mt-[26px] flex gap-2.5">
          <button
            onClick={scrollToPopularTools}
            className="inline-flex items-center gap-[7px] rounded-[9px] bg-[var(--primary)] px-5 py-[11px] text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:shadow-[var(--shadow-glow)] hover:brightness-[1.08]"
          >
            Explore tools
            <ArrowRight size={15} strokeWidth={2.2} />
          </button>
          <Link
            href="/workspace"
            className="inline-flex items-center gap-[7px] rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-5 py-[11px] text-sm font-semibold text-[var(--text)] transition-colors duration-150 hover:border-[var(--text-faint)] hover:bg-[var(--card-hover)]"
          >
            See how workspace works
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-[22px]">
          {TRUST_ITEMS.map((item) => (
            <div
              key={item}
              className="flex items-center gap-[7px] text-[12.5px] font-medium text-[var(--text-dim)]"
            >
              <Check size={14} strokeWidth={2.5} className="flex-shrink-0 text-[var(--success)]" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className={`hidden lg:flex ${styles.heroVisual}`}>
        <div className={styles.glow} />
        <div className={styles.scene}>
          <div className={`${styles.ringWrap} ${styles.ringWrapA}`}>
            <div className={`${styles.ring} ${styles.ringA}`}>
              <span className={`${styles.sat} ${styles.satA}`} />
            </div>
          </div>
          <div className={`${styles.ringWrap} ${styles.ringWrapB}`}>
            <div className={`${styles.ring} ${styles.ringB}`}>
              <span className={`${styles.sat} ${styles.satB}`} />
            </div>
          </div>
          <div className={`${styles.ringWrap} ${styles.ringWrapC}`}>
            <div className={`${styles.ring} ${styles.ringC}`}>
              <span className={`${styles.sat} ${styles.satC}`} />
            </div>
          </div>
          <div className={styles.core} />
        </div>
      </div>
    </section>
  );
}
