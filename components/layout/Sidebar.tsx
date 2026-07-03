import {
  LayoutDashboard,
  Wrench,
  FolderOpen,
  BookOpen,
  Settings,
} from "lucide-react";

const items = [
  LayoutDashboard,
  Wrench,
  FolderOpen,
  BookOpen,
  Settings,
];

export default function Sidebar() {
  return (
    <aside className="flex w-20 flex-col items-center border-r border-[var(--border)] bg-[var(--surface)]">

      <div className="flex h-20 items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)] font-bold text-white">
          CP
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-3 pt-6">
        {items.map((Icon, index) => (
          <button
            key={index}
            className="flex h-12 w-12 items-center justify-center rounded-xl text-[var(--text-muted)] transition hover:bg-[var(--card)] hover:text-white"
          >
            <Icon size={22} />
          </button>
        ))}
      </nav>
    </aside>
  );
}