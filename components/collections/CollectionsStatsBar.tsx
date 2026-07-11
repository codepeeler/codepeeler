import { BarChart3, Wrench, Database, Clock, HardDrive, CloudOff, HelpCircle } from "lucide-react";

export default function CollectionsStatsBar() {
  return (
    <div className="hidden h-9 flex-shrink-0 items-center gap-5 border-t border-[var(--border-soft)] bg-[var(--bg-elev)] px-4 text-[11px] text-[var(--text-faint)] lg:flex">
      <span className="flex items-center gap-1.5">
        <BarChart3 size={12} /> Workspace Stats
      </span>
      <span className="flex items-center gap-1.5">
        <Wrench size={12} /> 48 Tools Used
      </span>
      <span className="flex items-center gap-1.5">
        <Database size={12} /> 2.45 GB Data
      </span>
      <span className="flex items-center gap-1.5">
        <Clock size={12} /> 28h 45m Saved Time
      </span>

      <span className="ml-auto flex items-center gap-1.5 text-[var(--success)]">
        <span className="h-1.5 w-1.5 rounded-full bg-current" /> Auto Save: ON
      </span>
      <span className="flex items-center gap-1.5">
        <HardDrive size={12} /> Local Storage
      </span>
      <span className="flex items-center gap-1.5">
        <CloudOff size={12} /> No Cloud Sync
      </span>
      <button className="flex items-center gap-1.5 transition-colors duration-150 hover:text-[var(--text)]">
        <HelpCircle size={12} /> Help
      </button>
    </div>
  );
}
