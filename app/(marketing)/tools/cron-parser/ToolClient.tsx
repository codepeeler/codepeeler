"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
type CronFieldName = "minute" | "hour" | "day of month" | "month" | "day of week";

function describeCronField(value: string, name: CronFieldName): string {
  if (value === "*") return `every ${name}`;
  if (/^\*\/\d+$/.test(value)) return `every ${value.slice(2)} ${name}(s)`;
  if (/^\d+(-\d+)?(,\d+(-\d+)?)*$/.test(value)) {
    const label = name === "month" ? "month" : name === "day of week" ? "weekday" : name;
    return `${label} ${value}`;
  }
  return `${name} ${value}`;
}

function cronToHuman(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error("Cron expression must have exactly 5 fields: minute hour day-of-month month day-of-week");
  }
  const [min, hour, dom, month, dow] = parts;

  if (min === "*" && hour === "*" && dom === "*" && month === "*" && dow === "*") {
    return "Runs every minute";
  }
  if (/^\d+$/.test(min) && /^\d+$/.test(hour) && dom === "*" && month === "*" && dow === "*") {
    return `Runs every day at ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
  }
  if (/^\d+$/.test(min) && /^\d+$/.test(hour) && dom === "*" && month === "*" && /^\d+$/.test(dow)) {
    const day = WEEKDAYS[Number(dow) % 7] ?? dow;
    return `Runs every ${day} at ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
  }
  if (/^\d+$/.test(min) && /^\d+$/.test(hour) && /^\d+$/.test(dom) && month === "*" && dow === "*") {
    return `Runs on day ${dom} of every month at ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
  }

  const pieces = [
    describeCronField(min, "minute"),
    describeCronField(hour, "hour"),
    describeCronField(dom, "day of month"),
    describeCronField(month, "month"),
    describeCronField(dow, "day of week"),
  ];
  return `Runs at ${pieces.join(", ")}`;
}

function nextCronRuns(expr: string, count = 5): string[] {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) throw new Error("Cron expression must have exactly 5 fields");
  const [minField, hourField, domField, monthField, dowField] = parts;

  function matches(field: string, value: number): boolean {
    if (field === "*") return true;
    return field.split(",").some((part) => {
      const stepMatch = part.match(/^\*\/(\d+)$/);
      if (stepMatch) return value % Number(stepMatch[1]) === 0;
      const rangeMatch = part.match(/^(\d+)-(\d+)$/);
      if (rangeMatch) return value >= Number(rangeMatch[1]) && value <= Number(rangeMatch[2]);
      return Number(part) === value;
    });
  }

  const results: string[] = [];
  const cursor = new Date();
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  let guard = 0;
  while (results.length < count && guard < 200000) {
    guard++;
    const min = cursor.getMinutes();
    const hour = cursor.getHours();
    const dom = cursor.getDate();
    const month = cursor.getMonth() + 1;
    const dow = cursor.getDay();

    if (
      matches(minField, min) &&
      matches(hourField, hour) &&
      matches(domField, dom) &&
      matches(monthField, month) &&
      matches(dowField, dow)
    ) {
      results.push(cursor.toISOString().replace("T", " ").slice(0, 16));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  if (results.length === 0) throw new Error("Couldn't find an upcoming run — check the expression");
  return results;
}

function cronParse(input: string): string {
  const expr = input.trim();
  const human = cronToHuman(expr);
  const upcoming = nextCronRuns(expr, 5);
  return [human, "", "Next 5 runs (UTC-based estimate):", ...upcoming.map((t) => `  ${t}`)].join("\n");
}

export default function CronParserPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="⏲"
        title="Cron Expression Parser"
        desc="Paste a 5-field cron expression to get a plain-English explanation and the next 5 upcoming run times."
      />
      <ToolLab
        inputLabel="Cron Expression"
        outputLabel="Explanation"
        placeholder="e.g. */15 9-17 * * 1-5"
        live
        emptyHint="Enter a cron expression above (minute hour day-of-month month day-of-week)."
        onRun={(input) => cronParse(input)}
      />
    </div>
  );
}
