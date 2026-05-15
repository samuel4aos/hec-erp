import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Plus, Minus, Upload, Send, CheckCircle2, Download } from "lucide-react";
import { api } from "../../utils/api";

export default function TreasurerWorkspace() {
  const [giving, setGiving] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showExpense, setShowExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ description: "", amount: "", category: "Operations" });

  useEffect(() => {
    api.getGiving().then(setGiving).catch((e) => console.error('Fetch giving failed', e));
    api.getExpenses().then(setExpenses).catch((e) => console.error('Fetch expenses failed', e));
  }, []);

  const pending = giving.filter((g) => g.status === "pending");
  const totalIncome = giving.filter((g) => g.status === "verified").reduce((s: number, g: any) => s + Number(g.amount), 0);
  const totalExpenses = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0);

  const addExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount) return;
    try {
      const saved = await api.createExpense({
        description: expenseForm.description,
        amount: Number(expenseForm.amount),
        category: expenseForm.category,
      });
      setExpenses((prev) => [{ ...saved, date: new Date(saved.created_at).toLocaleDateString() }, ...prev]);
      setExpenseForm({ description: "", amount: "", category: "Operations" });
      setShowExpense(false);
    } catch (e) { console.error('Expense save failed', e); }
  };

  const verify = async (id: string) => {
    try { await api.verifyGiving(id); setGiving((prev) => prev.map((g) => g.id === id ? { ...g, status: "verified" } : g)); } catch (e) { console.error('Verify failed', e); }
  };

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-10 pt-20">
      <div className="flex items-center gap-2 text-accent/80 text-[11px] tracking-[0.4em] uppercase mb-3">
        <Wallet className="w-4 h-4" /> Branch Treasurer
      </div>
      <h1 className="font-display text-4xl md:text-5xl heading-text">Treasury Dashboard</h1>
      <div className="silver-divider mt-4 max-w-xs" />

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: "Income MTD", value: `₦${(totalIncome / 1000).toFixed(1)}M`, color: "#006400" },
          { label: "Expenses MTD", value: `₦${(totalExpenses / 1000).toFixed(1)}M`, color: "#800000" },
          { label: "Pending Verify", value: pending.length.toString(), color: "#d4af37" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4">
            <div className="font-display text-2xl" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] uppercase tracking-widest text-body">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-[1.3fr_1fr] gap-6">
        {/* Pending verifications */}
        <div className="glass rounded-2xl p-5">
          <div className="font-display text-lg text-body mb-3">Pending Verifications</div>
          {pending.length === 0 ? (
            <div className="text-sm text-body text-center py-8">All caught up! No pending verifications.</div>
          ) : (
            <div className="space-y-2">
              {pending.map((g) => (
                <div key={g.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-black/30 border border-silver/10">
                  <div className="w-9 h-9 rounded-full bg-accent/20 grid place-items-center"><Wallet className="w-4 h-4 text-accent" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-body">{g.full_name}</div>
                    <div className="text-[11px] text-body">{g.purpose} · {new Date(g.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="font-display text-base heading-text">₦{Number(g.amount).toLocaleString()}</div>
                  <button onClick={() => verify(g.id)} className="px-3 py-1.5 rounded-lg btn-primary text-[11px]">Verify</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expense ledger */}
        <div className="glass-dark rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-display text-lg text-body">Expense Ledger</div>
            <button onClick={() => setShowExpense((v) => !v)} className="px-3 py-1.5 rounded-lg btn-primary text-xs inline-flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {showExpense && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-4 space-y-2">
              <input value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} placeholder="Description" className="w-full bg-white border border-silver/30 rounded-lg px-3 py-2 text-sm" />
              <div className="flex gap-2">
                <input value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} placeholder="Amount" className="flex-1 bg-white border border-silver/30 rounded-lg px-3 py-2 text-sm" />
                <select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} className="bg-white border border-silver/30 rounded-lg px-3 py-2 text-sm">
                  <option className="bg-ink">Operations</option><option className="bg-ink">Welfare</option><option className="bg-ink">Children</option><option className="bg-ink">Missions</option>
                </select>
              </div>
              <button onClick={addExpense} className="w-full py-2 rounded-lg btn-primary text-sm">Add Entry</button>
            </motion.div>
          )}

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black/30 border border-silver/10">
                <Minus className="w-4 h-4 text-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-body">{e.description}</div>
                  <div className="text-[10px] text-body">{e.date} · {e.category}</div>
                </div>
                <div className="text-sm font-display text-accent">−₦{Number(e.amount).toLocaleString()}</div>
              </div>
            ))}
            {expenses.length === 0 && <div className="text-sm text-body text-center py-4">No expenses recorded</div>}
          </div>
        </div>
      </div>

      {/* Remittance */}
      <div className="mt-6 glass rounded-2xl p-5">
        <div className="font-display text-lg text-body mb-3">Remit to HQ</div>
        <div className="grid md:grid-cols-[1fr_200px] gap-4 items-end">
          <div>
            <div className="text-[10px] tracking-widest text-body uppercase mb-1">Amount (₦)</div>
            <input placeholder="4,210,000" className="w-full bg-white border border-silver/30 rounded-lg px-3 py-2.5 text-sm" />
          </div>
          <button className="py-2.5 rounded-lg btn-primary text-sm inline-flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" /> Upload Teller
          </button>
          <button className="py-2.5 rounded-lg glass text-sm inline-flex items-center justify-center gap-2">
            <Send className="w-4 h-4" /> Send to HQ
          </button>
        </div>
        <div className="mt-3 text-xs text-accent inline-flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> October remittance reconciled by HQ on Nov 02
        </div>
      </div>

      <div className="mt-4 text-right">
        <a href={api.exportGivingCSV()} download className="text-xs text-accent/70 hover:text-accent inline-flex items-center gap-1">
          <Download className="w-3 h-3" /> Export CSV
        </a>
      </div>
    </div>
  );
}
