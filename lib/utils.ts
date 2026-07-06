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