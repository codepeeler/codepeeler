"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function userAgentParse(input: string): string {
  const ua = input.trim();
  if (!ua) throw new Error("Paste a User-Agent string");

  let browser = "Unknown";
  let browserVersion = "";
  const browserPatterns: [RegExp, string][] = [
    [/Edg\/([\d.]+)/, "Edge"],
    [/OPR\/([\d.]+)/, "Opera"],
    [/Chrome\/([\d.]+)/, "Chrome"],
    [/CriOS\/([\d.]+)/, "Chrome (iOS)"],
    [/FxiOS\/([\d.]+)/, "Firefox (iOS)"],
    [/Firefox\/([\d.]+)/, "Firefox"],
    [/Version\/([\d.]+).*Safari/, "Safari"],
  ];
  for (const [re, name] of browserPatterns) {
    const m = ua.match(re);
    if (m) {
      browser = name;
      browserVersion = m[1];
      break;
    }
  }

  let os = "Unknown";
  if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
  else if (/Windows NT/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android ([\d.]+)/.test(ua)) os = `Android ${ua.match(/Android ([\d.]+)/)![1]}`;
  else if (/iPhone OS ([\d_]+)/.test(ua)) os = `iOS ${ua.match(/iPhone OS ([\d_]+)/)![1].replace(/_/g, ".")}`;
  else if (/iPad/.test(ua)) os = "iPadOS";
  else if (/Linux/.test(ua)) os = "Linux";

  let device = "Desktop";
  if (/iPad/.test(ua)) device = "Tablet (iPad)";
  else if (/Mobile|iPhone|Android.*Mobile/.test(ua)) device = "Mobile";
  else if (/Android/.test(ua)) device = "Tablet";

  const isBot = /bot|crawl|spider|slurp/i.test(ua);

  return [
    `Browser:  ${browser}${browserVersion ? " " + browserVersion : ""}`,
    `OS:       ${os}`,
    `Device:   ${device}`,
    `Is bot:   ${isBot ? "Yes" : "No"}`,
  ].join("\n");
}

export default function UserAgentParserPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="web"
        badge="UA"
        title="User-Agent Parser"
        desc="Paste a User-Agent string and get the browser, OS, device type, and bot detection."
      />
      <ToolLab
        inputLabel="User-Agent"
        outputLabel="Parsed"
        placeholder="e.g. Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
        live
        monospaceInput={false}
        emptyHint="Paste a User-Agent string above — the breakdown updates automatically."
        onRun={(input) => userAgentParse(input)}
      />
    </div>
  );
}
