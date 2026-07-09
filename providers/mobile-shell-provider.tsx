"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * A page can register any number of named panels (e.g. "tool-palette",
 * "inspector", "collections", "environment"). Only one is open at a time
 * on mobile — opening a new one closes the previous one, matching native
 * app drawer behavior.
 */
type MobileShellContextValue = {
  activePanel: string | null;
  openPanel: (id: string) => void;
  closePanel: () => void;
  togglePanel: (id: string) => void;
};

const MobileShellContext = createContext<MobileShellContextValue | null>(null);

export function MobileShellProvider({ children }: { children: React.ReactNode }) {
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const openPanel = useCallback((id: string) => setActivePanel(id), []);
  const closePanel = useCallback(() => setActivePanel(null), []);
  const togglePanel = useCallback((id: string) => {
    setActivePanel((current) => (current === id ? null : id));
  }, []);

  const value = useMemo(
    () => ({ activePanel, openPanel, closePanel, togglePanel }),
    [activePanel, openPanel, closePanel, togglePanel]
  );

  return <MobileShellContext.Provider value={value}>{children}</MobileShellContext.Provider>;
}

export function useMobileShell() {
  const ctx = useContext(MobileShellContext);
  if (!ctx) {
    throw new Error("useMobileShell must be used within a MobileShellProvider");
  }
  return ctx;
}
