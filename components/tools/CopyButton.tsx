"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/providers/toast-provider";

type CopyButtonProps = {
  value: string;
  label?: string;
};

export default function CopyButton({ value, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast("Copied to clipboard");
      setTimeout(() => setCopied(false), 1400);
    } catch {
      toast("Couldn't copy — try selecting manually");
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy output"
      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-[var(--text-faint)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
    >
      {copied ? <Check size={14} className="text-[var(--success)]" /> : <Copy size={14} />}
      {label && <span className="ml-1.5 text-[12px]">{label}</span>}
    </button>
  );
}
