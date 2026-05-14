import { useEffect, useState } from "react";
import { Header } from "./LiveStream";
import { motion } from "framer-motion";
import { Play, Lock, CheckCircle2, GraduationCap, Award, Clock, Users, Bell } from "lucide-react";
import { api } from "../utils/api";

interface Course {
  id: string;
  title: string;
  code: string;
  instructor: string | null;
  description: string | null;
  duration_weeks: number | null;
  total_lessons: number | null;
  color: string | null;
  badge: string | null;
  is_locked: boolean;
  ordering: number;
}

interface Module {
  id: string;
  name: string;
  ordering: number;
}

export default function Academy() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selected, setSelected] = useState<Course | null>(null);

  useEffect(() => {
    api.getCourses().then(setCourses).catch((e) => console.error("Fetch failed", e));
  }, []);

  useEffect(() => {
    if (selected) {
      api.getCourseModules(selected.id).then(setModules).catch(() => {});
    }
  }, [selected]);

  const sel = selected || courses[0];

  if (courses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
        <Header
          title="HEC Academy"
          subtitle="The discipleship engine of the church. Pastors are auto-notified the moment a member completes a course."
        />
        <div className="mt-12 text-center py-16 text-parchment/50 text-sm">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <Header
        title="HEC Academy"
        subtitle="The discipleship engine of the church. Pastors are auto-notified the moment a member completes a course."
      />

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        {[
          { icon: GraduationCap, label: "Courses available", value: courses.length.toString() },
          { icon: Award, label: "Total lessons", value: courses.reduce((s, c) => s + (c.total_lessons || 0), 0).toString() },
          { icon: Bell, label: "Enrolled members", value: "Active" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-maroon/40 grid place-items-center">
              <s.icon className="w-4 h-4 text-gold" />
            </div>
            <div>
              <div className="font-display text-xl gold-text">{s.value}</div>
              <div className="text-[11px] uppercase tracking-widest text-parchment/55">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="grid sm:grid-cols-2 gap-4">
          {courses.map((c, i) => (
            <motion.button
              key={c.id}
              onClick={() => { setSelected(c); setModules([]); }}
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`text-left glass rounded-2xl p-5 relative overflow-hidden ${
                sel?.id === c.id ? "ring-1 ring-gold" : ""
              }`}
            >
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-40"
                style={{ background: c.color || '#800000' }}
              />
              <div className="relative">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] tracking-widest text-gold/70 uppercase">{c.code}</div>
                    <div className="font-display text-base text-parchment mt-1">{c.title}</div>
                    <div className="text-[11px] text-parchment/60 mt-0.5">{c.instructor || 'HEC Faculty'}</div>
                  </div>
                  {c.badge ? (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-gold text-ink font-bold tracking-widest">{c.badge}</span>
                  ) : c.is_locked ? (
                    <Lock className="w-4 h-4 text-parchment/40" />
                  ) : null}
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-parchment/60">
                  <span className="inline-flex items-center gap-1"><Play className="w-3 h-3" /> {c.total_lessons || 0} lessons</span>
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {c.duration_weeks || 0} weeks</span>
                  <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> {c.ordering || 0}</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Course detail */}
        <motion.div
          key={sel.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-dark rounded-2xl p-6 sticky top-32 self-start"
        >
          <div className="text-[10px] tracking-widest text-gold/80 uppercase">{sel.code}</div>
          <div className="font-display text-2xl text-parchment mt-1">{sel.title}</div>
          <div className="text-xs text-parchment/65 mt-1">{sel.instructor || 'HEC Faculty'}</div>
          {sel.description && (
            <p className="mt-3 text-xs text-parchment/70 leading-relaxed">{sel.description}</p>
          )}

          <div className="mt-5">
            <div className="text-[11px] tracking-widest text-gold/80 uppercase mb-2">Modules</div>
            <div className="space-y-1.5">
              {modules.length === 0 && (
                <div className="text-xs text-parchment/50 text-center py-4">No modules loaded</div>
              )}
              {modules.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black/25">
                  <Play className="w-3.5 h-3.5 text-gold/70" />
                  <span className="text-sm text-parchment/90">{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          {sel.is_locked ? (
            <div className="mt-6 w-full py-3 rounded-full glass text-sm text-center text-parchment/50">
              <Lock className="w-4 h-4 inline mr-1" /> Locked — Complete previous courses
            </div>
          ) : (
            <button className="mt-6 w-full py-3 rounded-full btn-gold inline-flex items-center justify-center gap-2">
              <Play className="w-4 h-4 fill-current" /> Start Course
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
