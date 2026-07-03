"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { Check } from "lucide-react";

type Toast = { id: number; message: string };

type ToastContextValue = {
  toast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2400);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-[22px] right-[22px] z-[300] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast-in flex max-w-[300px] items-center gap-2 rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-4 py-[11px] text-sm font-medium text-[var(--text)] shadow-[var(--shadow-soft)]"
          >
            <Check size={15} strokeWidth={2.4} className="flex-shrink-0 text-[var(--success)]" />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
