import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Plus, X, TrendingUp, Crown, Medal } from "lucide-react";
import { api } from "../utils/api";

interface LeaderboardEntry {
  id: string;
  first_name: string;
  last_name: string;
  souls_won: number;
  photo_url: string | null;
}

export default function SoulWinningTracker() {
  const [souls, setSouls] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myStats, setMyStats] = useState({ monthly: 0, total: 0, target: 5 });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ soul_name: "", soul_phone: "", notes: "" });
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState("");

  useEffect(() => {
    api.getSoulWinning().then(setSouls).catch((e) => console.error("Fetch failed", e));
    api.getSoulLeaderboard().then(setLeaderboard).catch((e) => console.error("Fetch failed", e));
    api.getMySoulStats().then(setMyStats).catch((e) => console.error("Fetch failed", e));
    api.getMembers().then(setMembers).catch((e) => console.error("Fetch failed", e));
  }, []);

  const submit = async () => {
    if (!form.soul_name || !selectedMember) return;
    await api.logSoulWon({ ...form, member_id: selectedMember });
    setShowForm(false);
    setForm({ soul_name: "", soul_phone: "", notes: "" });
    api.getSoulWinning().then(setSouls);
    api.getSoulLeaderboard().then(setLeaderboard);
    api.getMySoulStats().then(setMyStats);
  };

  const setTarget = async () => {
    const t = prompt("Set your monthly soul-winning target:", String(myStats.target));
    if (t && !isNaN(Number(t))) {
      await api.setSoulTarget({ target: Number(t) });
      setMyStats((s) => ({ ...s, target: Number(t) }));
    }
  };

  const rankIcon = (i: number) => {
    if (i === 0) return <Crown className="w-4 h-4 text-accent" />;
    if (i === 1) return <Medal className="w-4 h-4 text-body" />;
    if (i === 2) return <Medal className="w-4 h-4 text-amber-700" />;
    return <span className="text-[10px] text-body w-4 text-center">{i + 1}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <div className="pt-20">
        <div className="text-[11px] tracking-[0.4em] uppercase text-accent/80 mb-3">Admin Portal</div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl heading-text">Soul-Winning Tracker</h1>
            <p className="mt-3 text-body">Log every soul won and compete on the leaderboard.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 rounded-full btn-primary text-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Log Soul Won
          </button>
        </div>
        <div className="silver-divider mt-6 max-w-xs" />
      </div>

      {/* My stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="glass rounded-xl p-4">
          <div className="font-display text-2xl heading-text">{myStats.monthly}</div>
          <div className="text-[10px] uppercase tracking-widest text-body">This Month</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="font-display text-2xl" style={{ color: myStats.monthly >= myStats.target ? "#006400" : "#a32020" }}>
            {myStats.monthly}/{myStats.target}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-body">
            Target {myStats.monthly >= myStats.target ? "✓ DONE" : "PENDING"}
            <button onClick={setTarget} className="ml-2 text-accent underline">set</button>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="font-display text-2xl text-body">{myStats.total}</div>
          <div className="text-[10px] uppercase tracking-widest text-body">All Time</div>
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-[1.3fr_1fr] gap-6">
        {/* Recent souls won */}
        <div className="glass rounded-2xl p-5">
          <div className="font-display text-lg text-body mb-3">Recently Won</div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {souls.length === 0 && <div className="text-sm text-body text-center py-8">No souls logged yet this month.</div>}
            {souls.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-black/30 border border-silver/10">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-verdant to-accent grid place-items-center text-xs font-display text-heading shrink-0">
                  {s.soul_name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("") || "✦"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-body">{s.soul_name}</div>
                  <div className="text-[10px] text-body">
                    Won by {s.won_by_name} · {new Date(s.date_won).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="glass-dark rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-accent" />
            <div className="font-display text-lg heading-text">Monthly Leaderboard</div>
          </div>
          <div className="space-y-2">
            {leaderboard.length === 0 && <div className="text-sm text-body text-center py-8">No entries yet. Be the first!</div>}
            {leaderboard.map((e, i) => (
              <div key={e.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-black/30 border border-silver/10">
                <div className="w-6 shrink-0 flex justify-center">{rankIcon(i)}</div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent grid place-items-center text-[9px] font-display text-white">
                  {e.first_name[0]}{e.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-body truncate">{e.first_name} {e.last_name}</div>
                </div>
                <div className="font-display text-lg heading-text">{e.souls_won}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showForm && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowForm(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 z-50 grid place-items-center p-4">
            <div className="w-full max-w-md glass-dark rounded-3xl p-6 border border-silver/30" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="font-display text-lg heading-text">Log a Soul Won</div>
                <button onClick={() => setShowForm(false)} className="text-body hover:text-accent"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <label className="block">
                  <div className="text-[10px] tracking-widest text-body uppercase mb-1.5">Won By (Member)</div>
                  <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} className="w-full bg-white border border-silver/30 rounded-lg px-3 py-2 text-sm">
                    <option value="" className="bg-ink">Select member...</option>
                    {members.map((m) => (<option key={m.id} value={m.id} className="bg-ink">{m.first_name} {m.last_name}</option>))}
                  </select>
                </label>
                <label className="block">
                  <div className="text-[10px] tracking-widest text-body uppercase mb-1.5">Soul's Name</div>
                  <input value={form.soul_name} onChange={(e) => setForm({ ...form, soul_name: e.target.value })} className="w-full bg-white border border-silver/30 rounded-lg px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <div className="text-[10px] tracking-widest text-body uppercase mb-1.5">Phone (optional)</div>
                  <input value={form.soul_phone} onChange={(e) => setForm({ ...form, soul_phone: e.target.value })} className="w-full bg-white border border-silver/30 rounded-lg px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <div className="text-[10px] tracking-widest text-body uppercase mb-1.5">Notes</div>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full bg-white border border-silver/30 rounded-lg px-3 py-2 text-sm resize-none" />
                </label>
              </div>
              <button onClick={submit} className="mt-5 w-full py-3 rounded-full btn-primary text-sm inline-flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" /> Log Soul Won
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
