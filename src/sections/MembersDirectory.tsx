import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Users, Phone, Mail, MapPin, Calendar, ChevronRight, X, UserPlus, Church, Save } from "lucide-react";
import { api } from "../utils/api";

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  gender: string | null;
  date_of_birth: string | null;
  marital_status: string | null;
  occupation: string | null;
  city: string | null;
  country: string | null;
  membership_date: string;
  membership_status: string;
  spiritual_gifts: string[] | null;
  departments: string[] | null;
  branch_name: string | null;
  branch_city: string | null;
  branch_country: string | null;
}

export default function MembersDirectory() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Member | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ first_name: "", last_name: "", email: "", phone: "", gender: "", city: "", country: "Nigeria" });

  useEffect(() => {
    api.getMembers().then(setMembers).catch((e) => console.error("Fetch failed", e));
  }, []);

  const addMember = async () => {
    if (!addForm.first_name || !addForm.last_name) return;
    try {
      await api.createMember(addForm);
      setShowAdd(false);
      setAddForm({ first_name: "", last_name: "", email: "", phone: "", gender: "", city: "", country: "Nigeria" });
      api.getMembers().then(setMembers).catch((e) => console.error("Fetch failed", e));
    } catch (e) { console.error("Add member failed", e); }
  };

  const filtered = members.filter(
    (m) =>
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.phone?.includes(search)
  );

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <div className="pt-20">
        <div className="text-[11px] tracking-[0.4em] uppercase text-gold/80 mb-3">
          Admin Portal
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl gold-text">Member Directory</h1>
            <p className="mt-3 text-parchment/65 max-w-2xl">
              Manage all registered members across your branches.
            </p>
          </div>
          <button onClick={() => setShowAdd(true)} className="px-5 py-2.5 rounded-full btn-gold text-sm inline-flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Add Member
          </button>
        </div>
        <div className="gold-divider mt-6 max-w-xs" />
      </div>

      {/* Search */}
      <div className="mt-8 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/60" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full bg-black/40 border border-gold/15 rounded-full pl-10 pr-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-gold/50"
        />
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Members", value: members.length, icon: Users, color: "#d4af37" },
          { label: "Active", value: members.filter((m) => m.membership_status === "active").length, icon: Users, color: "#006400" },
          { label: "Departments", value: [...new Set(members.flatMap((m) => m.departments || []))].length, icon: Users, color: "#a32020" },
          { label: "First-Timers", value: members.filter((m) => m.membership_status === "new").length, icon: Users, color: "#9a7d22" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg grid place-items-center" style={{ background: s.color }}>
                <s.icon className="w-4 h-4 text-parchment" />
              </div>
            </div>
            <div className="font-display text-2xl gold-text">{s.value}</div>
            <div className="text-[10px] uppercase tracking-widest text-parchment/55">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Member Grid */}
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((member, i) => (
          <motion.button
            key={member.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelected(member)}
            className="text-left glass rounded-2xl p-5 hover:border-gold/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-maroon grid place-items-center font-display text-sm text-ink shrink-0">
                {member.first_name[0]}{member.last_name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-base text-parchment truncate">
                  {member.first_name} {member.last_name}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-parchment/60 mt-0.5">
                  {member.branch_name && (
                    <span className="inline-flex items-center gap-1">
                      <Church className="w-3 h-3 text-gold/70" />
                      {member.branch_name}
                    </span>
                  )}
                  {member.branch_city && (
                    <span>· {member.branch_city}{member.branch_country ? `, ${member.branch_country}` : ''}</span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-parchment/40 ml-auto shrink-0" />
            </div>
            {member.departments && member.departments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {member.departments.slice(0, 4).map((d: string) => (
                  <span key={d} className="text-[9px] px-2 py-0.5 rounded-full bg-maroon/40 text-parchment/80 border border-gold/20 tracking-wide">
                    {d}
                  </span>
                ))}
                {member.departments.length > 4 && (
                  <span className="text-[9px] text-parchment/50">+{member.departments.length - 4}</span>
                )}
              </div>
            )}
            <div className="mt-3 flex items-center gap-3 text-[11px] text-parchment/50">
              {member.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {member.phone}
                </span>
              )}
              <span className={`inline-flex items-center gap-1 ${member.membership_status === "active" ? "text-verdant-light" : "text-parchment/40"}`}>
                ● {member.membership_status === "active" ? "Active" : member.membership_status || "Member"}
              </span>
            </div>
          </motion.button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-parchment/50 text-sm">
            {search ? "No members match your search." : "Loading members..."}
          </div>
        )}
      </div>

      {/* Add Member modal */}
      {showAdd && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowAdd(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 z-50 grid place-items-center p-4">
            <div className="w-full max-w-md glass-dark rounded-3xl p-6 border border-gold/30" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="font-display text-lg gold-text">Add Member</div>
                <button onClick={() => setShowAdd(false)} className="text-parchment/60 hover:text-gold"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input value={addForm.first_name} onChange={(e) => setAddForm({ ...addForm, first_name: e.target.value })} placeholder="First name" className="bg-black/40 border border-gold/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
                  <input value={addForm.last_name} onChange={(e) => setAddForm({ ...addForm, last_name: e.target.value })} placeholder="Last name" className="bg-black/40 border border-gold/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
                </div>
                <input value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="Email" className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
                <input value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} placeholder="Phone" className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={addForm.gender} onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })} className="bg-black/40 border border-gold/15 rounded-lg px-3 py-2.5 text-sm">
                    <option className="bg-ink" value="">Gender</option>
                    <option className="bg-ink" value="male">Male</option>
                    <option className="bg-ink" value="female">Female</option>
                  </select>
                  <input value={addForm.city} onChange={(e) => setAddForm({ ...addForm, city: e.target.value })} placeholder="City" className="bg-black/40 border border-gold/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
                </div>
              </div>
              <button onClick={addMember} className="mt-5 w-full py-3 rounded-full btn-gold text-sm inline-flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Member
              </button>
            </div>
          </motion.div>
        </>
      )}

      {/* Member detail modal */}
      {selected && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="fixed inset-0 z-50 grid place-items-center p-4"
          >
            <div
              className="w-full max-w-lg glass-dark rounded-3xl overflow-hidden border border-gold/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-maroon grid place-items-center font-display text-xl text-ink">
                      {selected.first_name[0]}{selected.last_name[0]}
                    </div>
                    <div>
                      <div className="font-display text-2xl text-parchment">
                        {selected.first_name} {selected.last_name}
                      </div>
                      <div className="text-xs text-parchment/60">
                        {selected.occupation || "No occupation listed"}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-parchment/60 hover:text-gold">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-6 space-y-3">
                  {selected.email && (
                    <div className="flex items-center gap-3 text-sm text-parchment/75">
                      <Mail className="w-4 h-4 text-gold" /> {selected.email}
                    </div>
                  )}
                  {selected.phone && (
                    <div className="flex items-center gap-3 text-sm text-parchment/75">
                      <Phone className="w-4 h-4 text-gold" /> {selected.phone}
                    </div>
                  )}
                  {selected.date_of_birth && (
                    <div className="flex items-center gap-3 text-sm text-parchment/75">
                      <Calendar className="w-4 h-4 text-gold" /> {new Date(selected.date_of_birth).toLocaleDateString()}
                    </div>
                  )}
                  {(selected.city || selected.country) && (
                    <div className="flex items-center gap-3 text-sm text-parchment/75">
                      <MapPin className="w-4 h-4 text-gold" /> {[selected.city, selected.country].filter(Boolean).join(", ")}
                    </div>
                  )}
                </div>

                {selected.spiritual_gifts && selected.spiritual_gifts.length > 0 && (
                  <div className="mt-5">
                    <div className="text-[10px] tracking-widest text-gold/80 uppercase mb-2">Spiritual Gifts</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.spiritual_gifts.map((g) => (
                        <span key={g} className="text-[10px] px-2.5 py-1 rounded-full bg-gold/20 text-gold border border-gold/30">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selected.departments && selected.departments.length > 0 && (
                  <div className="mt-4">
                    <div className="text-[10px] tracking-widest text-gold/80 uppercase mb-2">Departments</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.departments.map((d) => (
                        <span key={d} className="text-[10px] px-2.5 py-1 rounded-full bg-maroon/30 text-parchment/80 border border-gold/20">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-gold/20 flex items-center justify-between text-xs">
                  <span className="text-parchment/50">Member since {new Date(selected.membership_date).toLocaleDateString()}</span>
                  <span className="text-verdant-light font-semibold">{selected.membership_status}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
