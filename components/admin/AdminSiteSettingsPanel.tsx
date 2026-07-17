"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Megaphone } from "lucide-react";
import type { SiteSettings } from "@/hooks/use-admin-site-settings";

type Props = {
  settings: SiteSettings | null;
  loading: boolean;
  saving: boolean;
  onSave: (patch: Partial<SiteSettings>) => void;
};

export default function AdminSiteSettingsPanel({ settings, loading, saving, onSave }: Props) {
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcementLink, setAnnouncementLink] = useState("");

  useEffect(() => {
    if (!settings) return;
    setMaintenanceMessage(settings.maintenanceMessage ?? "");
    setAnnouncementMessage(settings.announcementMessage ?? "");
    setAnnouncementLink(settings.announcementLink ?? "");
  }, [settings]);

  if (loading || !settings) {
    return <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">Loading…</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[14px] border border-[var(--border)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-[13px] font-semibold">
            <AlertTriangle size={14} className="text-[var(--warning)]" /> Maintenance mode
          </h3>
          <button
            onClick={() => onSave({ maintenanceMode: !settings.maintenanceMode })}
            disabled={saving}
            className={`h-7 rounded-full px-1 transition-colors ${settings.maintenanceMode ? "bg-[var(--danger)]" : "bg-[var(--border)]"}`}
            style={{ width: 44 }}
          >
            <span
              className="block h-5 w-5 rounded-full bg-white shadow transition-transform"
              style={{ transform: settings.maintenanceMode ? "translateX(20px)" : "translateX(0)" }}
            />
          </button>
        </div>
        <p className="mb-2 text-[11.5px] text-[var(--text-faint)]">
          When on, non-admin visitors see this message instead of the site. Admins can still browse normally.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={maintenanceMessage}
            onChange={(e) => setMaintenanceMessage(e.target.value)}
            placeholder="We'll be back shortly — thanks for your patience."
            className="h-8 flex-1 rounded-[7px] border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[12.5px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
          />
          <button
            onClick={() => onSave({ maintenanceMessage })}
            disabled={saving}
            className="h-8 rounded-[7px] border border-[var(--border)] px-3 text-[12px] font-semibold text-[var(--text-dim)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save message
          </button>
        </div>
      </div>

      <div className="rounded-[14px] border border-[var(--border)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-[13px] font-semibold">
            <Megaphone size={14} className="text-[var(--primary)]" /> Announcement banner
          </h3>
          <button
            onClick={() => onSave({ announcementEnabled: !settings.announcementEnabled })}
            disabled={saving}
            className={`h-7 rounded-full px-1 transition-colors ${settings.announcementEnabled ? "bg-[var(--success)]" : "bg-[var(--border)]"}`}
            style={{ width: 44 }}
          >
            <span
              className="block h-5 w-5 rounded-full bg-white shadow transition-transform"
              style={{ transform: settings.announcementEnabled ? "translateX(20px)" : "translateX(0)" }}
            />
          </button>
        </div>
        <p className="mb-2 text-[11.5px] text-[var(--text-faint)]">
          Shows a dismissible bar across the top of every page — for launches, downtime notices, promos, etc.
        </p>
        <div className="mb-2 flex gap-2">
          <input
            type="text"
            value={announcementMessage}
            onChange={(e) => setAnnouncementMessage(e.target.value)}
            placeholder="We just launched Snippets — check it out!"
            className="h-8 flex-1 rounded-[7px] border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[12.5px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={announcementLink}
            onChange={(e) => setAnnouncementLink(e.target.value)}
            placeholder="Optional link (e.g. /snippets)"
            className="h-8 flex-1 rounded-[7px] border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[12.5px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
          />
          <button
            onClick={() => onSave({ announcementMessage, announcementLink })}
            disabled={saving}
            className="h-8 rounded-[7px] border border-[var(--border)] px-3 text-[12px] font-semibold text-[var(--text-dim)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save banner
          </button>
        </div>
      </div>
    </div>
  );
}
