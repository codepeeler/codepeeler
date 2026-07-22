"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, UserCheck, Wrench, IndianRupee, Database, Sparkles } from "lucide-react";
import StatCard from "@/components/workspace/dashboard/StatCard";
import { formatTimeAgo } from "@/lib/utils";
import type { AdminStats } from "@/hooks/use-admin-panel";
import type { DashboardData } from "@/hooks/use-admin-dashboard";

const COUNTRY_COLORS = ["var(--primary)", "var(--success)", "var(--warning)", "var(--secondary)", "#A78BFA", "var(--text-faint)"];

const ACTIVITY_LABEL: Record<string, string> = {
  tool_use: "used a tool",
  snippet_create: "created a snippet",
  snippet_view: "viewed a snippet",
  snippet_use: "used a snippet",
  collection_create: "created a collection",
  collection_update: "updated a collection",
  workflow_create: "created a workflow",
  workflow_run: "ran a workflow",
};

function formatDay(day: string) {
  const d = new Date(day + "T00:00:00");
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

type Props = { stats: AdminStats | null; statsLoading: boolean; data: DashboardData | null; loading: boolean };

export default function AdminDashboardOverview({ stats, statsLoading, data, loading }: Props) {
  const chartData =
    data?.signupsOverTime.map((s, i) => ({
      day: formatDay(s.day),
      Signups: s.signups,
      "Tool Runs": data.toolRunsOverTime[i]?.toolRuns ?? 0,
    })) ?? [];

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Users} label="Total Users" value={statsLoading ? "—" : stats?.totalUsers ?? 0} color="var(--primary)" />
        <StatCard icon={UserCheck} label="Active Users (30d)" value={loading ? "—" : data?.activeUsers30d ?? 0} color="var(--success)" />
        <StatCard icon={Wrench} label="Total Tools" value={loading ? "—" : data?.totalTools ?? 0} color="var(--secondary)" />
        <StatCard icon={IndianRupee} label="Revenue (MRR)" value={loading ? "—" : `₹${(data?.mrr ?? 0).toLocaleString()}`} color="var(--warning)" />
        <StatCard
          icon={Database}
          label="Database"
          value={loading ? "—" : data?.dbStatus.healthy ? `Healthy (${data.dbStatus.pingMs}ms)` : "Issue"}
          color={data?.dbStatus.healthy ? "var(--success)" : "var(--danger)"}
        />
        <StatCard icon={Sparkles} label="Pro Users" value={statsLoading ? "—" : stats?.proUsers ?? 0} color="#A78BFA" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--card)] p-4">
          <h3 className="mb-4 text-[13.5px] font-semibold text-[var(--text)]">Signups & Tool Runs — last 14 days</h3>
          {loading ? (
            <div className="flex h-[260px] items-center justify-center text-[13px] text-[var(--text-faint)]">Loading…</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-faint)" }} stroke="var(--border)" />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-faint)" }} stroke="var(--border)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }}
                />
                <Line type="monotone" dataKey="Signups" stroke="var(--primary)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Tool Runs" stroke="var(--success)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--card)] p-4">
          <h3 className="mb-4 text-[13.5px] font-semibold text-[var(--text)]">Users by country</h3>
          {loading ? (
            <div className="flex h-[200px] items-center justify-center text-[13px] text-[var(--text-faint)]">Loading…</div>
          ) : !data?.countryBreakdown.length ? (
            <p className="py-8 text-center text-[12.5px] text-[var(--text-faint)]">
              No country data yet — this fills in once real visitors hit the live site (Vercel only, not local dev).
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={data.countryBreakdown} dataKey="count" nameKey="country" innerRadius={38} outerRadius={62} paddingAngle={2}>
                    {data.countryBreakdown.map((_, i) => (
                      <Cell key={i} fill={COUNTRY_COLORS[i % COUNTRY_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-col gap-1">
                {data.countryBreakdown.map((c, i) => (
                  <div key={c.country} className="flex items-center justify-between text-[11.5px] text-[var(--text-dim)]">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: COUNTRY_COLORS[i % COUNTRY_COLORS.length] }} />
                      {c.country}
                    </span>
                    <span className="text-[var(--text-faint)]">{c.pct}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--card)] p-4">
          <h3 className="mb-3 text-[13.5px] font-semibold text-[var(--text)]">Top tools by usage</h3>
          {loading ? (
            <p className="py-6 text-center text-[12.5px] text-[var(--text-faint)]">Loading…</p>
          ) : !data?.topTools.length ? (
            <p className="py-6 text-center text-[12.5px] text-[var(--text-faint)]">No tool usage recorded yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.topTools.map((t) => (
                <div key={t.id ?? t.name} className="flex items-center justify-between text-[12.5px] text-[var(--text-dim)]">
                  <span className="truncate">{t.name}</span>
                  <span className="flex-shrink-0 font-semibold text-[var(--text)]">
                    {t.runs.toLocaleString()} <span className="font-normal text-[var(--text-faint)]">· {t.users} users</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--card)] p-4">
          <h3 className="mb-3 text-[13.5px] font-semibold text-[var(--text)]">New users</h3>
          {loading ? (
            <p className="py-6 text-center text-[12.5px] text-[var(--text-faint)]">Loading…</p>
          ) : !data?.newUsers.length ? (
            <p className="py-6 text-center text-[12.5px] text-[var(--text-faint)]">No users yet.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {data.newUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-2 text-[12px] text-[var(--text-dim)]">
                  <span className="truncate">{u.email}</span>
                  <span className="flex-shrink-0 text-[var(--text-faint)]">{formatTimeAgo(u.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--card)] p-4">
          <h3 className="mb-3 text-[13.5px] font-semibold text-[var(--text)]">Recent activity</h3>
          {loading ? (
            <p className="py-6 text-center text-[12.5px] text-[var(--text-faint)]">Loading…</p>
          ) : !data?.recentActivity.length ? (
            <p className="py-6 text-center text-[12.5px] text-[var(--text-faint)]">No activity yet.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {data.recentActivity.map((e) => (
                <div key={e.id} className="text-[12px] text-[var(--text-dim)]">
                  <span className="font-medium text-[var(--text)]">{e.userName}</span> {ACTIVITY_LABEL[e.type] ?? e.type}
                  {e.entityName ? ` — ${e.entityName}` : ""}
                  <span className="ml-1 text-[var(--text-faint)]">· {formatTimeAgo(e.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
