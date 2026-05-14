import { useEffect, useState } from "react";
import { ScrollText, AlertTriangle, Users, GraduationCap, Send, Calendar } from "lucide-react";
import { api } from "../../utils/api";

export default function PastorWorkspace() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [counselling, setCounselling] = useState<any[]>([]);
  const [firstTimers, setFirstTimers] = useState<any[]>([]);

  useEffect(() => {
    api.getMissedMembers().then(setAlerts).catch((e) => console.error("Fetch failed", e));
    api.getCounsellingLogs().then(setCounselling).catch((e) => console.error("Fetch failed", e));
    api.getFirstTimerStats().then(() => {}).catch((e) => console.error("Fetch failed", e));
    api.getFirstTimers().then(setFirstTimers).catch((e) => console.error("Fetch failed", e));
  }, []);

  const pipeline = [
    { label: "First Timers", count: firstTimers.filter((f: any) => f.follow_up_status === "new").length, color: "#d4af37" },
    { label: "Contacted", count: firstTimers.filter((f: any) => f.follow_up_status === "contacted").length, color: "#a32020" },
    { label: "Visited", count: firstTimers.filter((f: any) => f.follow_up_status === "visited").length, color: "#006400" },
    { label: "Enrolled", count: firstTimers.filter((f: any) => f.follow_up_status === "enrolled").length, color: "#2a8c2a" },
  ];

  const maxPipeline = Math.max(...pipeline.map((p) => p.count), 1);

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-10 pt-20">
      <div className="flex items-center gap-2 text-gold/80 text-[11px] tracking-[0.4em] uppercase mb-3">
        <ScrollText className="w-4 h-4" /> Branch Pastor
      </div>
      <h1 className="font-display text-4xl md:text-5xl gold-text">Pastoral Dashboard</h1>
      <div className="gold-divider mt-4 max-w-xs" />

      <div className="mt-8 grid lg:grid-cols-[1.3fr_1fr] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Care Alerts */}
          {alerts.length > 0 && (
            <div className="glass-dark rounded-2xl p-5 border-l-2 border-maroon-light">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-maroon-light" />
                <div className="font-display text-lg text-parchment">Care Alerts</div>
                <span className="text-xs text-maroon-light font-bold ml-auto">{alerts.length}</span>
              </div>
              <div className="space-y-2">
                {alerts.map((a: any) => (
                  <div key={a.member.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black/30 border border-maroon/20">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-maroon to-gold grid place-items-center text-[10px] font-display text-ink">
                      {a.member.first_name[0]}{a.member.last_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-parchment">{a.member.first_name} {a.member.last_name}</div>
                      <div className="text-[10px] text-parchment/50">Missed {a.missed_streak} consecutive Sundays {a.member.phone ? `· ${a.member.phone}` : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Counselling */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-display text-lg text-parchment inline-flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold" /> Counselling Schedule
              </div>
            </div>
            {counselling.filter((c: any) => c.status === "open").length === 0 ? (
              <div className="text-sm text-parchment/50 text-center py-6">No open counselling sessions</div>
            ) : (
              <div className="space-y-2">
                {counselling.filter((c: any) => c.status === "open").map((c: any) => (
                  <div key={c.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black/30 border border-gold/10">
                    <div className="text-sm text-parchment flex-1">{c.member_name}</div>
                    <span className="text-[10px] text-parchment/50">{new Date(c.visit_date).toLocaleDateString()}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold">{c.visit_type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Discipleship Pipeline */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-gold" />
              <div className="font-display text-lg text-parchment">Discipleship Pipeline</div>
            </div>
            <div className="space-y-3">
              {pipeline.map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-parchment/85">{s.label}</span>
                    <span className="font-display gold-text">{s.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-black/40 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(s.count / maxPipeline) * 100}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Academy Alert */}
          <div className="glass-dark rounded-2xl p-5 border-l-2 border-verdant">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-verdant-light" />
              <div className="text-[10px] tracking-widest text-verdant-light uppercase">Academy</div>
            </div>
            <div className="text-sm text-parchment">
              <span className="text-gold">Sis. Joy Ngozi</span> just completed{" "}
              <span className="font-display">NC-101</span>. Schedule her water baptism?
            </div>
            <div className="mt-3 flex gap-2">
              <button className="px-3 py-1.5 rounded-lg btn-gold text-[11px]">Schedule</button>
              <button className="px-3 py-1.5 rounded-lg glass text-[11px]">Later</button>
            </div>
          </div>

          {/* Monthly report */}
          <div className="glass rounded-2xl p-5">
            <div className="font-display text-lg text-parchment mb-2">Monthly Report</div>
            <p className="text-xs text-parchment/60 mb-3">Submit your qualitative monthly report to HQ.</p>
            <button className="w-full py-3 rounded-full btn-gold text-sm inline-flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Submit Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
