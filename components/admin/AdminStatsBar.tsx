import { Users, UserPlus, Sparkles, Zap, Bot, CircleDollarSign } from "lucide-react";
import StatCard from "@/components/workspace/dashboard/StatCard";
import type { AdminStats } from "@/hooks/use-admin-panel";

/** Same StatCard used on the workspace dashboard — keeps the two internal-facing grids visually consistent. */
export default function AdminStatsBar({ stats, loading }: { stats: AdminStats | null; loading: boolean }) {
  const s = stats ?? {
    totalUsers: 0,
    newUsersLast7Days: 0,
    proUsers: 0,
    freeUsers: 0,
    executionsThisPeriod: 0,
    aiCallsThisPeriod: 0,
  };

  return (
    <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard icon={Users} label="Total Users" value={loading ? "—" : s.totalUsers} color="var(--primary)" />
      <StatCard icon={UserPlus} label="New (7 days)" value={loading ? "—" : s.newUsersLast7Days} color="var(--secondary)" />
      <StatCard icon={Sparkles} label="Pro Users" value={loading ? "—" : s.proUsers} color="var(--accent)" />
      <StatCard icon={CircleDollarSign} label="Free Users" value={loading ? "—" : s.freeUsers} color="var(--text-faint)" />
      <StatCard icon={Zap} label="Executions (period)" value={loading ? "—" : s.executionsThisPeriod.toLocaleString()} color="var(--warning)" />
      <StatCard icon={Bot} label="AI Calls (period)" value={loading ? "—" : s.aiCallsThisPeriod.toLocaleString()} color="var(--success)" />
    </div>
  );
}
