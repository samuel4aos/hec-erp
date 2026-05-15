import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle2, AlertTriangle, Users, Download } from "lucide-react";
import { api } from "../utils/api";

interface AttendanceRecord {
  id: string;
  member_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  photo_url: string | null;
  check_in_time: string;
  service_type: string;
}

interface CareAlert {
  member: { id: string; first_name: string; last_name: string; phone: string | null };
  missed_streak: number;
}

export default function AttendanceCheckin() {
  const [members, setMembers] = useState<any[]>([]);
  const [today, setToday] = useState<AttendanceRecord[]>([]);
  const [search, setSearch] = useState("");
  const [alerts, setAlerts] = useState<CareAlert[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.getMembers().then(setMembers).catch((e) => console.error("Fetch failed", e));
    api.getTodayAttendance().then(setToday).catch((e) => console.error("Fetch failed", e));
    api.getMissedMembers().then(setAlerts).catch((e) => console.error("Fetch failed", e));
  }, []);

  const checkedInIds = new Set(today.map((r) => r.member_id));
  const filtered = members.filter(
    (m) => `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const checkIn = async (memberId: string) => {
    try {
      await api.checkInMember(memberId);
      setMessage(`${members.find((m) => m.id === memberId)?.first_name} checked in ✓`);
      const updated = await api.getTodayAttendance();
      setToday(updated);
      setTimeout(() => setMessage(""), 2000);
    } catch { setMessage("Check-in failed"); }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <div className="pt-20">
        <div className="text-[11px] tracking-[0.4em] uppercase text-accent/80 mb-3">Admin Portal</div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl heading-text">Attendance Check-In</h1>
            <p className="mt-3 text-body">Check in members for today's service. Missed 3+ Sundays? Care alerts shown below.</p>
          </div>
          <a href={api.exportAttendanceCSV()} download className="px-4 py-2 rounded-full glass text-sm inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </a>
        </div>
        <div className="silver-divider mt-6 max-w-xs" />
      </div>

      {message && (
        <div className="mt-4 px-4 py-2.5 rounded-lg bg-accent/20 border border-accent/40 text-accent text-sm">
          {message}
        </div>
      )}

      <div className="mt-6 grid lg:grid-cols-[1.3fr_1fr] gap-6">
        <div>
          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/60" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search member name..." className="w-full bg-white border border-silver/30 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-silver/50" />
          </div>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
            {filtered.map((m, i) => {
              const checked = checkedInIds.has(m.id);
              return (
                <motion.button
                  key={m.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.01 }}
                  onClick={() => !checked && checkIn(m.id)}
                  disabled={checked}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    checked ? "bg-accent/15 border border-accent/30" : "glass hover:border-silver/50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full grid place-items-center font-display text-sm shrink-0 ${
                    checked ? "bg-accent text-white" : "bg-gradient-to-br from-accent to-accent text-white"
                  }`}>
                    {checked ? <CheckCircle2 className="w-5 h-5" /> : `${m.first_name[0]}${m.last_name[0]}`}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-body font-medium">{m.first_name} {m.last_name}</div>
                    <div className="text-[10px] text-body">{m.phone || m.city || ""}</div>
                  </div>
                  {checked && <span className="ml-auto text-[10px] text-accent font-bold tracking-wider">CHECKED IN</span>}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-accent" />
              <div className="font-display text-base text-body">Today's Check-ins</div>
            </div>
            <div className="font-display text-3xl heading-text">{today.length}</div>
            <div className="text-[10px] uppercase tracking-widest text-body">members checked in</div>
            <div className="mt-3 space-y-1.5 max-h-[300px] overflow-y-auto">
              {today.map((r) => (
                <div key={r.id} className="flex items-center gap-2 text-xs text-body px-2 py-1.5 rounded-lg bg-black/30">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent to-accent grid place-items-center text-[8px] font-display text-white">
                    {r.first_name[0]}{r.last_name[0]}
                  </div>
                  <span>{r.first_name} {r.last_name}</span>
                  <span className="ml-auto text-[9px] text-body">{new Date(r.check_in_time).toLocaleTimeString()}</span>
                </div>
              ))}
              {today.length === 0 && <div className="text-xs text-body text-center py-4">No check-ins yet</div>}
            </div>
          </div>

          {alerts.length > 0 && (
            <div className="glass-dark rounded-2xl p-5 border-l-2 border-accent-light">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-accent" />
                <div className="font-display text-base text-body">Care Alerts</div>
              </div>
              <div className="space-y-2">
                {alerts.map((a) => (
                  <div key={a.member.id} className="text-sm text-body px-3 py-2 rounded-lg bg-black/30 border border-accent/30">
                    <span className="text-accent font-semibold">{a.member.first_name} {a.member.last_name}</span>
                    <span className="text-body"> — missed {a.missed_streak} consecutive Sundays</span>
                    {a.member.phone && <div className="text-[10px] text-body mt-0.5">{a.member.phone}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
