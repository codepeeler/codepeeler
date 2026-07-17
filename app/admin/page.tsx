import { Users, UserCheck, Wrench, FolderKanban, DollarSign, Zap } from "lucide-react";
import { TOOLS } from "@/lib/data/tools";

type StatCard = { label: string; value: string; delta: string; icon: typeof Users; tint: string; flat?: boolean };

const STATS: StatCard[] = [
  { label: "Total Users", value: "128,450", delta: "+12.5%", icon: Users, tint: "#6D5DF6" },
  { label: "Active Users (30d)", value: "32,782", delta: "+8.2%", icon: UserCheck, tint: "#22C55E" },
  { label: "Total Tools", value: String(TOOLS.length), delta: "live count", icon: Wrench, tint: "#4F9DFF", flat: true },
  { label: "Workspaces Created", value: "8,754", delta: "+15.8%", icon: FolderKanban, tint: "#F59E0B" },
  { label: "Revenue (MRR)", value: "\u20b924,590", delta: "+18.6%", icon: DollarSign, tint: "#22C55E" },
  { label: "API Requests", value: "2.45M", delta: "+22.4%", icon: Zap, tint: "#A78BFA" },
];

const TOP_TOOLS = [
  { name: "JSON Formatter", badge: "{ }", runs: "1.25M", users: "24,532" },
  { name: "Regex Tester", badge: ".*", runs: "870K", users: "18,930" },
  { name: "JWT Decoder", badge: "JWT", runs: "456K", users: "11,352" },
  { name: "Base64 Encode/Decode", badge: "64", runs: "432K", users: "10,982" },
  { name: "UUID Generator", badge: "id", runs: "398K", users: "9,741" },
];

const COUNTRIES = [
  { name: "India", pct: 38.6, color: "#6D5DF6" },
  { name: "United States", pct: 21.4, color: "#22C55E" },
  { name: "Brazil", pct: 6.7, color: "#F59E0B" },
  { name: "Germany", pct: 4.8, color: "#4F9DFF" },
  { name: "Others", pct: 28.5, color: "#5D5F6B" },
];

const NEW_USERS = [
  { email: "sarah.johnson@example.com", when: "2 mins ago" },
  { email: "rohit.kumar@example.com", when: "15 mins ago" },
  { email: "alex.miller@example.com", when: "32 mins ago" },
  { email: "priya.sharma@example.com", when: "1 hour ago" },
  { email: "james.brown@example.com", when: "2 hours ago" },
];

const RECENT_ACTIVITY = [
  { title: "New user registered", detail: "sarah.johnson@example.com", when: "2 mins ago" },
  { title: "Tool executed", detail: "JSON Formatter executed by rohit.kumar@example.com", when: "5 mins ago" },
  { title: "Workspace created", detail: "New workspace \"My Project\" created", when: "15 mins ago" },
  { title: "Feedback received", detail: "\"Great platform! Very useful.\"", when: "2 hours ago" },
];

const SERIES_A = [22, 28, 24, 32, 27, 34, 30, 36, 31, 29, 35, 33];
const SERIES_B = [12, 15, 13, 17, 14, 18, 16, 19, 17, 15, 18, 17];

function sparkPath(values: number[], w: number, h: number, max: number) {
  const step = w / (values.length - 1);
  return values.map((v, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (v / max) * h}`).join(" ");
}

export default function AdminDashboardPage() {
  const donutTotal = COUNTRIES.reduce((s, c) => s + c.pct, 0);
  let acc = 0;
  const segments = COUNTRIES.map((c) => {
    const start = (acc / donutTotal) * 360;
    acc += c.pct;
    const end = (acc / donutTotal) * 360;
    return { ...c, start, end };
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-[14px] border border-[#24262E] bg-[#111318] p-4">
              <div
                className="mb-3 flex h-8 w-8 items-center justify-center rounded-[8px]"
                style={{ backgroundColor: `${s.tint}1A` }}
              >
                <Icon size={15} style={{ color: s.tint }} />
              </div>
              <div className="text-[11.5px] text-[#9A9CA6]">{s.label}</div>
              <div className="mt-1 text-[20px] font-bold text-[#F4F4F6]">{s.value}</div>
              <div className={`mt-1 text-[11px] ${s.flat ? "text-[#5D5F6B]" : "text-[#22C55E]"}`}>
                {!s.flat && "\u2191 "}
                {s.delta}
                {!s.flat && " from last 30 days"}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        <div className="rounded-[14px] border border-[#24262E] bg-[#111318] p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[13.5px] font-semibold text-[#F4F4F6]">Overview Analytics</h3>
            <div className="flex items-center gap-3 text-[11.5px] text-[#9A9CA6]">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#6D5DF6]" /> Users
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#22C55E]" /> Page Views
              </span>
            </div>
          </div>
          <svg viewBox="0 0 600 180" className="w-full" preserveAspectRatio="none">
            <path d={sparkPath(SERIES_B, 600, 170, 40)} fill="none" stroke="#6D5DF6" strokeWidth="2" />
            <path d={sparkPath(SERIES_A, 600, 170, 40)} fill="none" stroke="#22C55E" strokeWidth="2" />
          </svg>
        </div>

        <div className="rounded-[14px] border border-[#24262E] bg-[#111318] p-4">
          <h3 className="mb-4 text-[13.5px] font-semibold text-[#F4F4F6]">Top Tools (by usage)</h3>
          <div className="flex flex-col gap-3">
            {TOP_TOOLS.map((t) => (
              <div key={t.name} className="flex items-center gap-3">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[7px] bg-[#6D5DF61A] text-[10px] font-bold text-[#6D5DF6]">
                  {t.badge}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-medium text-[#F4F4F6]">{t.name}</div>
                  <div className="text-[11px] text-[#5D5F6B]">{t.users} users</div>
                </div>
                <div className="flex-shrink-0 text-[12px] font-semibold text-[#9A9CA6]">{t.runs}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-[14px] border border-[#24262E] bg-[#111318] p-4">
          <h3 className="mb-4 text-[13.5px] font-semibold text-[#F4F4F6]">Users by Country</h3>
          <div className="flex items-center gap-5">
            <svg viewBox="0 0 100 100" className="h-[100px] w-[100px] flex-shrink-0">
              {segments.map((s) => {
                const r = 40;
                const toXY = (deg: number) => {
                  const rad = ((deg - 90) * Math.PI) / 180;
                  return [50 + r * Math.cos(rad), 50 + r * Math.sin(rad)];
                };
                const [x1, y1] = toXY(s.start);
                const [x2, y2] = toXY(s.end);
                const large = s.end - s.start > 180 ? 1 : 0;
                return (
                  <path
                    key={s.name}
                    d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="16"
                  />
                );
              })}
            </svg>
            <div className="flex flex-1 flex-col gap-2">
              {COUNTRIES.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-2 text-[#9A9CA6]">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </span>
                  <span className="font-semibold text-[#F4F4F6]">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[14px] border border-[#24262E] bg-[#111318] p-4">
          <h3 className="mb-4 text-[13.5px] font-semibold text-[#F4F4F6]">New Users</h3>
          <div className="flex flex-col gap-3">
            {NEW_USERS.map((u) => (
              <div key={u.email} className="flex items-center gap-3">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#4F9DFF1A] text-[11px] font-bold text-[#4F9DFF]">
                  {u.email[0].toUpperCase()}
                </div>
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-[#F4F4F6]">{u.email}</span>
                <span className="flex-shrink-0 text-[11px] text-[#5D5F6B]">{u.when}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[14px] border border-[#24262E] bg-[#111318] p-4">
        <h3 className="mb-4 text-[13.5px] font-semibold text-[#F4F4F6]">Recent Activity</h3>
        <div className="flex flex-col gap-3">
          {RECENT_ACTIVITY.map((a) => (
            <div key={a.title + a.when} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[12.5px] font-medium text-[#F4F4F6]">{a.title}</div>
                <div className="truncate text-[11.5px] text-[#5D5F6B]">{a.detail}</div>
              </div>
              <span className="flex-shrink-0 text-[11px] text-[#5D5F6B]">{a.when}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-[14px] border border-[#24262E] bg-[#111318] p-4">
          <div className="text-[11.5px] text-[#9A9CA6]">System Status</div>
          <div className="mt-2 inline-block rounded-[6px] bg-[#22C55E1A] px-2 py-0.5 text-[11px] font-semibold text-[#22C55E]">
            All Systems Operational
          </div>
        </div>
        <div className="rounded-[14px] border border-[#24262E] bg-[#111318] p-4">
          <div className="text-[11.5px] text-[#9A9CA6]">Server Load</div>
          <div className="mt-2 text-[15px] font-bold text-[#F4F4F6]">23%</div>
          <div className="mt-1.5 h-1.5 rounded-full bg-[#1A1C22]">
            <div className="h-1.5 rounded-full bg-[#22C55E]" style={{ width: "23%" }} />
          </div>
        </div>
        <div className="rounded-[14px] border border-[#24262E] bg-[#111318] p-4">
          <div className="text-[11.5px] text-[#9A9CA6]">Storage Used</div>
          <div className="mt-2 text-[15px] font-bold text-[#F4F4F6]">45%</div>
          <div className="mt-1.5 h-1.5 rounded-full bg-[#1A1C22]">
            <div className="h-1.5 rounded-full bg-[#6D5DF6]" style={{ width: "45%" }} />
          </div>
        </div>
        <div className="rounded-[14px] border border-[#24262E] bg-[#111318] p-4">
          <div className="text-[11.5px] text-[#9A9CA6]">Database</div>
          <div className="mt-2 inline-block rounded-[6px] bg-[#22C55E1A] px-2 py-0.5 text-[11px] font-semibold text-[#22C55E]">Healthy</div>
        </div>
      </div>
    </div>
  );
}
