"use client";

import { useEffect, useState } from "react";
import { X, Megaphone, Wrench } from "lucide-react";
import { useSession } from "@/lib/auth-client";

type PublicSettings = {
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  announcementEnabled: boolean;
  announcementMessage: string | null;
  announcementLink: string | null;
};

/**
 * Wraps the whole app. Fetches /api/settings/public once on mount:
 *  - maintenanceMode + not-an-admin  → full-screen maintenance message,
 *    nothing else renders (admins still see the real site so they can turn
 *    it back off from /admin).
 *  - announcementEnabled             → dismissible bar above the app.
 *    Dismissal is per-message (keyed by the message text itself) so a NEW
 *    announcement re-appears even if the user dismissed a previous one.
 * Fails open: if the fetch errors, the app renders normally rather than
 * getting stuck — this is a UX nicety, not a security boundary.
 */
export default function SiteStatusGate({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/settings/public")
      .then((res) => res.json())
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  // Best-effort, fire-and-forget — populates user.country from Vercel's
  // edge geo header (see app/api/geo/route.ts). Only actually does
  // anything once per session (once the DB value matches, it's a no-op).
  useEffect(() => {
    if (session?.user) fetch("/api/geo").catch(() => {});
  }, [session?.user]);

  useEffect(() => {
    if (!settings?.announcementMessage) return;
    const key = `announcement-dismissed:${settings.announcementMessage}`;
    setDismissed(typeof window !== "undefined" && window.localStorage.getItem(key) === "1");
  }, [settings?.announcementMessage]);

  if (settings?.maintenanceMode && !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg)] px-6 text-center text-[var(--text)]">
        <Wrench size={32} className="text-[var(--text-faint)]" />
        <h1 className="text-[18px] font-bold">We&apos;ll be right back</h1>
        <p className="max-w-[420px] text-[13.5px] text-[var(--text-dim)]">
          {settings.maintenanceMessage || "CodePeeler is undergoing scheduled maintenance. Thanks for your patience."}
        </p>
      </div>
    );
  }

  const showBanner = settings?.announcementEnabled && settings.announcementMessage && !dismissed;

  return (
    <>
      {showBanner && (
        <div className="flex items-center justify-center gap-2 bg-[var(--primary)] px-4 py-2 text-center text-[12.5px] font-medium text-white">
          <Megaphone size={14} className="flex-shrink-0" />
          {settings!.announcementLink ? (
            <a href={settings!.announcementLink} className="underline underline-offset-2">
              {settings!.announcementMessage}
            </a>
          ) : (
            <span>{settings!.announcementMessage}</span>
          )}
          <button
            onClick={() => {
              const key = `announcement-dismissed:${settings!.announcementMessage}`;
              window.localStorage.setItem(key, "1");
              setDismissed(true);
            }}
            className="ml-1 flex-shrink-0 opacity-80 hover:opacity-100"
            aria-label="Dismiss announcement"
          >
            <X size={13} />
          </button>
        </div>
      )}
      {children}
    </>
  );
}
