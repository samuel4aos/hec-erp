import { useState } from "react";
import { Plus, Minus, Send, CheckCircle2, Smartphone, TrendingUp, Users as UsersIcon, Hand } from "lucide-react";
import { api } from "../../utils/api";

export default function UshersWorkspace() {
  const [count, setCount] = useState({ men: 0, women: 0, children: 0, firstTimers: 0 });
  const [submitted, setSubmitted] = useState(false);
  const [firstTimers, setFirstTimers] = useState<{ name: string; phone: string; invitedBy: string }[]>([]);
  const [draft, setDraft] = useState({ name: "", phone: "", invitedBy: "" });

  const total = count.men + count.women + count.children + count.firstTimers;
  const inc = (k: keyof typeof count, n = 1) => setCount((c) => ({ ...c, [k]: Math.max(0, c[k] + n) }));

  const submit = async () => {
    try {
      await api.submitServiceCount({ ...count, first_timers_list: firstTimers });
      setSubmitted(true);
    } catch {}
  };

  const addFT = () => {
    if (!draft.name) return;
    setFirstTimers([{ ...draft }, ...firstTimers]);
    setDraft({ name: "", phone: "", invitedBy: "" });
  };

  if (submitted) {
    return (
      <div className="max-w-sm mx-auto px-5 py-10 pt-20 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-verdant grid place-items-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-parchment" />
        </div>
        <div className="font-display text-2xl gold-text">Submitted!</div>
        <p className="text-sm text-parchment/70 mt-2">Tonight's count sent to HQ. First-timers will receive welcome SMS.</p>
        <button onClick={() => { setSubmitted(false); setCount({ men: 0, women: 0, children: 0, firstTimers: 0 }); }} className="mt-6 px-6 py-3 rounded-full btn-gold text-sm">
          New Service Count
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-10 pt-20">
      {/* Mobile card mockup */}
      <div className="relative rounded-[2.5rem] p-2 bg-gradient-to-b from-ink via-maroon-dark to-ink border border-gold/30 shadow-2xl">
        <div className="rounded-[2.2rem] glass-dark p-5">
          <div className="flex items-center justify-between text-[11px] text-parchment/60 mb-4">
            <Smartphone className="w-3 h-3" />
            <span className="text-gold/80 tracking-wider text-[10px] uppercase">End-Count</span>
            <span className="text-parchment/50">Lagos HQ</span>
          </div>

          <div className="space-y-2.5">
            {(["men", "women", "children", "firstTimers"] as const).map((k) => (
              <div key={k} className="glass rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] tracking-widest text-gold/70 uppercase">{k === "firstTimers" ? "First-Timers" : k}</div>
                  <div className="font-display text-2xl gold-text mt-0.5">{count[k]}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => inc(k, -1)} className="w-9 h-9 rounded-full glass grid place-items-center"><Minus className="w-4 h-4 text-parchment" /></button>
                  <button onClick={() => inc(k, 1)} className="w-9 h-9 rounded-full btn-gold grid place-items-center"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-maroon to-maroon-dark border border-gold/30 flex items-center justify-between">
            <div className="text-[11px] tracking-widest text-gold/80 uppercase">Total</div>
            <div className="font-display text-3xl gold-text">{total}</div>
          </div>

          <button onClick={submit} className="mt-4 w-full py-3 rounded-full btn-gold inline-flex items-center justify-center gap-2">
            <Send className="w-4 h-4" /> Submit to HQ
          </button>
        </div>
      </div>

      {/* First-Timer Capture */}
      <div className="mt-6 glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="font-display text-lg text-parchment">First-Timer Capture</div>
          <span className="text-[9px] tracking-widest text-verdant-light">AUTO-SMS</span>
        </div>
        <div className="flex flex-col gap-2">
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Full name" className="bg-black/40 border border-gold/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
          <input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="Phone / WhatsApp" className="bg-black/40 border border-gold/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
          <div className="flex gap-2">
            <input value={draft.invitedBy} onChange={(e) => setDraft({ ...draft, invitedBy: e.target.value })} placeholder="Invited by" className="flex-1 bg-black/40 border border-gold/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
            <button onClick={addFT} className="px-4 py-2.5 rounded-lg btn-gold text-sm"><Plus className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
          {firstTimers.map((f, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black/30 border border-gold/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-maroon grid place-items-center text-[9px] font-display text-ink">
                {f.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-parchment truncate">{f.name}</div>
                <div className="text-[10px] text-parchment/50">{f.phone}</div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-verdant-light" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "Last Sun", value: "381", icon: TrendingUp },
          { label: "Avg / mo", value: "362", icon: UsersIcon },
          { label: "FT MTD", value: "61", icon: Hand },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-3 text-center">
            <s.icon className="w-4 h-4 text-gold mx-auto" />
            <div className="font-display text-base text-parchment mt-1">{s.value}</div>
            <div className="text-[9px] text-parchment/50 uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
