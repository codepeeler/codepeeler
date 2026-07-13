import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parses fuzzy "time ago" strings like "2 days ago", "yesterday", "just now"
 * into an approximate number of minutes elapsed, so they can be sorted or
 * compared. Unknown formats sort to the very end (treated as oldest).
 */
export function parseAgoToMinutes(text: string): number {
  const t = text.toLowerCase().trim();
  if (t === "just now") return 0;
  if (t === "yesterday") return 60 * 24;

  const match = t.match(/^(\d+)\s+(minute|hour|day|week|month|year)s?\s+ago$/);
  if (!match) return Number.MAX_SAFE_INTEGER;

  const amount = parseInt(match[1], 10);
  const unitMinutes: Record<string, number> = {
    minute: 1,
    hour: 60,
    day: 60 * 24,
    week: 60 * 24 * 7,
    month: 60 * 24 * 30,
    year: 60 * 24 * 365,
  };
  return amount * unitMinutes[match[2]];
}

/**
 * Formats a real Date/timestamp into the same fuzzy "time ago" strings
 * parseAgoToMinutes expects ("2 hours ago", "yesterday", "just now") —
 * the inverse of that function. Used to display real `updatedAt` /
 * `lastRunAt` values from the DB in the same style the UI already uses.
 */
export function formatTimeAgo(date: Date | string | null | undefined): string {
  if (!date) return "never";
  const then = typeof date === "string" ? new Date(date) : date;
  const minutes = Math.max(0, Math.floor((Date.now() - then.getTime()) / 60000));

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}