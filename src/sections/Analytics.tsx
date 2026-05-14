import { Header } from "./LiveStream";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { TrendingUp, Users, DollarSign, UserPlus } from "lucide-react";
import { api } from "../utils/api";

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const COLORS = ["#d4af37", "#a32020", "#006400", "#f0cf5e", "#800000", "#3b82f6"];

function pivotByMonth<T extends Record<string, any>>(
  rows: T[],
  categoryKey: keyof T,
  valueKey: keyof T,
): Record<string, any>[] {
  const map = new Map<string, Record<string, any>>();
  for (const r of rows) {
    const m = r.m as string;
    if (!m) continue;
    if (!map.has(m)) map.set(m, { m });
    map.get(m)![String(r[categoryKey])] = r[valueKey];
  }
  return months.filter(m => map.has(m)).map(m => map.get(m)!);
}

function heatColor(v: number) {
  if (v < 20) return "rgba(128,0,0,0.25)";
  if (v < 40) return "rgba(128,0,0,0.55)";
  if (v < 60) return "rgba(163,32,32,0.85)";
  if (v < 80) return "rgba(212,175,55,0.7)";
  return "rgba(240,207,94,0.95)";
}

export default function Analytics() {
  const [memberCount, setMemberCount] = useState(84210);
  const [branchCount, setBranchCount] = useState(142);
  const [givingTotal, setGivingTotal] = useState(2410000);
  const [firstTimerCount, setFirstTimerCount] = useState(1884);

  const [attendance, setAttendance] = useState<Record<string,any>[]>([]);
  const [finance, setFinance] = useState<Record<string,any>[]>([]);
  const [conversions, setConversions] = useState<Record<string,any>[]>([]);
  const [split, setSplit] = useState<{name:string;value:number;color:string}[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [weeks, setWeeks] = useState<string[]>([]);
  const [heatmap, setHeatmap] = useState<number[][]>([]);

  useEffect(() => {
    api.getMembers().then(r => setMemberCount(r.length)).catch(() => {});
    api.getBranches().then(r => setBranchCount(r.length)).catch(() => {});
    api.getGiving().then(r => {
      const total = r.reduce((s: number, g: any) => s + Number(g.amount), 0);
      setGivingTotal(total);
    }).catch(() => {});
    api.getFirstTimers().then(r => setFirstTimerCount(r.length)).catch(() => {});

    api.getAttendanceVelocity().then(rows => {
      setAttendance(pivotByMonth(rows, 'branch', 'total'));
    }).catch(() => {});

    api.getFinancialTrends().then(rows => {
      setFinance(pivotByMonth(rows, 'purpose', 'total'));
    }).catch(() => {});

    api.getSoulsTrends().then(data => {
      const soulMap = new Map(data.souls.map((s: any) => [s.m, s.souls]));
      const retainMap = new Map(data.retained.map((r: any) => [r.m, r.retained]));
      const merged = months
        .filter(m => soulMap.has(m) || retainMap.has(m))
        .map(m => ({ m, souls: soulMap.get(m) || 0, retained: retainMap.get(m) || 0 }));
      setConversions(merged);
    }).catch(() => {});

    api.getDemographics().then(data => {
      setSplit(data.split);
    }).catch(() => {});

    api.getHeatmap().then(rows => {
      const branchSet = new Set<string>();
      const weekSet = new Set<number>();
      const map = new Map<string, Map<number, number>>();
      for (const r of rows) {
        branchSet.add(r.branch);
        weekSet.add(r.week_num);
        if (!map.has(r.branch)) map.set(r.branch, new Map());
        map.get(r.branch)!.set(r.week_num, r.total);
      }
      const bList = [...branchSet].slice(0, 10);
      const wList = [...weekSet].sort();
      const maxVal = Math.max(...rows.map((r: any) => r.total), 1);
      const hm = bList.map(b =>
        wList.map(w => Math.round(((map.get(b)?.get(w) || 0) / maxVal) * 100))
      );
      setBranches(bList);
      setWeeks(wList.map(w => `W${w}`));
      setHeatmap(hm);
    }).catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <Header
        title="Growth Analytics"
        subtitle="HQ-only intelligence: attendance velocity, financial reconciliation, and conversion retention across the global network."
      />

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total Members", value: memberCount.toLocaleString(), color: "#d4af37" },
          { icon: DollarSign, label: "Total Giving", value: `$${(givingTotal / 1000).toFixed(1)}K`, color: "#006400" },
          { icon: UserPlus, label: "First-timers", value: firstTimerCount.toLocaleString(), color: "#800000" },
          { icon: TrendingUp, label: "Active Branches", value: branchCount.toString(), color: "#a32020" },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="glass rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg grid place-items-center" style={{ background: k.color }}>
                <k.icon className="w-4 h-4 text-parchment" />
              </div>
            </div>
            <div className="font-display text-2xl gold-text mt-3">{k.value}</div>
            <div className="text-[11px] uppercase tracking-widest text-parchment/55">{k.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <ChartHead title="Attendance Velocity · branches" />
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={attendance}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a32020" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#a32020" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#006400" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#006400" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g4" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f0cf5e" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f0cf5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.08)" />
              <XAxis dataKey="m" stroke="#d4af37" tick={{ fill: "#cfc1a0", fontSize: 11 }} />
              <YAxis stroke="#d4af37" tick={{ fill: "#cfc1a0", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              {attendance.length > 0 && Object.keys(attendance[0]).filter(k => k !== 'm').map((k, i) => (
                <Area key={k} dataKey={k} stroke={COLORS[i % COLORS.length]} fill={`url(${['#g1','#g2','#g3','#g4'][i % 4]})`} strokeWidth={2} />
              ))}
              <Legend wrapperStyle={{ fontSize: 11, color: "#cfc1a0" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-5">
          <ChartHead title="Congregation split" />
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={split}
                dataKey="value"
                outerRadius={95}
                innerRadius={55}
                paddingAngle={3}
                stroke="none"
              >
                {split.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#cfc1a0" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <ChartHead title="Financial reconciliation (USD · 000s)" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={finance}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.08)" />
              <XAxis dataKey="m" stroke="#d4af37" tick={{ fill: "#cfc1a0", fontSize: 11 }} />
              <YAxis stroke="#d4af37" tick={{ fill: "#cfc1a0", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#cfc1a0" }} />
              {finance.length > 0 && Object.keys(finance[0]).filter(k => k !== 'm').map((k, i) => (
                <Bar key={k} dataKey={k} fill={COLORS[i % COLORS.length]} radius={[6, 6, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-5">
          <ChartHead title="Souls won vs retained" />
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={conversions}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.08)" />
              <XAxis dataKey="m" stroke="#d4af37" tick={{ fill: "#cfc1a0", fontSize: 11 }} />
              <YAxis stroke="#d4af37" tick={{ fill: "#cfc1a0", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="souls" stroke="#d4af37" strokeWidth={2.5} dot={{ r: 3, fill: "#d4af37" }} />
              <Line type="monotone" dataKey="retained" stroke="#006400" strokeWidth={2.5} dot={{ r: 3, fill: "#006400" }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#cfc1a0" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap */}
      <div className="mt-6 glass rounded-2xl p-5">
        <ChartHead title="Branch attendance heatmap · last 4 weeks" />
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[140px_repeat(4,1fr)] gap-2 mb-2 text-[11px] text-parchment/55 uppercase tracking-widest">
              <div></div>
              {weeks.map((w) => (
                <div key={w} className="text-center">{w}</div>
              ))}
            </div>
            {branches.map((b, i) => (
              <div key={b} className="grid grid-cols-[140px_repeat(4,1fr)] gap-2 mb-1.5 items-center">
                <div className="text-xs text-parchment/85">{b}</div>
                {heatmap[i]?.map((v, k) => (
                  <div
                    key={k}
                    className="h-9 rounded-md grid place-items-center text-[11px] font-display border border-gold/15"
                    style={{ background: heatColor(v), color: v > 60 ? "#1a0a0a" : "#f8f3e3" }}
                    title={`${b} · ${weeks[k]}: ${v}%`}
                  >
                    {v}%
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-[11px] text-parchment/60">
          <span>Lower</span>
          <div className="flex-1 h-2 rounded-full" style={{ background: "linear-gradient(90deg,#400,#800000,#a32020,#d4af37,#f0cf5e)" }} />
          <span>Higher</span>
        </div>
      </div>
    </div>
  );
}

function ChartHead({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="font-display text-base text-parchment">{title}</div>
      <span className="text-[10px] text-parchment/50">RLS · HQ scope</span>
    </div>
  );
}

const tooltipStyle = {
  background: "rgba(20,8,8,0.92)",
  border: "1px solid rgba(212,175,55,0.4)",
  borderRadius: 8,
  fontSize: 12,
  color: "#f8f3e3",
} as const;
