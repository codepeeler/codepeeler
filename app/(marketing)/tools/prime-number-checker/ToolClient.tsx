"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function isPrimeNum(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false;
  return true;
}

function primeFactorsOf(n: number): number[] {
  const factors: number[] = [];
  let x = n;
  for (let i = 2; i * i <= x; i++) {
    while (x % i === 0) {
      factors.push(i);
      x /= i;
    }
  }
  if (x > 1) factors.push(x);
  return factors;
}

function primeCheck(input: string): string {
  const n = Number(input.trim());
  if (!Number.isInteger(n)) throw new Error("Enter a whole number");
  const prime = isPrimeNum(n);
  if (prime) return `${n} is prime.`;
  const factors = n > 1 ? primeFactorsOf(n) : [];
  return `${n} is not prime.${factors.length ? `\nPrime factors: ${factors.join(" × ")}` : ""}`;
}

function primeList(input: string): string {
  const parts = input.split(",").map((s) => Number(s.trim()));
  const min = parts.length >= 2 ? parts[0] : 2;
  const max = parts.length >= 2 ? parts[1] : parts[0] || 100;
  if (isNaN(min) || isNaN(max) || min > max) throw new Error("Enter a range like 2,100");
  if (max - min > 1000000) throw new Error("Range too large — keep it under 1,000,000");
  const primes: number[] = [];
  for (let i = Math.max(2, Math.floor(min)); i <= max; i++) if (isPrimeNum(i)) primes.push(i);
  return primes.length ? primes.join(", ") : "No primes in that range.";
}

export default function PrimeNumberCheckerPage() {
  const [mode, setMode] = useState("check");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="P?"
        title="Prime Number Checker"
        desc="Check whether a number is prime and see its factors, or list every prime within a range."
      />
      <ToolLab
        inputLabel={mode === "check" ? "Number" : "Range (min,max)"}
        outputLabel={mode === "check" ? "Result" : "Primes"}
        placeholder={mode === "check" ? "e.g. 97" : "e.g. 2,100"}
        modes={[
          { value: "check", label: "Check" },
          { value: "generate", label: "Generate" },
        ]}
        mode={mode}
        onModeChange={setMode}
        live
        recalcKey={mode}
        emptyHint="Enter a number above — the result updates automatically."
        onRun={(input) => (mode === "check" ? primeCheck(input) : primeList(input))}
      />
    </div>
  );
}
