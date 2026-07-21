"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { NumberField } from "@/components/tools/FormFields";

function rateLimitCalc(usedStr: string, limit: number, windowMinutes: number): string {
  const used = Number(usedStr.trim());
  if (isNaN(used) || used < 0) throw new Error("Enter the number of requests used so far");
  if (limit <= 0 || windowMinutes <= 0) throw new Error("Limit and window must be positive");
  const remaining = Math.max(0, limit - used);
  const windowSeconds = windowMinutes * 60;
  const avgIntervalSeconds = remaining > 0 ? windowSeconds / remaining : 0;
  return [
    `Limit:      ${limit} requests / ${windowMinutes} min`,
    `Used:       ${used}`,
    `Remaining:  ${remaining}`,
    `Window:     ${windowSeconds}s`,
    remaining > 0
      ? `Safe pace:  1 request every ~${avgIntervalSeconds.toFixed(1)}s to use the rest of the window evenly`
      : `Status:     Limit reached — wait for the window to reset`,
  ].join("\n");
}

export default function ApiRateLimitCalculatorPage() {
  const [limit, setLimit] = useState(100);
  const [windowMinutes, setWindowMinutes] = useState(60);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="rl"
        title="API Rate Limit Calculator"
        desc="Enter how many requests you've used so far to see what's left and a safe pace for the rest of the window."
      />
      <ToolLab
        inputLabel="Requests used"
        outputLabel="Rate limit status"
        placeholder="42"
        live
        recalcKey={`${limit}-${windowMinutes}`}
        settingsSlot={
          <>
            <NumberField label="Limit" value={limit} onChange={setLimit} />
            <NumberField label="Window (min)" value={windowMinutes} onChange={setWindowMinutes} />
          </>
        }
        emptyHint="Enter requests used above — the rate limit status updates automatically."
        onRun={(input) => rateLimitCalc(input, limit, windowMinutes)}
      />
    </div>
  );
}
