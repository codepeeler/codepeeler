export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Mobile: MobileShell already reserves 64px below us (pb-[64px]) for its
    // fixed bottom tab bar, so we must NOT also claim the full 100dvh here —
    // doing both makes the page taller than the screen and lets the whole
    // page (including this shell's "fixed" mobile header) scroll instead of
    // only the inner <main>. Subtracting 64px keeps our total at exactly one
    // screen. Desktop is unaffected (MobileShell uses lg:pb-0 there).
    <div
      className="flex h-[calc(100dvh-64px)] flex-col overflow-hidden bg-[var(--bg)] text-[var(--text)] lg:h-[calc(100vh-60px)]"
    >
      {children}
    </div>
  );
}
