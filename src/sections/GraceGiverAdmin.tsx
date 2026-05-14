import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Save, Heart } from "lucide-react";
import { api } from "../utils/api";

interface Account {
  bank: string;
  name: string;
  number: string;
  swift: string;
  purpose: string;
  color: string;
  flag: string;
}

const emptyAccount: Account = { bank: "", name: "", number: "", swift: "", purpose: "", color: "#800000", flag: "🇳🇬" };

const defaultAccounts: Account[] = [
  { bank: "Guaranty Trust Bank (GTB)", name: "Holiness Evangelistic Church · HQ", number: "0123456789", swift: "GTBINGLA", purpose: "Tithes & Offerings", color: "#800000", flag: "🇳🇬" },
  { bank: "Zenith Bank Plc", name: "HEC Missions Account", number: "1098765432", swift: "ZEIBNGLA", purpose: "Global Missions", color: "#006400", flag: "🇳🇬" },
  { bank: "Barclays London", name: "HEC International Trust", number: "GB29 NWBK 6016 1331 9268 19", swift: "BARCGB22", purpose: "Diaspora Giving", color: "#d4af37", flag: "🇬🇧" },
  { bank: "Bank of America", name: "HEC USA Mission Inc.", number: "024-0001-9988", swift: "BOFAUS3N", purpose: "Building Project", color: "#a32020", flag: "🇺🇸" },
];

export default function GraceGiverAdmin() {
  const [accounts, setAccounts] = useState<Account[]>(defaultAccounts);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getPublicSiteContent().then((data: any) => {
      if (data?.giving?.accounts) {
        try {
          const parsed = JSON.parse(data.giving.accounts);
          if (Array.isArray(parsed) && parsed.length) setAccounts(parsed);
        } catch {}
      }
    }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.updateSiteContent({ "giving.accounts": JSON.stringify(accounts) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  const updateAccount = (i: number, field: keyof Account, value: string) => {
    setAccounts((prev) => prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));
  };

  const addAccount = () => setAccounts((prev) => [...prev, { ...emptyAccount }]);
  const removeAccount = (i: number) => setAccounts((prev) => prev.filter((_, idx) => idx !== i));

  const Input = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
    <div>
      <label className="text-[10px] tracking-widest text-gold/80 uppercase mb-1 block">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-black/40 border border-gold/15 rounded-xl px-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-gold/50" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <div className="pt-20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-gold/80 text-[11px] tracking-[0.4em] uppercase mb-3">
              <Heart className="w-4 h-4" /> Admin
            </div>
            <h1 className="font-display text-4xl md:text-5xl gold-text">Grace Giver Accounts</h1>
            <p className="mt-3 text-parchment/65">Manage bank accounts displayed on the Grace-Giver Hub page.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={addAccount} className="px-4 py-2.5 rounded-full glass text-sm inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Account
            </button>
            <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-full btn-gold text-sm inline-flex items-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {saved ? "Saved ✓" : "Save All"}
            </button>
          </div>
        </div>
        <div className="gold-divider mt-6 max-w-xs" />
      </div>

      <div className="mt-8 space-y-6">
        {accounts.map((a, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-display text-base text-parchment inline-flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: a.color || "#800000" }} />
                Account #{i + 1}
              </div>
              {accounts.length > 1 && (
                <button onClick={() => removeAccount(i)} className="p-2 rounded-lg hover:bg-white/5 text-maroon-light">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Bank Name" value={a.bank} onChange={(v) => updateAccount(i, "bank", v)} placeholder="e.g. Guaranty Trust Bank" />
              <Input label="Account Name" value={a.name} onChange={(v) => updateAccount(i, "name", v)} placeholder="e.g. HEC HQ Account" />
              <Input label="Account Number" value={a.number} onChange={(v) => updateAccount(i, "number", v)} placeholder="0123456789" />
              <Input label="SWIFT/BIC" value={a.swift} onChange={(v) => updateAccount(i, "swift", v)} placeholder="GTBINGLA" />
              <Input label="Purpose" value={a.purpose} onChange={(v) => updateAccount(i, "purpose", v)} placeholder="Tithes & Offerings" />
              <div>
                <label className="text-[10px] tracking-widest text-gold/80 uppercase mb-1 block">Color</label>
                <input type="color" value={a.color || "#800000"} onChange={(e) => updateAccount(i, "color", e.target.value)} className="w-full h-[42px] rounded-xl bg-black/40 border border-gold/15 cursor-pointer" />
              </div>
              <Input label="Flag (emoji)" value={a.flag} onChange={(v) => updateAccount(i, "flag", v)} placeholder="🇳🇬" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
