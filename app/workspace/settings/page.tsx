"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Trash2, RotateCcw, Menu } from "lucide-react";
import NavRail, { NAV_RAIL_PANEL_ID } from "@/components/workspace/NavRail";
import CollectionsStatsBar from "@/components/collections/CollectionsStatsBar";
import Toggle from "@/components/ui/Toggle";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { WorkflowProvider } from "@/providers/workflow-provider";
import MobileHeader from "@/components/layout/mobile/MobileHeader";
import { useMobileShell } from "@/providers/mobile-shell-provider";

function SettingsSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <h2 className="text-[14px] font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-[12px] text-[var(--text-faint)]">{description}</p>}
      <div className="mt-3 space-y-2 rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-1.5">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ label, hint, right }: { label: string; hint?: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-[9px] px-3 py-2.5">
      <div className="min-w-0 pr-4">
        <div className="text-[12.5px] font-medium text-[var(--text)]">{label}</div>
        {hint && <div className="text-[11px] text-[var(--text-faint)]">{hint}</div>}
      </div>
      {right}
    </div>
  );
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { togglePanel } = useMobileShell();

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [completionAlerts, setCompletionAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);

  const [autoSave, setAutoSave] = useState(true);
  const [showStatsBar, setShowStatsBar] = useState(true);
  const [compactCards, setCompactCards] = useState(false);

  return (
    <WorkflowProvider>
      <MobileHeader
        title="Settings"
        actions={[{ key: "menu", icon: Menu, label: "Menu", onClick: () => togglePanel(NAV_RAIL_PANEL_ID) }]}
      />
      <div className="relative flex min-h-0 flex-1">
        <NavRail />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[720px] px-4 py-5 lg:px-6 lg:py-7">
            <div className="mb-7">
              <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.01em]">
                Settings
              </h1>
              <p className="mt-1 text-[13.5px] text-[var(--text-dim)]">
                Manage your appearance, notifications and workspace preferences
              </p>
            </div>

            <SettingsSection title="Appearance" description="Choose how CodePeeler looks on your device">
              <div className="flex items-center justify-between rounded-[9px] px-3 py-2.5">
                <div className="text-[12.5px] font-medium text-[var(--text)]">Theme</div>
                {mounted ? (
                  <div className="flex items-center overflow-hidden rounded-[9px] border border-[var(--border)] bg-[var(--bg)]">
                    <button
                      onClick={() => setTheme("light")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-[7px] text-[12px] font-semibold transition-colors duration-150",
                        theme === "light" ? "bg-[var(--card-hover)] text-[var(--text)]" : "text-[var(--text-faint)]"
                      )}
                    >
                      <Sun size={13} /> Light
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-[7px] text-[12px] font-semibold transition-colors duration-150",
                        theme === "dark" ? "bg-[var(--card-hover)] text-[var(--text)]" : "text-[var(--text-faint)]"
                      )}
                    >
                      <Moon size={13} /> Dark
                    </button>
                  </div>
                ) : (
                  <div className="h-[34px] w-[152px]" />
                )}
              </div>
            </SettingsSection>

            <SettingsSection title="Notifications">
              <SettingsRow
                label="Email notifications"
                hint="Get notified by email about important account activity"
                right={
                  <Toggle
                    checked={emailNotifs}
                    onChange={() => {
                      setEmailNotifs((v) => !v);
                      toast(`Email notifications turned ${!emailNotifs ? "on" : "off"}`);
                    }}
                  />
                }
              />
              <SettingsRow
                label="Workflow completion alerts"
                hint="Get a toast when a long-running workflow finishes"
                right={
                  <Toggle
                    checked={completionAlerts}
                    onChange={() => {
                      setCompletionAlerts((v) => !v);
                      toast(`Completion alerts turned ${!completionAlerts ? "on" : "off"}`);
                    }}
                  />
                }
              />
              <SettingsRow
                label="Weekly summary email"
                hint="A digest of your workspace activity every Monday"
                right={
                  <Toggle
                    checked={weeklySummary}
                    onChange={() => {
                      setWeeklySummary((v) => !v);
                      toast(`Weekly summary turned ${!weeklySummary ? "on" : "off"}`);
                    }}
                  />
                }
              />
            </SettingsSection>

            <SettingsSection title="Workspace Preferences">
              <SettingsRow
                label="Auto-save workflows"
                hint="Automatically save changes as you work"
                right={
                  <Toggle
                    checked={autoSave}
                    onChange={() => {
                      setAutoSave((v) => !v);
                      toast(`Auto-save turned ${!autoSave ? "on" : "off"}`);
                    }}
                  />
                }
              />
              <SettingsRow
                label="Show workspace statistics bar"
                hint="Display the stats bar at the bottom of the workspace"
                right={
                  <Toggle
                    checked={showStatsBar}
                    onChange={() => {
                      setShowStatsBar((v) => !v);
                      toast(`Statistics bar turned ${!showStatsBar ? "on" : "off"}`);
                    }}
                  />
                }
              />
              <SettingsRow
                label="Compact card view"
                hint="Show more collections and tools per row"
                right={
                  <Toggle
                    checked={compactCards}
                    onChange={() => {
                      setCompactCards((v) => !v);
                      toast(`Compact view turned ${!compactCards ? "on" : "off"}`);
                    }}
                  />
                }
              />
            </SettingsSection>

            <SettingsSection title="Danger Zone" description="These actions only affect data stored in this browser">
              <button
                onClick={() => {
                  if (window.confirm("Reset all local workspace data? This can't be undone.")) {
                    toast("Workspace data reset");
                  }
                }}
                className="flex w-full items-center gap-2 rounded-[9px] px-3 py-2.5 text-left text-[12.5px] font-medium text-[var(--text)] transition-colors duration-150 hover:bg-[var(--card-hover)]"
              >
                <RotateCcw size={14} /> Reset workspace data
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Clear local cache? You may need to reload open tools.")) {
                    toast("Local cache cleared");
                  }
                }}
                className="flex w-full items-center gap-2 rounded-[9px] px-3 py-2.5 text-left text-[12.5px] font-medium text-[var(--danger)] transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--danger)_14%,transparent)]"
              >
                <Trash2 size={14} /> Clear local cache
              </button>
            </SettingsSection>
          </div>
        </main>
      </div>

      <CollectionsStatsBar />
    </WorkflowProvider>
  );
}
