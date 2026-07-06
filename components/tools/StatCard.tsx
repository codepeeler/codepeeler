export function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-3.5">
      <div className="font-[family-name:var(--font-mono)] text-[20px] font-bold text-[var(--text)]">{value}</div>
      <div className="mt-0.5 text-[11px] text-[var(--text-faint)]">{label}</div>
    </div>
  );
}

export function StatGrid({ items }: { items: [string | number, string][] }) {
  return (
    <div className="grid grid-cols-2 content-start gap-2.5 sm:grid-cols-3">
      {items.map(([value, label]) => (
        <StatCard key={label} value={value} label={label} />
      ))}
    </div>
  );
}
