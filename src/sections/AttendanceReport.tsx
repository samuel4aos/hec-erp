import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, AlertTriangle, Download, Search } from "lucide-react";
import { api } from "../utils/api";
import { useAuth } from "../store/auth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface MemberSummary {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  photo_url: string | null;
  email: string | null;
  total_sundays: number;
  attended: number;
  missed: number;
  attendance_rate: number;
  last_attended: string | null;
  needs_care: boolean;
}

export default function AttendanceReport() {
  const { user } = useAuth();
  const [data, setData] = useState<{ members: MemberSummary[]; monthlyTrend: any[]; totalSundays: number } | null>(null);
  const [search, setSearch] = useState("");
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");

  useEffect(() => {
    if (user?.role === "hq_admin") {
      api.getBranches().then(setBranches).catch(() => {});
    }
  }, []);

  useEffect(() => {
    api.getAttendanceSummary(selectedBranch || undefined).then(setData).catch(() => {});
  }, [selectedBranch]);

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
        <div className="pt-20 text-center text-parchment/50">Loading attendance report...</div>
      </div>
    );
  }

  const { members, monthlyTrend, totalSundays } = data;
  const totalMembers = members.length;
  const avgAttendance = totalMembers ? Math.round(members.reduce((s, m) => s + m.attendance_rate, 0) / totalMembers) : 0;
  const careAlerts = members.filter((m) => m.needs_care);
  const filtered = members.filter(
    (m) => `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  // Sort: lowest attendance first
  const sorted = [...filtered].sort((a, b) => a.attendance_rate - b.attendance_rate);

  const csvData = members.map((m) => `${m.first_name},${m.last_name},${m.phone||""},${m.total_sundays},${m.attended},${m.missed},${m.attendance_rate}%,${m.last_attended||""}`);
  const csvHeader = "First Name,Last Name,Phone,Total Sundays,Attended,Missed,Rate,Last Attended";

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <div className="pt-20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl gold-text">Attendance Report</h1>
            <p className="mt-3 text-parchment/65">
              {totalSundays} Sunday services tracked · {totalMembers} active members · {avgAttendance}% avg attendance
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user?.role === "hq_admin" && branches.length > 0 && (
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-black/40 border border-gold/15 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-gold/50 text-parchment"
              >
                <option value="">All Branches</option>
                {branches.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent([csvHeader, ...csvData].join("\n"))}`}
              download="attendance-report.csv"
              className="px-4 py-2 rounded-full glass text-sm inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> CSV
            </a>
          </div>
        </div>
        <div className="gold-divider mt-6 max-w-xs" />
      </div>

      {/* Summary cards */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Members", value: totalMembers, icon: Users, color: "text-gold" },
          { label: "Avg Attendance Rate", value: `${avgAttendance}%`, icon: TrendingUp, color: "text-verdant-light" },
          { label: "Missed Last Week", value: members.filter((m) => m.attended === 0).length, icon: AlertTriangle, color: "text-maroon-light" },
          { label: "Care Alerts", value: careAlerts.length, icon: BarChart3, color: "text-gold" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <div className="text-[10px] tracking-widest uppercase text-parchment/60">{s.label}</div>
            </div>
            <div className="font-display text-2xl gold-text">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Monthly trend chart */}
      {monthlyTrend.length > 0 && (
        <div className="mt-8 glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-gold" />
            <div className="font-display text-base text-parchment">Monthly Attendance Trend</div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer>
              <AreaChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="month" tick={{ fill: "#ffffff60", fontSize: 11 }} />
                <YAxis tick={{ fill: "#ffffff60", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#1a0a0a", border: "1px solid #d4af3740", borderRadius: 12, fontSize: 13 }}
                  labelStyle={{ color: "#d4af37" }}
                />
                <Area type="monotone" dataKey="total" stroke="#d4af37" fill="#d4af3720" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Per-member table */}
      <div className="mt-8 glass-dark rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gold/15 flex items-center gap-3">
          <Search className="w-4 h-4 text-gold/60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member..."
            className="flex-1 bg-transparent text-sm focus:outline-none text-parchment placeholder:text-parchment/40"
          />
          <span className="text-[10px] text-parchment/50">{sorted.length} members</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/15 text-[10px] uppercase tracking-widest text-parchment/50">
                <th className="text-left px-4 py-3 font-medium">Member</th>
                <th className="text-center px-3 py-3 font-medium">Sundays</th>
                <th className="text-center px-3 py-3 font-medium">Attended</th>
                <th className="text-center px-3 py-3 font-medium">Missed</th>
                <th className="text-center px-3 py-3 font-medium">Rate</th>
                <th className="text-right px-4 py-3 font-medium">Last Attended</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-parchment/40">No members match your search</td></tr>
              )}
              {sorted.map((m, i) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.005 }}
                  className={`border-b border-gold/5 hover:bg-white/5 transition ${
                    m.needs_care ? "bg-maroon/10" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-maroon grid place-items-center text-[9px] font-display text-ink shrink-0">
                        {m.first_name[0]}{m.last_name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="text-parchment text-sm">{m.first_name} {m.last_name}</div>
                        {m.phone && <div className="text-[10px] text-parchment/40">{m.phone}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="text-center px-3 py-3 text-parchment/80">{m.total_sundays}</td>
                  <td className="text-center px-3 py-3 text-verdant-light">{m.attended}</td>
                  <td className="text-center px-3 py-3 text-maroon-light">{m.missed}</td>
                  <td className="text-center px-3 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-black/40 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${m.attendance_rate >= 70 ? "bg-verdant" : m.attendance_rate >= 40 ? "bg-gold" : "bg-maroon-light"}`}
                          style={{ width: `${m.attendance_rate}%` }}
                        />
                      </div>
                      <span className={`text-[11px] font-mono ${m.attendance_rate >= 70 ? "text-verdant-light" : m.attendance_rate >= 40 ? "text-gold" : "text-maroon-light"}`}>
                        {m.attendance_rate}%
                      </span>
                    </div>
                  </td>
                  <td className="text-right px-4 py-3 text-parchment/50 text-[11px]">
                    {m.last_attended ? new Date(m.last_attended).toLocaleDateString() : "—"}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Care alerts section */}
      {careAlerts.length > 0 && (
        <div className="mt-6 glass-dark rounded-2xl p-5 border-l-2 border-maroon-light">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-maroon-light" />
            <div className="font-display text-base text-parchment">Care Alerts — {careAlerts.length} members need attention</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {careAlerts.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black/30 border border-maroon/20 text-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-maroon to-gold grid place-items-center text-[9px] font-display text-ink shrink-0">
                  {m.first_name[0]}{m.last_name[0]}
                </div>
                <div className="min-w-0">
                  <div className="text-parchment">{m.first_name} {m.last_name}</div>
                  <div className="text-[10px] text-parchment/50">{m.attended}/{m.total_sundays} attended · {m.phone || ""}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
