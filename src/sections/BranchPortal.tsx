import { useState, useEffect, TextareaHTMLAttributes } from "react";
import { Header } from "./LiveStream";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown, ScrollText, Wallet, Hand, Plus, Minus, Upload, Send, Smartphone,
  CheckCircle2, TrendingUp, Users, AlertCircle, DollarSign, Building2,
  ShoppingBag, Church, Eye, Globe2,
} from "lucide-react";
import { api } from "../utils/api";

type Role = "hq" | "pastor" | "treasurer" | "ushers";

const roleConfig: Record<Role, { name: string; subtitle: string; icon: any; color: string; tag: string }> = {
  hq: { name: "HQ Super-Admin", subtitle: "Global Oversight · All Branches", icon: Crown, color: "#d4af37", tag: "GLOBAL · ALL BRANCHES" },
  pastor: { name: "Branch Pastor", subtitle: "Discipleship · Reports · Care", icon: ScrollText, color: "#a32020", tag: "BRANCH · PASTOR" },
  treasurer: { name: "Branch Treasurer", subtitle: "Finance · Remittances · Expenses", icon: Wallet, color: "#006400", tag: "BRANCH · FINANCE" },
  ushers: { name: "Head of Ushers", subtitle: "Counts · First-Timers · Check-in", icon: Hand, color: "#f0cf5e", tag: "BRANCH · MOBILE" },
};

interface Props { initialRole?: Role }

export default function BranchPortal({ initialRole }: Props) {
  const [role, setRole] = useState<Role>(initialRole || "hq");
  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <Header title="Branch Operations Portal" subtitle="Real-time data across all church offices. Role-scoped by branch_id." />
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.keys(roleConfig) as Role[]).map((r) => {
          const c = roleConfig[r]; const active = role === r;
          return (
            <button key={r} onClick={() => setRole(r)}
              className={`text-left glass rounded-2xl p-4 transition border ${active ? "border-silver ring-1 ring-gold/40" : "border-transparent"}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: c.color, color: r === "ushers" ? "#1a0a0a" : "#f8f3e3" }}>
                  <c.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] tracking-widest" style={{ color: c.color }}>{c.tag}</div>
                  <div className="font-display text-sm text-body truncate">{c.name}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-6 glass-dark rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-[10px] tracking-widest" style={{ color: roleConfig[role].color }}>{roleConfig[role].tag}</div>
          <div className="font-display text-xl text-body mt-1">{roleConfig[role].name}</div>
          <div className="text-xs text-body">{roleConfig[role].subtitle}</div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-accent">
          <CheckCircle2 className="w-4 h-4" /> Live data · RLS secured
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={role} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="mt-6">
          {role === "hq" && <HQView />}
          {role === "pastor" && <PastorView />}
          {role === "treasurer" && <TreasurerView />}
          {role === "ushers" && <UshersView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────── HQ VIEW ───────────────────── */
function HQView() {
  const [data, setData] = useState({ members: 0, branches: 0, pendingGiving: 0, pendingOrders: 0, pendingTestimonies: 0, pendingRemittances: 0, products: [] as any[], branchesList: [] as any[], recentGiving: [] as any[] });

  useEffect(() => {
    Promise.all([
      api.getMembers().then(r => r.length),
      api.getBranches().then(r => r.length),
      api.getGiving().then(r => r.filter((g: any) => g.status === 'pending').length),
      api.getProducts().then(r => r.length),
      api.getTestimonies().then(r => r.filter((t: any) => t.status === 'pending').length),
      api.getRemittances().then(r => r.filter((m: any) => m.status === 'pending').length),
      api.getProducts().then(r => r.slice(0, 4)),
      api.getBranches().then(r => r.slice(0, 5)),
      api.getGiving().then(r => r.slice(0, 6)),
    ]).then(([m, b, pg, po, pt, pr, prods, brs, giv]) => {
      setData({ members: m, branches: b, pendingGiving: pg, pendingOrders: po, pendingTestimonies: pt, pendingRemittances: pr, products: prods, branchesList: brs, recentGiving: giv });
    }).catch(() => {});
  }, []);

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      {/* Summary cards */}
      <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { l: "Members", v: data.members.toLocaleString(), ic: Users, c: "#d4af37" },
          { l: "Branches", v: data.branches.toString(), ic: Building2, c: "#006400" },
          { l: "Pending Giving", v: data.pendingGiving.toString(), ic: DollarSign, c: "#a32020" },
          { l: "Orders", v: data.pendingOrders.toString(), ic: ShoppingBag, c: "#800000" },
          { l: "Testimonies", v: data.pendingTestimonies.toString(), ic: Eye, c: "#f0cf5e" },
          { l: "Remittances", v: data.pendingRemittances.toString(), ic: Church, c: "#d4af37" },
        ].map((s) => (
          <div key={s.l} className="glass rounded-xl p-3">
            <s.ic className="w-4 h-4 mb-1" style={{ color: s.c }} />
            <div className="font-display text-lg heading-text">{s.v}</div>
            <div className="text-[9px] uppercase tracking-widest text-body">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Global Giving Feed */}
      <div className="lg:col-span-2 glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe2 className="w-4 h-4 text-accent" />
          <div className="font-display text-lg heading-text">Global Giving Feed</div>
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {data.recentGiving.length === 0 && <div className="text-xs text-body text-center py-8">No giving records yet</div>}
          {data.recentGiving.map((g: any, i: number) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black/30 border border-silver/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent grid place-items-center">
                <DollarSign className="w-4 h-4 text-heading" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-body truncate"><span className="text-accent font-semibold">${Number(g.amount).toLocaleString()}</span> · {g.purpose || 'offering'}</div>
                <div className="text-[11px] text-body">{g.full_name} · {g.currency} · {g.status}</div>
              </div>
              <span className="text-[10px] text-body">{new Date(g.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Branch Health */}
      <div className="glass rounded-2xl p-5">
        <div className="font-display text-base text-body mb-4">Branch Health</div>
        {data.branchesList.map((b: any) => (
          <div key={b.id} className="mb-3 last:mb-0">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-body truncate">{b.name}</span>
              <span className="text-accent font-display">{b.code}</span>
            </div>
          </div>
        ))}
        {data.branchesList.length === 0 && <div className="text-xs text-body text-center py-4">No branches</div>}
      </div>

      {/* Bookstore CMS Recent */}
      <div className="lg:col-span-3 glass rounded-2xl p-5">
        <div className="font-display text-base text-body mb-4">Bookstore Products · Recent</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data.products.length === 0 && <div className="col-span-full text-xs text-body text-center py-4">No products</div>}
          {data.products.map((p: any) => (
            <div key={p.id} className="glass rounded-xl p-3 border border-silver/15">
              <div className="text-sm text-body">{p.title}</div>
              <div className="text-[11px] text-accent/80 mt-1">${Number(p.price).toFixed(2)} · {p.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── PASTOR VIEW ───────────────────── */
function PastorView() {
  const [firstTimers, setFirstTimers] = useState<any[]>([]);
  const [counselling, setCounselling] = useState<any[]>([]);
  const [missed, setMissed] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.getFirstTimers().then(setFirstTimers).catch(() => {}),
      api.getCounsellingLogs().then(r => setCounselling(r.filter((c: any) => c.status === 'open'))).catch(() => {}),
      api.getMissedMembers().then(setMissed).catch(() => {}),
    ]);
  }, []);

  const pipeline = {
    firstTimers: firstTimers.filter((f: any) => f.follow_up_status === 'new').length,
    contacted: firstTimers.filter((f: any) => f.follow_up_status === 'contacted').length,
    visited: firstTimers.filter((f: any) => f.follow_up_status === 'visited').length,
    enrolled: firstTimers.filter((f: any) => f.follow_up_status === 'enrolled').length,
  };
  const maxPipe = Math.max(pipeline.firstTimers, pipeline.contacted, pipeline.visited, pipeline.enrolled, 1);

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      {/* Care Alerts */}
      <div className="lg:col-span-2 glass rounded-2xl p-5">
        <div className="font-display text-base text-body mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-accent" /> Care Alerts
          {missed.length > 0 && <span className="text-[10px] bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full">{missed.length}</span>}
        </div>
        {missed.length === 0 && <div className="text-xs text-body text-center py-4">No care alerts — members are attending regularly</div>}
        {missed.map((m: any, i: number) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-900/20 border border-red-900/40 mb-2">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-body">{m.member?.first_name} {m.member?.last_name}</div>
              <div className="text-[11px] text-body">{m.member?.phone} · Missed {m.missed_streak} Sundays</div>
            </div>
            <span className="text-[10px] text-red-400">{m.missed_streak}x missed</span>
          </div>
        ))}
      </div>

      <div className="space-y-5">
        {/* Discipleship Pipeline */}
        <div className="glass rounded-2xl p-5">
          <div className="font-display text-base text-body mb-3">Discipleship Pipeline</div>
          {[
            { stage: "First Timers", n: pipeline.firstTimers, c: "#d4af37" },
            { stage: "Contacted", n: pipeline.contacted, c: "#a32020" },
            { stage: "Visited", n: pipeline.visited, c: "#006400" },
            { stage: "Enrolled", n: pipeline.enrolled, c: "#2a8c2a" },
          ].map((s) => (
            <div key={s.stage} className="mb-2 last:mb-0">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-body">{s.stage}</span>
                <span className="text-accent font-display">{s.n}</span>
              </div>
              <div className="h-1.5 rounded-full bg-black/40">
                <div className="h-full rounded-full" style={{ background: s.c, width: `${(s.n / maxPipe) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Counselling */}
        <div className="glass rounded-2xl p-5">
          <div className="font-display text-base text-body mb-3">Open Counselling</div>
          {counselling.length === 0 && <div className="text-xs text-body text-center py-3">No open sessions</div>}
          {counselling.slice(0, 3).map((c: any) => (
            <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/25 mb-1.5">
              <div className="text-sm text-body flex-1 min-w-0 truncate">{c.member_name}</div>
              <div className="text-[10px] text-body">{c.visit_type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Preaching Log */}
      <div className="lg:col-span-3 glass rounded-2xl p-5">
        <div className="font-display text-base text-body mb-3">First-Timer Follow-ups</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-body uppercase tracking-widest">
              <th className="text-left py-2 pr-4">Name</th><th className="text-left py-2 pr-4">Phone</th><th className="text-left py-2 pr-4">Status</th><th className="text-left py-2">Date</th>
            </tr></thead>
            <tbody>
              {firstTimers.slice(0, 5).map((f: any) => (
                <tr key={f.id} className="border-t border-silver/10">
                  <td className="py-2 pr-4 text-body">{f.full_name}</td>
                  <td className="py-2 pr-4 text-body">{f.phone}</td>
                  <td className="py-2 pr-4"><span className="text-accent">{f.follow_up_status}</span></td>
                  <td className="py-2 text-body">{new Date(f.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── TREASURER VIEW ───────────────────── */
function TreasurerView() {
  const [giving, setGiving] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [remittances, setRemittances] = useState<any[]>([]);
  const [desc, setDesc] = useState(""); const [amount, setAmount] = useState(""); const [cat, setCat] = useState("Operations");
  const [remitAmount, setRemitAmount] = useState(""); const [remitNotes, setRemitNotes] = useState(""); const [remitPeriod, setRemitPeriod] = useState("");

  const load = () => {
    api.getGiving().then(setGiving).catch(() => {});
    api.getExpenses().then(setExpenses).catch(() => {});
    api.getRemittances().then(setRemittances).catch(() => {});
  };
  useEffect(load, []);

  const verifiedGiving = giving.filter((g: any) => g.status === 'verified');
  const pendingVerify = giving.filter((g: any) => g.status === 'pending');
  const incomeMtd = verifiedGiving.reduce((s: number, g: any) => s + Number(g.amount), 0);
  const expenseMtd = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0);

  const addExpense = async () => {
    if (!desc || !amount) return;
    await api.createExpense({ description: desc, amount, category: cat }).catch(() => {});
    setDesc(""); setAmount(""); setCat("Operations");
    load();
  };

  const submitRemittance = async () => {
    if (!remitAmount) return;
    await api.submitRemittance({ amount: remitAmount, notes: remitNotes, period: remitPeriod }).catch(() => {});
    setRemitAmount(""); setRemitNotes(""); setRemitPeriod("");
    load();
  };

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { l: "Verified Income", v: `$${incomeMtd.toLocaleString()}`, c: "#006400" },
            { l: "Expenses", v: `$${expenseMtd.toLocaleString()}`, c: "#800000" },
            { l: "Pending Verify", v: pendingVerify.length.toString(), c: "#d4af37" },
          ].map((s) => (
            <div key={s.l} className="glass rounded-xl p-4">
              <div className="text-[10px] uppercase tracking-widest text-body">{s.l}</div>
              <div className="font-display text-xl mt-1" style={{ color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Pending Verifications */}
        <div className="glass rounded-2xl p-5">
          <div className="font-display text-base text-body mb-3">Pending Verifications</div>
          {pendingVerify.length === 0 && <div className="text-xs text-body text-center py-4">All caught up</div>}
          {pendingVerify.slice(0, 5).map((g: any) => (
            <div key={g.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black/30 border border-silver/10 mb-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-body">{g.full_name}</div>
                <div className="text-[11px] text-body">{g.purpose} · ${Number(g.amount).toLocaleString()}</div>
              </div>
              <button onClick={() => api.verifyGiving(g.id).then(load)} className="px-3 py-1 rounded-md btn-primary text-[11px]">Verify</button>
            </div>
          ))}
        </div>

        {/* Expense Ledger */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-display text-base text-body">Expense Ledger</div>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="col-span-2 bg-white border border-silver/30 rounded-lg px-3 py-2 text-sm" />
            <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" type="number" className="bg-white border border-silver/30 rounded-lg px-3 py-2 text-sm" />
            <button onClick={addExpense} className="btn-primary rounded-lg text-xs">Add</button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {expenses.length === 0 && <div className="text-xs text-body text-center py-4">No expenses</div>}
            {expenses.map((e: any) => (
              <div key={e.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black/30 border border-silver/10">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-body">{e.description}</div>
                  <div className="text-[11px] text-body">{e.category} · {new Date(e.created_at).toLocaleDateString()}</div>
                </div>
                <div className="text-sm font-display text-accent">-${Number(e.amount).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Remittance */}
      <div className="space-y-5">
        <div className="glass rounded-2xl p-5">
          <div className="font-display text-base text-body mb-1">Remit to HQ</div>
          <p className="text-xs text-body mb-4">Submit branch remittance for HQ reconciliation.</p>
          <div className="space-y-3">
            <input value={remitAmount} onChange={e => setRemitAmount(e.target.value)} placeholder="Amount" type="number" className="w-full bg-white border border-silver/30 rounded-lg px-3 py-2 text-sm" />
            <input value={remitPeriod} onChange={e => setRemitPeriod(e.target.value)} placeholder="Period (e.g. 2026-05)" className="w-full bg-white border border-silver/30 rounded-lg px-3 py-2 text-sm" />
            <textarea value={remitNotes} onChange={e => setRemitNotes(e.target.value)} placeholder="Notes" rows={2} className="w-full bg-white border border-silver/30 rounded-lg px-3 py-2 text-sm resize-none" />
            <button onClick={submitRemittance} className="w-full py-3 rounded-full btn-primary inline-flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Submit Remittance
            </button>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="font-display text-base text-body mb-3">Remittance History</div>
          {remittances.length === 0 && <div className="text-xs text-body text-center py-3">No remittances</div>}
          {remittances.map((r: any) => (
            <div key={r.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/25 mb-1.5">
              <div className="text-sm text-body flex-1">${Number(r.amount).toLocaleString()}</div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.status === 'reconciled' ? 'bg-accent/20 text-accent' : 'bg-accent/20 text-accent'}`}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── USHERS VIEW ───────────────────── */
function UshersView() {
  const [count, setCount] = useState({ men: 0, women: 0, children: 0, firstTimers: 0 });
  const [serviceType, setServiceType] = useState("Sunday");
  const [submitted, setSubmitted] = useState(false);
  const [ftList, setFtList] = useState<{name:string;phone:string;invitedBy:string}[]>([]);
  const [draft, setDraft] = useState({ name: "", phone: "", invitedBy: "" });
  const [serviceCounts, setServiceCounts] = useState<any[]>([]);

  useEffect(() => {
    api.getServiceCounts().then(setServiceCounts).catch(() => {});
  }, []);

  const total = count.men + count.women + count.children + count.firstTimers;
  const inc = (k: keyof typeof count, n = 1) => setCount(c => ({ ...c, [k]: Math.max(0, c[k] + n) }));

  const addFT = () => {
    if (!draft.name) return;
    setFtList([{ ...draft }, ...ftList]);
    setDraft({ name: "", phone: "", invitedBy: "" });
  };

  const handleSubmit = async () => {
    try {
      await api.submitServiceCount({ service_type: serviceType, men: count.men, women: count.women, children: count.children, first_timers: count.firstTimers, first_timers_list: ftList });
      setSubmitted(true);
      api.getServiceCounts().then(setServiceCounts).catch(() => {});
    } catch {}
  };

  if (submitted) return (
    <div className="text-center py-16">
      <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-4" />
      <div className="font-display text-2xl heading-text">Service Count Submitted</div>
      <p className="text-body mt-2 text-sm">HQ has been notified.</p>
      <button onClick={() => { setSubmitted(false); setCount({ men: 0, women: 0, children: 0, firstTimers: 0 }); setFtList([]); }} className="mt-6 px-6 py-3 rounded-full btn-primary">New Service Count</button>
    </div>
  );

  return (
    <div className="grid lg:grid-cols-[420px_1fr] gap-5">
      <div className="mx-auto lg:mx-0 w-full max-w-sm">
        <div className="relative rounded-[2.5rem] p-2 bg-gradient-to-b from-accent-dark via-accent-dark to-accent-dark border border-silver/30 shadow-2xl">
          <div className="rounded-[2.2rem] glass-dark p-5">
            <div className="flex items-center justify-between text-[11px] text-body mb-3">
              <span>Service Count</span>
              <select value={serviceType} onChange={e => setServiceType(e.target.value)}
                className="bg-transparent text-[11px] text-accent border border-silver/20 rounded px-2 py-0.5">
                <option value="Sunday">Sunday</option><option value="Midweek">Midweek</option><option value="Crusade">Crusade</option>
              </select>
            </div>
            <div className="text-[10px] tracking-widest text-accent/80 uppercase">Service End-Count</div>
            <div className="font-display text-2xl text-body mt-1">{serviceType} Tally</div>
            <div className="mt-4 space-y-2.5">
              {(["men", "women", "children", "firstTimers"] as const).map((k) => (
                <div key={k} className="glass rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] tracking-widest text-accent/70 uppercase">{k === "firstTimers" ? "First-Timers" : k}</div>
                    <div className="font-display text-2xl heading-text mt-0.5">{count[k]}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => inc(k, -1)} className="w-9 h-9 rounded-full glass grid place-items-center"><Minus className="w-4 h-4 text-body" /></button>
                    <button onClick={() => inc(k, 1)} className="w-9 h-9 rounded-full btn-primary grid place-items-center"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-accent to-accent-dark border border-silver/30 flex items-center justify-between">
              <div className="text-[11px] tracking-widest text-accent/80 uppercase">Total in Sanctuary</div>
              <div className="font-display text-3xl heading-text">{total}</div>
            </div>
            <button onClick={handleSubmit} className="mt-4 w-full py-3 rounded-full btn-primary inline-flex items-center justify-center gap-2">
              Submit to HQ <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { l: "Last Sun", v: serviceCounts[0] ? (serviceCounts[0].men + serviceCounts[0].women + serviceCounts[0].children + serviceCounts[0].first_timers).toString() : "0", ic: TrendingUp },
            { l: "Records", v: serviceCounts.length.toString(), ic: Users },
            { l: "FT Total", v: serviceCounts.reduce((s: number, c: any) => s + c.first_timers, 0).toString(), ic: Hand },
          ].map((s) => (
            <div key={s.l} className="glass rounded-xl p-3">
              <s.ic className="w-4 h-4 text-accent mx-auto" />
              <div className="font-display text-base text-body mt-1">{s.v}</div>
              <div className="text-[10px] text-body uppercase tracking-widest">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="font-display text-lg text-body">First-Timer Capture</div>
          <span className="text-[10px] tracking-widest text-accent">AUTO-WELCOME</span>
        </div>
        <p className="text-xs text-body mb-4">Each entry triggers an automated welcome SMS and follow-up.</p>
        <div className="grid sm:grid-cols-3 gap-2 mb-3">
          <input value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})} placeholder="Full name" className="bg-white border border-silver/30 rounded-lg px-3 py-2.5 text-sm" />
          <input value={draft.phone} onChange={e => setDraft({...draft, phone: e.target.value})} placeholder="Phone / WhatsApp" className="bg-white border border-silver/30 rounded-lg px-3 py-2.5 text-sm" />
          <input value={draft.invitedBy} onChange={e => setDraft({...draft, invitedBy: e.target.value})} placeholder="Invited by" className="bg-white border border-silver/30 rounded-lg px-3 py-2.5 text-sm" />
        </div>
        <button onClick={addFT} className="px-4 py-2 rounded-full btn-primary text-sm inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add first-timer</button>
        <div className="mt-5 space-y-2 max-h-80 overflow-y-auto">
          {ftList.map((f, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-black/30 border border-silver/10">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent grid place-items-center text-[11px] font-display text-white">
                {f.name.split(" ").map(n => n[0]).slice(0,2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-body truncate">{f.name}</div>
                <div className="text-[11px] text-body">{f.phone} {f.invitedBy && `· by ${f.invitedBy}`}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, rows = 1, ...props }: { label: string; rows?: number } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <div className="text-[10px] tracking-widest text-body uppercase mb-1.5">{label}</div>
      <textarea {...props} rows={rows} className="w-full bg-white border border-silver/30 rounded-lg px-3 py-2 text-sm text-body focus:outline-none focus:border-silver/50 resize-none" />
    </label>
  );
}
