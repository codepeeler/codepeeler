"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, MessageSquare } from "lucide-react";
import { SiGithub } from "react-icons/si";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import MobileFooter from "@/components/layout/mobile/MobileFooter";
import Button from "@/components/ui/Button";
import { useToast } from "@/providers/toast-provider";

const CHANNELS = [
  { icon: Mail, label: "Email Us", value: "support@codepeeler.dev", href: "mailto:support@codepeeler.dev" },
  { icon: SiGithub, label: "GitHub", value: "Open Source & Issues", href: "https://github.com" },
  { icon: MessageSquare, label: "Feedback", value: "Use the in-app feedback button", href: "#" },
];

/**
 * There's no backend inbox/ticketing system behind this yet, so submitting
 * opens a pre-filled mailto: to a real address instead of pretending to
 * "send" to a server that doesn't exist. Genuinely functional, just not
 * server-side.
 */
export default function ContactPage() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      toast("Please fill in your email and message");
      return;
    }
    const body = `From: ${name || "—"} (${email})\n\n${message}`;
    window.location.href = `mailto:support@codepeeler.dev?subject=${encodeURIComponent(subject || "CodePeeler support")}&body=${encodeURIComponent(body)}`;
    toast("Opening your email client…");
  }

  return (
    <div className="relative flex min-h-0 flex-1">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1100px] px-6 py-7">
          <div className="mb-1 flex items-center gap-1.5 text-[12px] text-[var(--text-faint)]">
            <Link href="/">Home</Link>
            <span>›</span>
            <span className="text-[var(--text-dim)]">Contact</span>
          </div>
          <h1 className="mb-1 mt-3 font-[family-name:var(--font-display)] text-[28px] font-bold tracking-[-0.01em]">
            Contact CodePeeler
          </h1>
          <p className="mb-7 max-w-[520px] text-[13.5px] leading-[1.6] text-[var(--text-dim)]">
            Have a question, found a bug, or want to say hi? Send us a message and we&apos;ll get back to you.
          </p>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <form onSubmit={handleSubmit} className="rounded-[14px] border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-dim)]">Your Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-[9px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[13px] outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-dim)]">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-[9px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[13px] outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-dim)]">Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What is your message about?"
                  className="w-full rounded-[9px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[13px] outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div className="mb-5">
                <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-dim)]">Message</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full resize-none rounded-[9px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[13px] outline-none focus:border-[var(--primary)]"
                />
              </div>
              <Button size="md">Send Message</Button>
              <p className="mt-2 text-[11px] text-[var(--text-faint)]">Opens your email app with this message pre-filled.</p>
            </form>

            <aside className="flex flex-col gap-3">
              {CHANNELS.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-3.5 transition-colors duration-150 hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))]"
                >
                  <c.icon size={17} className="flex-shrink-0 text-[var(--primary)]" />
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-semibold">{c.label}</div>
                    <div className="truncate text-[11.5px] text-[var(--text-faint)]">{c.value}</div>
                  </div>
                </a>
              ))}
            </aside>
          </div>
        </div>

        <Footer />
        <MobileFooter variant="compact" />
      </main>
    </div>
  );
}
