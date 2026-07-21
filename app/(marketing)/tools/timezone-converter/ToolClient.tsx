"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

const COMMON_ZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Moscow",
  "Africa/Cairo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
  "Pacific/Auckland",
];

function wallTimeToUtc(isoLocal: string, timeZone: string): number {
  const asIfUtc = new Date(isoLocal + "Z").getTime();
  const tzDate = new Date(new Date(asIfUtc).toLocaleString("en-US", { timeZone }));
  const utcDate = new Date(new Date(asIfUtc).toLocaleString("en-US", { timeZone: "UTC" }));
  const offset = tzDate.getTime() - utcDate.getTime();
  return asIfUtc - offset;
}

function timezoneConvert(input: string, fromTz: string, toTz: string): string {
  const raw = input.trim();
  if (!raw) throw new Error("Enter a date/time, e.g. 2026-07-17 14:30");
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00` : raw.replace(" ", "T");
  if (isNaN(new Date(normalized).getTime())) throw new Error("Couldn't parse that date/time");
  const utcMs = wallTimeToUtc(normalized, fromTz);
  const target = new Date(utcMs);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: toTz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  });
  return `${fmt.format(target)}\n\nUTC: ${target.toISOString()}`;
}

function ZoneSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-dim)]">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[12.5px] text-[var(--text)]"
      >
        {COMMON_ZONES.map((z) => (
          <option key={z} value={z}>
            {z}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function TimezoneConverterPage() {
  const [fromTz, setFromTz] = useState("UTC");
  const [toTz, setToTz] = useState("America/New_York");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="🌐"
        title="Timezone Converter"
        desc="Convert a date & time from one timezone to another — runs entirely in your browser."
      />
      <ToolLab
        inputLabel="Date & Time"
        outputLabel="Converted"
        placeholder="e.g. 2026-07-17 14:30"
        live
        recalcKey={`${fromTz}-${toTz}`}
        monospaceInput={false}
        emptyHint="Enter a date & time above — the converted time updates automatically."
        settingsSlot={
          <div className="flex flex-wrap items-center gap-4">
            <ZoneSelect label="From" value={fromTz} onChange={setFromTz} />
            <ZoneSelect label="To" value={toTz} onChange={setToTz} />
          </div>
        }
        onRun={(input) => timezoneConvert(input, fromTz, toTz)}
      />
    </div>
  );
}
