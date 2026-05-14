import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Header } from "./LiveStream";
import { Users, Plus, ShieldCheck, Mail, Key, Phone, Building2 } from "lucide-react";
import { api } from "../utils/api";
import { useAuth, type UserRole } from "../store/auth";

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", password: "password123", full_name: "", phone: "", role: "ushers" as string, branch_id: "" });

  const load = () => {
    api.getUsers().then(setUsers).catch(() => {});
    api.getBranches().then(setBranches).catch(() => {});
  };
  useEffect(load, []);

  const handleCreate = async () => {
    if (!form.email || !form.full_name || !form.role) return;
    const payload = user?.role === 'hq_admin'
      ? { ...form, branch_id: form.branch_id || undefined }
      : { ...form, branch_id: user?.branch?.id };
    try {
      await api.createBranchUser(payload);
      setShowForm(false);
      setForm({ email: "", password: "password123", full_name: "", phone: "", role: "ushers", branch_id: "" });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const roleColors: Record<string, string> = {
    hq_admin: "#d4af37", pastor: "#a32020", treasurer: "#006400", ushers: "#f0cf5e", admin_staff: "#9a7d22",
  };

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <Header title="User Management" subtitle="Create and manage church staff accounts across branches." />

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-parchment/60">{users.length} users</div>
        <button onClick={() => setShowForm(v => !v)} className="px-4 py-2 rounded-full btn-gold text-sm inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> {user?.role === 'hq_admin' ? 'Add User' : 'Add Staff'}
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 glass-dark rounded-2xl p-5 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          <label className="block">
            <span className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1 block">Full Name</span>
            <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1 block">Email</span>
            <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1 block">Phone</span>
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1 block">Role</span>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm">
              <option value="ushers">Ushers</option>
              <option value="treasurer">Treasurer</option>
              <option value="admin_staff">Admin Staff</option>
              {user?.role === 'hq_admin' && <option value="pastor">Pastor</option>}
              {user?.role === 'hq_admin' && <option value="hq_admin">HQ Admin</option>}
            </select>
          </label>
          {user?.role === 'hq_admin' && (
            <label className="block">
              <span className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1 block">Branch</span>
              <select value={form.branch_id} onChange={e => setForm({...form, branch_id: e.target.value})} className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm">
                <option value="">Select branch</option>
                {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </label>
          )}
          <div className="flex items-end gap-2">
            <button onClick={handleCreate} className="px-4 py-2 rounded-full btn-gold text-sm">Create</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-full glass text-sm">Cancel</button>
          </div>
        </motion.div>
      )}

      <div className="mt-4 space-y-2">
        {users.map((u: any) => (
          <div key={u.id} className="glass rounded-xl p-4 flex items-center gap-3 border border-gold/10">
            <div className="w-10 h-10 rounded-full grid place-items-center font-display text-sm text-ink"
              style={{ background: roleColors[u.role] || '#800000' }}>
              {u.full_name?.split(' ').map((n: string) => n[0]).slice(0,2).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-parchment font-medium">{u.full_name}</div>
              <div className="text-[11px] text-parchment/60 flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" /> {u.email}</span>
                {u.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" /> {u.phone}</span>}
                <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3 h-3" style={{ color: roleColors[u.role] }} /> {u.role}</span>
                {u.branch_name && <span className="inline-flex items-center gap-1"><Building2 className="w-3 h-3" /> {u.branch_name}</span>}
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.is_active ? 'bg-verdant/20 text-verdant-light' : 'bg-red-900/20 text-red-400'}`}>
              {u.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
