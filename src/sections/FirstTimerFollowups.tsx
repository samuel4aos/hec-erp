import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Phone, CheckCircle2, ArrowRight } from "lucide-react";
import { api } from "../utils/api";

interface FirstTimer {
  id: string;
  full_name: string;
  phone: string | null;
  invited_by: string | null;
  service_date: string;
  follow_up_status: string;
  branch_name: string;
  welcome_sms_sent: boolean;
}

interface Stats {
  follow_up_status: string;
  count: number;
}

const STATUS_ORDER = ["new", "contacted", "visited", "enrolled"];
const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  visited: "Visited",
  enrolled: "Enrolled",
};
const STATUS_COLORS: Record<string, string> = {
  new: "#d4af37",
  contacted: "#a32020",
  visited: "#006400",
  enrolled: "#2a8c2a",
};
const NEXT_STATUS: Record<string, string> = {
  new: "contacted",
  contacted: "visited",
  visited: "enrolled",
  enrolled: "enrolled",
};

export default function FirstTimerFollowups() {
  const [firstTimers, setFirstTimers] = useState<FirstTimer[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getFirstTimers().then(setFirstTimers).catch((e) => console.error("Fetch failed", e));
    api.getFirstTimerStats().then(setStats).catch((e) => console.error("Fetch failed", e));
  }, []);

  const advanceStatus = async (id: string, current: string) => {
    const next = NEXT_STATUS[current] || current;
    if (next === current) return;
    await api.updateFirstTimerStatus(id, { follow_up_status: next });
    setFirstTimers((prev) => prev.map((f) => (f.id === id ? { ...f, follow_up_status: next } : f)));
    api.getFirstTimerStats().then(setStats).catch((e) => console.error("Fetch failed", e));
  };

  const total = stats.reduce((s, st) => s + st.count, 0);
  const filtered = firstTimers.filter(
    (f) =>
      f.full_name.toLowerCase().includes(search.toLowerCase()) ||
      f.phone?.includes(search) ||
      f.branch_name?.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    color: STATUS_COLORS[status],
    count: stats.find((s) => s.follow_up_status === status)?.count || 0,
    items: filtered.filter((f) => f.follow_up_status === status),
  }));

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <div className="pt-20">
        <div className="text-[11px] tracking-[0.4em] uppercase text-accent/80 mb-3">
          Admin Portal
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl heading-text">First-Timer Pipeline</h1>
            <p className="mt-3 text-body max-w-2xl">
              Track every first-timer from welcome to full membership.
            </p>
          </div>
        </div>
        <div className="silver-divider mt-6 max-w-xs" />
      </div>

      {/* Stats bar */}
      <div className="mt-6 grid grid-cols-4 gap-3">
        <div className="glass rounded-xl p-4">
          <div className="font-display text-2xl heading-text">{total}</div>
          <div className="text-[10px] uppercase tracking-widest text-body">Total Pipeline</div>
        </div>
        {STATUS_ORDER.map((s) => (
          <div key={s} className="glass rounded-xl p-4">
            <div className="font-display text-2xl" style={{ color: STATUS_COLORS[s] }}>
              {stats.find((st) => st.follow_up_status === s)?.count || 0}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-body">{STATUS_LABELS[s]}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/60" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone, or branch..." className="w-full bg-white border border-silver/30 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent/50" />
      </div>

      {/* Kanban pipeline */}
      <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {grouped.map((col) => (
          <div key={col.status} className="glass-dark rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="text-xs font-semibold text-body">{col.label}</span>
              </div>
              <span className="text-[10px] font-display text-body">{col.count}</span>
            </div>
            <div className="space-y-2 min-h-[200px] max-h-[600px] overflow-y-auto">
              {col.items.length === 0 && (
                <div className="text-[11px] text-body text-center py-6">None</div>
              )}
              {col.items.map((ft) => (
                <motion.div
                  key={ft.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-xl p-3"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent grid place-items-center text-[9px] font-display text-white shrink-0">
                      {ft.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-body font-medium truncate">{ft.full_name}</div>
                      {ft.phone && <div className="text-[10px] text-body truncate inline-flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> {ft.phone}</div>}
                      {ft.invited_by && <div className="text-[9px] text-body">by {ft.invited_by}</div>}
                      <div className="text-[9px] text-body mt-1">{ft.branch_name} · {new Date(ft.service_date).toLocaleDateString()}</div>
                      {ft.welcome_sms_sent && <div className="text-[9px] text-accent mt-0.5">✓ SMS sent</div>}
                    </div>
                  </div>
                  {col.status !== "enrolled" && (
                    <button
                      onClick={() => advanceStatus(ft.id, ft.follow_up_status)}
                      className="mt-2 w-full py-1.5 rounded-lg text-[10px] inline-flex items-center justify-center gap-1 transition"
                      style={{
                        background: `${STATUS_COLORS[NEXT_STATUS[ft.follow_up_status] || "enrolled"]}25`,
                        color: STATUS_COLORS[NEXT_STATUS[ft.follow_up_status] || "enrolled"],
                        border: `1px solid ${STATUS_COLORS[NEXT_STATUS[ft.follow_up_status] || "enrolled"]}40`,
                      }}
                    >
                      Move to {STATUS_LABELS[NEXT_STATUS[ft.follow_up_status] || "enrolled"]} <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  {col.status === "enrolled" && (
                    <div className="mt-2 text-[9px] text-accent text-center inline-flex items-center justify-center gap-1 w-full py-1">
                      <CheckCircle2 className="w-3 h-3" /> Discipled
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
