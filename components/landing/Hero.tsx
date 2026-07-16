"use client";

import React from "react";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import styles from "./Hero.module.css";

const TRUST_ITEMS = ["Visual flow builder", "Over 50+ built-in tools", "Your data stays on-device"];

const CODE_LINES = [
  "const formatter = new JSONFormatter();",
  "await formatter.parse(rawData);",
  "// Formatted in 8ms",
  "",
  "function base64Encode(input: string) {",
  "  return btoa(unescape(encodeURIComponent(input)));",
  "}",
  "",
  "const hash = await crypto.subtle.digest(",
  '  "SHA-256", encoder.encode(password)',
  ");",
  "// ef92b778ba3c4d9f...",
  "",
  "const workflow = new WorkflowBuilder()",
  '  .addNode("json-parse")',
  '  .addNode("base64-encode")',
  '  .connect("json-parse", "base64-encode")',
  "  .run();",
  "",
  "const uuid = crypto.randomUUID();",
  "// 550e8400-e29b-41d4-a716",
  "",
  "const jwt = sign({ userId, role }, SECRET, {",
  '  expiresIn: "7d", algorithm: "HS256"',
  "});",
  "",
  "const qr = await QRCode.toDataURL(url, { width: 256 });",
  "",
  "function generatePassword(len = 16) {",
  '  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";',
  "  return Array.from(crypto.getRandomValues(",
  "    new Uint8Array(len)",
  "  )).map(b => chars[b % chars.length]).join('');",
  "}",
  "",
  "// Workflow complete - 0 errors",
];

function highlightCode(line: string) {
  if (!line.trim()) return "\u00A0";

  if (line.trim().startsWith("//")) {
    return <span className={styles.codeComment}>{line}</span>;
  }

  const tokens: React.ReactNode[] = [];
  let current = "";
  let i = 0;

  while (i < line.length) {
    if (line.substring(i, i + 2) === "//") {
      if (current) { tokens.push(current); current = ""; }
      tokens.push(<span key={`c-${i}`} className={styles.codeComment}>{line.substring(i)}</span>);
      break;
    }

    if (line[i] === '"' || line[i] === "'") {
      if (current) { tokens.push(current); current = ""; }
      const quote = line[i];
      let str = quote;
      i++;
      while (i < line.length && line[i] !== quote) { str += line[i]; i++; }
      if (i < line.length) { str += quote; i++; }
      tokens.push(<span key={`s-${i}`} className={styles.codeString}>{str}</span>);
      continue;
    }

    if (/[a-zA-Z0-9_$]/.test(line[i])) {
      current += line[i]; i++;
    } else {
      if (current) {
        const KEYWORDS = ["const","await","function","return","new","import","from","let","var","class"];
        if (KEYWORDS.includes(current)) {
          tokens.push(<span key={`k-${i}`} className={styles.codeKeyword}>{current}</span>);
        } else if (/^\d+$/.test(current)) {
          tokens.push(<span key={`n-${i}`} className={styles.codeNumber}>{current}</span>);
        } else {
          tokens.push(current);
        }
        current = "";
      }
      tokens.push(line[i]); i++;
    }
  }

  if (current) tokens.push(current);
  return <>{tokens.map((t, idx) => <span key={idx}>{t}</span>)}</>;
}

export default function Hero() {
  const scrollToPopularTools = () => {
    document.getElementById("popular-tools")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative grid w-full grid-cols-1 items-center gap-10 overflow-hidden px-8 pb-1 pt-3 lg:grid-cols-[1.1fr_0.9fr]">

      {/* Scrolling code background */}
      <div aria-hidden="true" className={styles.codeBg}>
        <div className={styles.codeScroll}>
          {[...CODE_LINES, ...CODE_LINES].map((line, i) => (
            <div key={i} className={styles.codeLine}>
              {highlightCode(line)}
            </div>
          ))}
        </div>

        {/* Left mask — strong, hides code behind text; transparent on the right */}
        <div className={styles.codeMaskLeft} />

        {/* Top fade */}
        <div className={styles.codeMaskTop} />

        {/* Bottom fade */}
        <div className={styles.codeMaskBottom} />
      </div>

      {/* Left: text content */}
      <div className="relative z-10">
        <div className="mb-[18px] inline-flex items-center gap-[7px] rounded-[20px] border border-[rgba(79,157,255,0.25)] bg-[rgba(79,157,255,0.1)] px-3 py-[5px] text-xs font-semibold text-[var(--secondary)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] shadow-[0_0_0_3px_rgba(34,197,94,0.18)]" />
          Professional Developer Workspace - Build Custom Workflows
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-[40px] font-bold leading-[1.08] tracking-[-0.02em] sm:text-[50px] lg:text-[58px] xl:text-[66px]">
          Your all-in-one
          <br />
          <span className="bg-[linear-gradient(100deg,var(--primary),var(--secondary))] bg-clip-text text-transparent">
            developer workspace
          </span>
        </h1>

        <p className="mt-4 max-w-[500px] text-[17px] leading-[1.6] text-[var(--text-dim)]">
          Format, convert, decode, and generate -- chain tools together into
          visual workflows instead of juggling forty tabs. Streamline your
          development process in one cohesive workspace.
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

      {/* Right: orbital animation */}
      <div className={`relative z-10 hidden lg:flex ${styles.heroVisual}`}>
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