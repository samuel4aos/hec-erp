import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Search, ExternalLink } from "lucide-react";
import { api } from "../utils/api";

interface Registration {
  id: string;
  event_id: string;
  event_title: string;
  start_date: string;
  event_location: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  checked_in: boolean;
  registered_at: string;
}

export default function EventRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getEventRegistrations().then(setRegistrations).catch((e) => console.error("Fetch failed", e));
  }, []);

  const toggleCheckin = async (id: string) => {
    const updated = await api.checkInRegistration(id).catch(() => null);
    if (updated) {
      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, checked_in: updated.checked_in } : r))
      );
    }
  };

  const filtered = registrations.filter(
    (r) =>
      r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.event_title?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: registrations.length,
    checkedIn: registrations.filter((r) => r.checked_in).length,
    pending: registrations.filter((r) => !r.checked_in).length,
  };

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <div className="pt-20">
        <div className="text-[11px] tracking-[0.4em] uppercase text-gold/80 mb-3">
          Admin Portal
        </div>
        <h1 className="font-display text-4xl md:text-5xl gold-text">Event Registrations</h1>
        <p className="mt-3 text-parchment/65 max-w-2xl">View and check in attendees for all events.</p>
        <div className="gold-divider mt-6 max-w-xs" />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: "Total Registrations", value: stats.total, color: "#d4af37" },
          { label: "Checked In", value: stats.checkedIn, color: "#006400" },
          { label: "Pending", value: stats.pending, color: "#a32020" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4">
            <div className="font-display text-2xl" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] uppercase tracking-widest text-parchment/55">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/60" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, event, or email..." className="w-full bg-black/40 border border-gold/15 rounded-full pl-10 pr-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-gold/50" />
      </div>

      <div className="mt-6 space-y-2">
        {filtered.length === 0 && <div className="text-center py-12 text-parchment/50 text-sm">No registrations found.</div>}
        {filtered.map((reg, i) => (
          <motion.div
            key={reg.id}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.02 }}
            className="glass rounded-xl p-4 flex items-center gap-4 flex-wrap"
          >
            <button onClick={() => toggleCheckin(reg.id)} className="shrink-0">
              {reg.checked_in ? (
                <CheckCircle2 className="w-6 h-6 text-verdant-light" />
              ) : (
                <Circle className="w-6 h-6 text-parchment/40" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <div className="font-display text-base text-parchment">{reg.full_name}</div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-parchment/60 mt-1">
                {reg.event_title && <span className="inline-flex items-center gap-1"><ExternalLink className="w-3 h-3 text-gold" /> {reg.event_title}</span>}
                {reg.email && <span>{reg.email}</span>}
                {reg.phone && <span>{reg.phone}</span>}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className={`text-[10px] font-bold tracking-wider ${reg.checked_in ? "text-verdant-light" : "text-gold/60"}`}>
                {reg.checked_in ? "CHECKED IN" : "NOT CHECKED IN"}
              </div>
              <div className="text-[10px] text-parchment/40 mt-0.5">{new Date(reg.registered_at).toLocaleDateString()}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
