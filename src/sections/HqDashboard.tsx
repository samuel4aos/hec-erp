import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Users, Church, ShoppingBag, GraduationCap, HandCoins, TrendingUp, Calendar, Bell, BarChart3, ExternalLink, DollarSign, Globe2 } from "lucide-react";
import { api } from "../utils/api";

interface DashboardStats {
  members: number; activeBranches: number; pendingGiving: number;
  pendingOrders: number; pendingTestimonies: number; upcomingEvents: number;
  courses: number; firstTimers: number; todayBirthdays: number;
  pendingRemittances: number; totalGiving: number; totalExpenses: number;
}

export default function HqDashboard({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [stats, setStats] = useState<DashboardStats>({
    members: 0, activeBranches: 0, pendingGiving: 0, pendingOrders: 0,
    pendingTestimonies: 0, upcomingEvents: 0, courses: 0, firstTimers: 0,
    todayBirthdays: 0, pendingRemittances: 0, totalGiving: 0, totalExpenses: 0,
  });
  const [recentGiving, setRecentGiving] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.getMembers().then(r => setStats(s => ({ ...s, members: r.length }))).catch(() => {}),
      api.getBranches().then(r => setStats(s => ({ ...s, activeBranches: r.length }))).catch(() => {}),
      api.getGiving().then(r => {
        setStats(s => ({ ...s, pendingGiving: r.filter((g: any) => g.status === 'pending').length, totalGiving: r.reduce((sum: number, g: any) => sum + Number(g.amount), 0) }));
        setRecentGiving(r.slice(0, 5));
      }).catch(() => {}),
      api.getEvents().then(r => setStats(s => ({ ...s, upcomingEvents: r.length }))).catch(() => {}),
      api.getCourses().then(r => setStats(s => ({ ...s, courses: r.length }))).catch(() => {}),
      api.getProducts().then(r => setStats(s => ({ ...s, pendingOrders: r.length }))).catch(() => {}),
      api.getTestimonies().then(r => setStats(s => ({ ...s, pendingTestimonies: r.filter((t: any) => t.status === 'pending').length }))).catch(() => {}),
      api.getFirstTimers().then(r => setStats(s => ({ ...s, firstTimers: r.length }))).catch(() => {}),
      api.getBirthdays().then(r => setStats(s => ({ ...s, todayBirthdays: r.length }))).catch(() => {}),
      api.getRemittances().then(r => setStats(s => ({ ...s, pendingRemittances: r.filter((m: any) => m.status === 'pending').length }))).catch(() => {}),
      api.getExpenses().then(r => setStats(s => ({ ...s, totalExpenses: r.reduce((sum: number, e: any) => sum + Number(e.amount), 0) }))).catch(() => {}),
    ]);
  }, []);

  const cards = [
    { label: "Total Members", value: stats.members, icon: Users, color: "#d4af37", link: "admin-members" },
    { label: "Active Branches", value: stats.activeBranches, icon: Church, color: "#006400", link: "admin-branches" },
    { label: "Pending Giving", value: stats.pendingGiving, icon: HandCoins, color: "#a32020", link: "portal" },
    { label: "Upcoming Events", value: stats.upcomingEvents, icon: Calendar, color: "#9a7d22", link: "admin-registrations" },
    { label: "Academy Courses", value: stats.courses, icon: GraduationCap, color: "#2a8c2a", link: "admin-academy" },
    { label: "First-Timers", value: stats.firstTimers, icon: TrendingUp, color: "#f0cf5e", link: "admin-firsttimers" },
    { label: "Books", value: stats.pendingOrders, icon: ShoppingBag, color: "#800000", link: "admin-bookstore" },
    { label: "Remittances", value: stats.pendingRemittances, icon: DollarSign, color: "#d4af37", link: "portal" },
  ];

  const quickActions = [
    { label: "Member Directory", desc: "View, edit, add members across all branches", icon: Users, link: "admin-members", color: "#800000" },
    { label: "Growth Analytics", desc: "Full network intelligence & heatmaps", icon: BarChart3, link: "analytics", color: "#d4af37" },
    { label: "Cell Groups", desc: "Manage small groups and attendance", icon: Church, link: "admin-cellgroups", color: "#006400" },
    { label: "First-Timer Pipeline", desc: "Track every soul from welcome to discipleship", icon: TrendingUp, link: "admin-firsttimers", color: "#a32020" },
    { label: "Event Registrations", desc: "View and check in attendees", icon: Calendar, link: "admin-registrations", color: "#9a7d22" },
    { label: "Bookstore CMS", desc: "Manage products and approve orders", icon: ShoppingBag, link: "admin-bookstore", color: "#4a0000" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <div className="pt-20">
        <div className="flex items-center gap-2 text-gold/80 text-[11px] tracking-[0.4em] uppercase mb-3">
          <Crown className="w-4 h-4" /> HQ Super-Admin
        </div>
        <h1 className="font-display text-4xl md:text-5xl gold-text">Command Centre</h1>
        <p className="mt-3 text-parchment/65 max-w-2xl">
          Full multi-branch oversight. <strong className="text-gold">${(stats.totalGiving / 1000).toFixed(1)}K</strong> total giving · <strong className="text-gold">${(stats.totalExpenses / 1000).toFixed(1)}K</strong> expenses · <strong className="text-gold">{stats.todayBirthdays}</strong> birthdays today
        </p>
        <div className="gold-divider mt-6 max-w-xs" />
      </div>

      {/* Stats grid */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-2">
        {cards.map((c, i) => (
          <motion.button
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onNavigate(c.link)}
            className="glass rounded-xl p-3 text-left hover:border-gold/50 transition"
          >
            <div className="w-8 h-8 rounded-lg grid place-items-center mb-1.5" style={{ background: c.color }}>
              <c.icon className="w-3.5 h-3.5 text-parchment" />
            </div>
            <div className="font-display text-lg gold-text">{c.value}</div>
            <div className="text-[9px] uppercase tracking-widest text-parchment/55">{c.label}</div>
          </motion.button>
        ))}
      </div>

      {/* Recent giving feed + Quick actions */}
      <div className="mt-8 grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe2 className="w-4 h-4 text-gold" />
            <div className="font-display text-lg gold-text">Recent Giving Feed</div>
          </div>
          <div className="space-y-2">
            {recentGiving.length === 0 && <div className="text-xs text-parchment/50 text-center py-8">No giving records yet</div>}
            {recentGiving.map((g: any, i: number) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black/30 border border-gold/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-maroon grid place-items-center">
                  <DollarSign className="w-4 h-4 text-ink" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-parchment truncate"><span className="text-gold font-semibold">${Number(g.amount).toLocaleString()}</span> · {g.purpose || 'offering'}</div>
                  <div className="text-[11px] text-parchment/55">{g.full_name} · {g.status}</div>
                </div>
                <span className="text-[10px] text-parchment/40">{new Date(g.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-gold" />
            <div className="font-display text-lg gold-text">Quick Manage</div>
          </div>
          <div className="space-y-2">
            {quickActions.map((a, i) => (
              <motion.button
                key={a.label}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onNavigate(a.link)}
                className="w-full glass rounded-xl p-3 text-left hover:border-gold/50 transition group flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg grid place-items-center shrink-0" style={{ background: a.color }}>
                  <a.icon className="w-4 h-4 text-parchment" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-parchment">{a.label}</div>
                  <div className="text-[10px] text-parchment/60 truncate">{a.desc}</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gold/60 shrink-0 opacity-0 group-hover:opacity-100 transition" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* System info */}
      <div className="mt-10 glass-dark rounded-2xl p-6">
        <div className="font-display text-lg text-parchment mb-3">System Overview</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-[10px] tracking-widest text-gold/80 uppercase mb-1">Database</div>
            <div className="text-parchment/80">Neon Postgres (RLS-enabled)</div>
          </div>
          <div>
            <div className="text-[10px] tracking-widest text-gold/80 uppercase mb-1">Auth</div>
            <div className="text-parchment/80">JWT · 4 role levels</div>
          </div>
          <div>
            <div className="text-[10px] tracking-widest text-gold/80 uppercase mb-1">AI Engine</div>
            <div className="text-parchment/80">GPT-4o-mini · Prayer · Sermon</div>
          </div>
          <div>
            <div className="text-[10px] tracking-widest text-gold/80 uppercase mb-1">Communication</div>
            <div className="text-parchment/80">Termii SMS + Resend Email</div>
          </div>
        </div>
      </div>
    </div>
  );
}
