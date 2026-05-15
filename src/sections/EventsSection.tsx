import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../utils/api";
import { useI18n } from "../i18n";

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string | null;
  location: string;
  flyer_url: string | null;
  registration_required: boolean;
}

export default function EventsSection() {
  const { t } = useI18n();
  const [events, setEvents] = useState<Event[]>([]);
  const [selected, setSelected] = useState<Event | null>(null);
  useEffect(() => {
    api.getEvents().then(setEvents).catch((e) => console.error("Fetch failed", e));
  }, []);

  const scroll = (dir: number) => {
    const el = document.getElementById("events-scroll");
    if (el) el.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const eventTypeLabel: Record<string, string> = {
    convocation: "Convocation",
    fasting: "Prayer & Fasting",
    seminar: "Seminar",
    youth: "Youth Program",
    outreach: "Outreach",
    service: "Service",
  };

  return (
    <section className="relative py-20 px-5 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-[11px] tracking-[0.4em] uppercase text-accent/80 mb-3">
            {t('events.title')}
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-body leading-tight">
            {t('events.subtitle')}
          </h2>
        </div>
        <div className="hidden sm:flex gap-2">
          <button onClick={() => scroll(-1)} className="w-10 h-10 rounded-full glass grid place-items-center hover:border-silver/50 transition">
            <ChevronLeft className="w-4 h-4 text-accent" />
          </button>
          <button onClick={() => scroll(1)} className="w-10 h-10 rounded-full glass grid place-items-center hover:border-silver/50 transition">
            <ChevronRight className="w-4 h-4 text-accent" />
          </button>
        </div>
      </div>

      <div
        id="events-scroll"
        className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {events.length === 0 ? (
          <div className="flex gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[320px] h-[380px] glass rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          events.map((ev, i) => (
            <motion.button
              key={ev.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setSelected(ev)}
              className="min-w-[320px] snap-start text-left glass rounded-2xl overflow-hidden hover:border-silver/50 transition flex-shrink-0"
            >
              <div className="h-44 bg-gradient-to-br from-accent to-accent-dark relative overflow-hidden">
                {ev.flyer_url ? (
                  <img src={ev.flyer_url} alt={ev.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 divine-grid opacity-40" />
                )}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-accent text-white text-[10px] font-bold tracking-widest">
                  {eventTypeLabel[ev.event_type] || ev.event_type}
                </div>
                {ev.registration_required && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-accent text-white text-[9px] tracking-wider">
                    REGISTER
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 text-[11px] text-body mb-2">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formatDate(ev.start_date)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {ev.location?.split(",")[0]}
                  </span>
                </div>
                <div className="font-display text-base text-body leading-snug">
                  {ev.title}
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent/80">
                  View details <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </motion.button>
          ))
        )}
      </div>

      {/* Event detail modal */}
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
              className="w-full max-w-lg glass-dark rounded-3xl overflow-hidden border border-silver/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-52 bg-gradient-to-br bg-accent-dark relative">
                {selected.flyer_url && (
                  <img src={selected.flyer_url} alt={selected.title} className="w-full h-full object-cover" />
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 grid place-items-center text-white/80 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6">
              <div className="text-[10px] tracking-widest text-white/80 uppercase mb-1">
                  {eventTypeLabel[selected.event_type] || selected.event_type}
                </div>
                <div className="font-display text-2xl text-white">{selected.title}</div>
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/80">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-white/70" /> {formatDate(selected.start_date)}
                    {selected.end_date && ` — ${formatDate(selected.end_date)}`}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-white/70" /> {selected.location}
                  </span>
                </div>
                <p className="mt-4 text-sm text-white/85 leading-relaxed">
                  {selected.description}
                </p>
                {selected.registration_required && (
                  <button className="mt-6 w-full py-3 rounded-full btn-primary inline-flex items-center justify-center gap-2 text-sm">
                    Register for this Event
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </section>
  );
}
