export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    // Same self-contained mobile shell math as collections/snippets/webhooks/
    // workspace: MobileShell already reserves 64px below (pb-[64px]) for its
    // fixed bottom tab bar, so we subtract it here instead of also claiming
    // the full 100dvh — otherwise the page becomes taller than the screen
    // and the whole page (including the "fixed" mobile header) scrolls.
    <div className="flex h-[calc(100dvh-64px)] flex-col overflow-hidden bg-[var(--bg)] text-[var(--text)] lg:h-[calc(100vh-60px)]">
      {children}
    </div>
  );
}
