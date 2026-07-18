"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function checkPasswordStrength(input: string): string {
  if (!input) throw new Error("Enter a password to check");
  const len = input.length;
  const hasLower = /[a-z]/.test(input);
  const hasUpper = /[A-Z]/.test(input);
  const hasDigit = /\d/.test(input);
  const hasSymbol = /[^A-Za-z0-9]/.test(input);
  const varietyCount = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

  const charsetSize = (hasLower ? 26 : 0) + (hasUpper ? 26 : 0) + (hasDigit ? 10 : 0) + (hasSymbol ? 32 : 0);
  const entropy = charsetSize > 0 ? Math.log2(charsetSize) * len : 0;

  const commonPatterns = [/^12345/, /password/i, /qwerty/i, /abc123/i, /letmein/i, /^admin/i];
  const hasCommonPattern = commonPatterns.some((p) => p.test(input));
  const hasRepeats = /(.)\1{2,}/.test(input);
  const isSequential = /(?:012|123|234|345|456|567|678|789|abc|bcd|cde)/i.test(input);

  let score = 0;
  if (len >= 8) score++;
  if (len >= 12) score++;
  if (len >= 16) score++;
  score += varietyCount - 1;
  if (hasCommonPattern) score -= 2;
  if (hasRepeats) score -= 1;
  if (isSequential) score -= 1;
  score = Math.max(0, Math.min(6, score));

  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong", "Excellent"];
  const label = labels[score];

  const notes: string[] = [];
  if (len < 8) notes.push("Too short — use at least 8 characters");
  if (!hasUpper) notes.push("Add uppercase letters");
  if (!hasLower) notes.push("Add lowercase letters");
  if (!hasDigit) notes.push("Add numbers");
  if (!hasSymbol) notes.push("Add symbols");
  if (hasCommonPattern) notes.push("Avoid common words/patterns");
  if (hasRepeats) notes.push("Avoid repeated characters");
  if (isSequential) notes.push("Avoid sequential characters");

  return [
    `Strength:  ${label} (${score}/6)`,
    `Length:    ${len} characters`,
    `Entropy:   ~${entropy.toFixed(1)} bits`,
    `Variety:   ${[hasLower && "lowercase", hasUpper && "uppercase", hasDigit && "digits", hasSymbol && "symbols"].filter(Boolean).join(", ") || "none"}`,
    notes.length ? `\nSuggestions:\n${notes.map((n) => `- ${n}`).join("\n")}` : "\n✓ No suggestions — looks solid.",
  ].join("\n");
}

export default function PasswordStrengthCheckerPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="sec"
        badge="pw"
        title="Password Strength Checker"
        desc="Everything runs locally in your browser — your password is never sent anywhere. Get a strength score and concrete suggestions."
      />
      <ToolLab
        inputLabel="Password"
        outputLabel="Strength report"
        placeholder="Type a password..."
        live
        emptyHint="Type a password above — the strength report updates automatically."
        onRun={(input) => checkPasswordStrength(input)}
      />
    </div>
  );
}
