export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-60px)] flex-col overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      {children}
    </div>
  );
}
