import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Church, MapPin, Phone, Mail, User, Plus, X, Edit3, Trash2, Save } from "lucide-react";
import { api } from "../utils/api";

interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  pastor_name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  location: string | null;
  established_date: string | null;
}

export default function BranchOversight() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", city: "", country: "Nigeria", pastor_name: "", email: "", phone: "", location: "" });

  useEffect(() => {
    api.getBranches().then(setBranches).catch((e) => console.error("Fetch failed", e));
  }, []);

  const startEdit = (b: Branch) => {
    setEditing(b.id);
    setForm({ name: b.name, code: b.code, city: b.city || "", country: b.country || "Nigeria", pastor_name: b.pastor_name || "", email: b.email || "", phone: b.phone || "", location: b.location || "" });
  };

  const saveEdit = async (id: string) => {
    await api.updateBranch(id, form);
    setEditing(null);
    api.getBranches().then(setBranches);
  };

  const addBranch = async () => {
    if (!form.name || !form.code) return;
    await api.createBranch(form);
    setShowAdd(false);
    setForm({ name: "", code: "", city: "", country: "Nigeria", pastor_name: "", email: "", phone: "", location: "" });
    api.getBranches().then(setBranches);
  };

  const deleteBranch = async (id: string) => {
    if (!confirm("Delete this branch?")) return;
    await api.deleteBranch(id);
    setBranches((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <div className="pt-20">
        <div className="flex items-center gap-2 text-gold/80 text-[11px] tracking-[0.4em] uppercase mb-3">
          <Church className="w-4 h-4" /> HQ Super-Admin
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl gold-text">Branch Oversight</h1>
            <p className="mt-3 text-parchment/65 max-w-2xl">Manage all HEC branches worldwide.</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="px-5 py-2.5 rounded-full btn-gold text-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Branch
          </button>
        </div>
        <div className="gold-divider mt-6 max-w-xs" />
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        {branches.map((b, i) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="glass rounded-2xl p-5"
          >
            {editing === b.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm" placeholder="Branch name" />
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm" placeholder="Code" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm" placeholder="City" />
                  <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm" placeholder="Country" />
                </div>
                <input value={form.pastor_name} onChange={(e) => setForm({ ...form, pastor_name: e.target.value })} className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm" placeholder="Pastor name" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm" placeholder="Email" />
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm" placeholder="Phone" />
                </div>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm" placeholder="Full address" />
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(b.id)} className="px-4 py-2 rounded-full btn-gold text-xs inline-flex items-center gap-1"><Save className="w-3 h-3" /> Save</button>
                  <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-full glass text-xs">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-display text-lg text-parchment">{b.name}</div>
                    <div className="text-[10px] tracking-widest text-gold/80">{b.code}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(b)} className="p-1.5 rounded-lg hover:bg-white/5 text-parchment/40 hover:text-gold"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteBranch(b.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-parchment/40 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-parchment/70">
                  <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gold" /> {b.city}{b.country ? `, ${b.country}` : ""}</span>
                  {b.pastor_name && <span className="inline-flex items-center gap-1"><User className="w-3.5 h-3.5 text-gold" /> {b.pastor_name}</span>}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-parchment/50">
                  {b.email && <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" /> {b.email}</span>}
                  {b.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" /> {b.phone}</span>}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${b.status === 'active' || !b.status ? 'bg-verdant/20 text-verdant-light' : 'bg-maroon/20 text-maroon-light'}`}>
                    ● {b.status || 'active'}
                  </span>
                  {b.location && <span className="text-[10px] text-parchment/50">{b.location}</span>}
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {showAdd && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowAdd(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 z-50 grid place-items-center p-4">
            <div className="w-full max-w-md glass-dark rounded-3xl p-6 border border-gold/30" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="font-display text-lg gold-text">New Branch</div>
                <button onClick={() => setShowAdd(false)} className="text-parchment/60 hover:text-gold"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block"><div className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1.5">Name</div><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm" /></label>
                  <label className="block"><div className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1.5">Code</div><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm" /></label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block"><div className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1.5">City</div><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm" /></label>
                  <label className="block"><div className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1.5">Country</div><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm" /></label>
                </div>
                <label className="block"><div className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1.5">Pastor</div><input value={form.pastor_name} onChange={(e) => setForm({ ...form, pastor_name: e.target.value })} className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm" /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block"><div className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1.5">Email</div><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm" /></label>
                  <label className="block"><div className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1.5">Phone</div><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm" /></label>
                </div>
              </div>
              <button onClick={addBranch} className="mt-5 w-full py-3 rounded-full btn-gold text-sm">Create Branch</button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
