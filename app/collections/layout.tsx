export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[var(--bg)] text-[var(--text)] lg:h-[calc(100vh-60px)]">
      {children}
    </div>
  );
}
