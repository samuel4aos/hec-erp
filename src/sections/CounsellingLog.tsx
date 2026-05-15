import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, X, Calendar, CheckCircle2, Clock } from "lucide-react";
import { api } from "../utils/api";

interface CounsellingEntry {
  id: string;
  member_id: string;
  member_name: string;
  counsellor_name: string;
  visit_date: string;
  visit_type: string;
  notes: string | null;
  follow_up_date: string | null;
  status: string;
}

const VISIT_TYPES = ["counselling", "visitation", "follow_up", "hospital", "home"];

export default function CounsellingLog() {
  const [logs, setLogs] = useState<CounsellingEntry[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ member_id: "", visit_type: "counselling", notes: "", follow_up_date: "" });

  useEffect(() => {
    api.getCounsellingLogs().then(setLogs).catch((e) => console.error("Fetch failed", e));
    api.getMembers().then(setMembers).catch((e) => console.error("Fetch failed", e));
  }, []);

  const submit = async () => {
    if (!form.member_id) return;
    await api.createCounsellingLog(form);
    setShowForm(false);
    setForm({ member_id: "", visit_type: "counselling", notes: "", follow_up_date: "" });
    api.getCounsellingLogs().then(setLogs);
  };

  const closeLog = async (id: string) => {
    await api.updateCounsellingLog(id, { status: "closed" });
    setLogs((prev) => prev.map((l) => (l.id === id ? { ...l, status: "closed" } : l)));
  };

  const filtered = logs.filter(
    (l) =>
      l.member_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.visit_type?.includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <div className="pt-20">
        <div className="text-[11px] tracking-[0.4em] uppercase text-accent/80 mb-3">Admin Portal</div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl heading-text">Counselling & Visitation</h1>
            <p className="mt-3 text-body">Track pastoral visits, counselling sessions, and follow-ups.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 rounded-full btn-primary text-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Log
          </button>
        </div>
        <div className="silver-divider mt-6 max-w-xs" />
      </div>

      <div className="mt-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/60" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by member name..." className="w-full bg-white border border-silver/30 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-silver/50" />
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && <div className="col-span-full text-center py-12 text-body text-sm">No counselling logs yet.</div>}
        {filtered.map((log, i) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
            className={`glass rounded-2xl p-5 ${log.status === "open" ? "border-l-2 border-silver" : "border-l-2 border-accent"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-display text-base text-body">{log.member_name}</div>
                <div className="text-[10px] tracking-widest text-body mt-0.5">by {log.counsellor_name}</div>
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wider ${log.status === "open" ? "bg-accent/20 text-accent" : "bg-accent/20 text-accent"}`}>
                {log.status.toUpperCase()}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/30 text-body border border-silver/20 inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {new Date(log.visit_date).toLocaleDateString()}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/30 text-body border border-silver/20">
                {log.visit_type.replace("_", " ")}
              </span>
            </div>
            {log.notes && <div className="mt-3 text-xs text-body leading-relaxed line-clamp-3">{log.notes}</div>}
            {log.follow_up_date && (
              <div className="mt-2 text-[10px] text-accent/70 inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> Follow-up: {new Date(log.follow_up_date).toLocaleDateString()}
              </div>
            )}
            {log.status === "open" && (
              <button onClick={() => closeLog(log.id)} className="mt-3 w-full py-1.5 rounded-lg text-[10px] glass inline-flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Mark Closed
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {showForm && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowForm(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 z-50 grid place-items-center p-4">
            <div className="w-full max-w-md glass-dark rounded-3xl p-6 border border-silver/30" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="font-display text-lg heading-text">New Counselling Log</div>
                <button onClick={() => setShowForm(false)} className="text-body hover:text-accent"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <label className="block">
                  <div className="text-[10px] tracking-widest text-body uppercase mb-1.5">Member</div>
                  <select value={form.member_id} onChange={(e) => setForm({ ...form, member_id: e.target.value })} className="w-full bg-white border border-silver/30 rounded-lg px-3 py-2 text-sm">
                    <option value="" className="bg-ink">Select member...</option>
                    {members.map((m) => (<option key={m.id} value={m.id} className="bg-ink">{m.first_name} {m.last_name}</option>))}
                  </select>
                </label>
                <label className="block">
                  <div className="text-[10px] tracking-widest text-body uppercase mb-1.5">Type</div>
                  <select value={form.visit_type} onChange={(e) => setForm({ ...form, visit_type: e.target.value })} className="w-full bg-white border border-silver/30 rounded-lg px-3 py-2 text-sm">
                    {VISIT_TYPES.map((v) => (<option key={v} className="bg-ink">{v.replace("_", " ")}</option>))}
                  </select>
                </label>
                <label className="block">
                  <div className="text-[10px] tracking-widest text-body uppercase mb-1.5">Notes</div>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} className="w-full bg-white border border-silver/30 rounded-lg px-3 py-2 text-sm resize-none" />
                </label>
                <label className="block">
                  <div className="text-[10px] tracking-widest text-body uppercase mb-1.5">Follow-up Date (optional)</div>
                  <input type="date" value={form.follow_up_date} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} className="w-full bg-white border border-silver/30 rounded-lg px-3 py-2 text-sm" />
                </label>
              </div>
              <button onClick={submit} className="mt-5 w-full py-3 rounded-full btn-primary text-sm">Save Log</button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
