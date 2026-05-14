import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, MapPin, Clock, Plus, X, UserPlus, Calendar, Trash2 } from "lucide-react";
import { api } from "../utils/api";

interface CellGroup {
  id: string;
  name: string;
  leader_id: string | null;
  leader_name: string | null;
  meeting_day: string | null;
  meeting_time: string | null;
  location: string | null;
  zone: string | null;
  member_count: number;
}

interface GroupMember {
  id: string;
  member_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function CellGroups() {
  const [groups, setGroups] = useState<CellGroup[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [selected, setSelected] = useState<CellGroup | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", leader_id: "", meeting_day: "", meeting_time: "", location: "", zone: "" });
  const [addMemberId, setAddMemberId] = useState("");

  useEffect(() => {
    api.getCellGroups().then(setGroups).catch((e) => console.error("Fetch failed", e));
    api.getMembers().then(setMembers).catch((e) => console.error("Fetch failed", e));
  }, []);

  const loadMembers = async (g: CellGroup) => {
    setSelected(g);
    const m = await api.getCellGroupMembers(g.id).catch(() => []);
    setGroupMembers(m);
  };

  const create = async () => {
    if (!form.name) return;
    await api.createCellGroup(form);
    setShowCreate(false);
    setForm({ name: "", leader_id: "", meeting_day: "", meeting_time: "", location: "", zone: "" });
    const updated = await api.getCellGroups();
    setGroups(updated);
  };

  const addMember = async () => {
    if (!addMemberId || !selected) return;
    await api.addCellGroupMember(selected.id, addMemberId);
    setAddMemberId("");
    const m = await api.getCellGroupMembers(selected.id);
    setGroupMembers(m);
  };

  const removeMember = async (memberId: string) => {
    if (!selected) return;
    await api.removeCellGroupMember(selected.id, memberId);
    setGroupMembers((prev) => prev.filter((m) => m.member_id !== memberId));
  };

  const deleteGroup = async (id: string) => {
    await api.deleteCellGroup(id);
    setGroups((prev) => prev.filter((g) => g.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <div className="pt-20">
        <div className="text-[11px] tracking-[0.4em] uppercase text-gold/80 mb-3">
          Admin Portal
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl gold-text">Cell Groups</h1>
            <p className="mt-3 text-parchment/65 max-w-2xl">
              Small groups for fellowship, discipleship, and community outreach.
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} className="px-5 py-2.5 rounded-full btn-gold text-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Group
          </button>
        </div>
        <div className="gold-divider mt-6 max-w-xs" />
      </div>

      <div className="mt-8 grid lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Group list */}
        <div className="space-y-3">
          {groups.length === 0 && <div className="text-parchment/50 text-sm text-center py-12">No cell groups yet. Create your first group.</div>}
          {groups.map((g, i) => (
            <motion.button
              key={g.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              onClick={() => loadMembers(g)}
              className={`w-full text-left glass rounded-2xl p-5 transition ${
                selected?.id === g.id ? "border-gold ring-1 ring-gold/40" : "hover:border-gold/50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/30 to-maroon/40 grid place-items-center shrink-0">
                    <Users className="w-5 h-5 text-gold" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-base text-parchment">{g.name}</div>
                    {g.leader_name && <div className="text-xs text-parchment/60">Led by {g.leader_name}</div>}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {g.meeting_day && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-maroon/40 text-parchment/70 border border-gold/20 inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {g.meeting_day}
                        </span>
                      )}
                      {g.meeting_time && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-maroon/40 text-parchment/70 border border-gold/20 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {g.meeting_time}
                        </span>
                      )}
                      {g.location && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-maroon/40 text-parchment/70 border border-gold/20 inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {g.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-center">
                    <div className="font-display text-xl gold-text">{g.member_count}</div>
                    <div className="text-[9px] uppercase tracking-widest text-parchment/50">Members</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteGroup(g.id); }} className="p-1.5 rounded-lg hover:bg-red-900/30 text-parchment/40 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Group detail panel */}
        <div className="glass-dark rounded-2xl p-5 sticky top-32 self-start">
          {selected ? (
            <>
              <div className="font-display text-xl text-parchment">{selected.name}</div>
              {selected.leader_name && <div className="text-sm text-parchment/60 mt-1">Leader: {selected.leader_name}</div>}
              <div className="flex flex-wrap gap-2 mt-3">
                {selected.zone && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30">Zone: {selected.zone}</span>}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-verdant/20 text-verdant-light border border-verdant/30">{selected.member_count} members</span>
              </div>

              <div className="mt-5">
                <div className="text-[10px] tracking-widest text-gold/80 uppercase mb-2">Add Member</div>
                <div className="flex gap-2">
                  <select
                    value={addMemberId}
                    onChange={(e) => setAddMemberId(e.target.value)}
                    className="flex-1 bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm text-parchment focus:outline-none focus:border-gold/50"
                  >
                    <option value="" className="bg-ink">Select member...</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id} className="bg-ink">{m.first_name} {m.last_name}</option>
                    ))}
                  </select>
                  <button onClick={addMember} className="px-3 py-2 rounded-lg btn-gold text-xs">
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-2 max-h-[400px] overflow-y-auto">
                {groupMembers.length === 0 && <div className="text-xs text-parchment/50 text-center py-4">No members in this group</div>}
                {groupMembers.map((gm) => (
                  <div key={gm.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-black/30 border border-gold/10">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-maroon grid place-items-center text-[10px] font-display text-ink shrink-0">
                        {gm.first_name[0]}{gm.last_name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm text-parchment truncate">{gm.first_name} {gm.last_name}</div>
                        {gm.phone && <div className="text-[10px] text-parchment/50 truncate">{gm.phone}</div>}
                      </div>
                    </div>
                    <button onClick={() => removeMember(gm.member_id)} className="text-parchment/40 hover:text-red-400 p-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-parchment/50 text-sm">
              Select a cell group to manage its members
            </div>
          )}
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowCreate(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 z-50 grid place-items-center p-4">
            <div className="w-full max-w-md glass-dark rounded-3xl p-6 border border-gold/30" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="font-display text-lg gold-text">New Cell Group</div>
                <button onClick={() => setShowCreate(false)} className="text-parchment/60 hover:text-gold"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <label className="block">
                  <div className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1.5">Group Name</div>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold/50" />
                </label>
                <label className="block">
                  <div className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1.5">Leader</div>
                  <select value={form.leader_id} onChange={(e) => setForm({ ...form, leader_id: e.target.value })} className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold/50">
                    <option value="" className="bg-ink">Select leader...</option>
                    {members.map((m) => (<option key={m.id} value={m.id} className="bg-ink">{m.first_name} {m.last_name}</option>))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <div className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1.5">Meeting Day</div>
                    <select value={form.meeting_day} onChange={(e) => setForm({ ...form, meeting_day: e.target.value })} className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold/50">
                      <option value="" className="bg-ink">Select day...</option>
                      {DAYS.map((d) => (<option key={d} className="bg-ink">{d}</option>))}
                    </select>
                  </label>
                  <label className="block">
                    <div className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1.5">Time</div>
                    <input type="time" value={form.meeting_time} onChange={(e) => setForm({ ...form, meeting_time: e.target.value })} className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold/50" />
                  </label>
                </div>
                <label className="block">
                  <div className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1.5">Location</div>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold/50" />
                </label>
                <label className="block">
                  <div className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1.5">Zone</div>
                  <input value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold/50" />
                </label>
              </div>
              <button onClick={create} className="mt-5 w-full py-3 rounded-full btn-gold text-sm">Create Group</button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
