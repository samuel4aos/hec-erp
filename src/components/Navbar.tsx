import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Logo from "./Logo";
import LanguageToggle from "./LanguageToggle";
import { Menu, X, LogIn } from "lucide-react";
import { useAuth } from "../store/auth";
import { useI18n } from "../i18n";
import { api } from "../utils/api";

export type Section =
  | "home"
  | "live"
  | "grace"
  | "prayer"
  | "manna"
  | "academy"
  | "bookstore"
  | "analytics"
  | "portal"
  | "admin-dashboard"
  | "admin-members"
  | "admin-bookstore"
  | "admin-academy"
  | "admin-branches"
  | "admin-cellgroups"
  | "admin-registrations"
  | "admin-firsttimers"
  | "admin-attendance"
  | "admin-counselling"
  | "admin-soulwinning"
  | "admin-bookstore"
  | "admin-academy"
  | "admin-branches"
  | "admin-cms"
  | "admin-attendance-report"
  | "admin-gracegiver"
  | "portal-hq"
  | "portal-pastor"
  | "portal-treasurer"
  | "portal-ushers"
  | "workspace-ushers"
  | "workspace-treasurer"
  | "workspace-pastor";

const PUBLIC_NAV: { id: Section; key: string }[] = [
  { id: "home", key: "nav.home" },
  { id: "live", key: "nav.live" },
  { id: "grace", key: "nav.grace" },
  { id: "prayer", key: "nav.prayer" },
  { id: "manna", key: "nav.manna" },
  { id: "academy", key: "nav.academy" },
  { id: "bookstore", key: "nav.bookstore" },
];

interface Props {
  current: Section;
  setCurrent: (s: Section) => void;
  onOpenLogin: () => void;
}

export default function Navbar({ current, setCurrent, onOpenLogin }: Props) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useI18n();
  const [tickerMessages, setTickerMessages] = useState<string[]>([
    'Annual Convocation — Lagos HQ — Dec 18-22, 2026',
    'New Branch Opening: Nairobi East — Welcome Pst. Otieno',
    'Global Fast & Prayer begins Monday at 6:00 AM WAT',
    'HEC Academy Cohort 14 enrollment now open',
    'Tithe remittance window closes 25th of every month',
  ]);

  useEffect(() => {
    api.getPublicSiteContent().then((data: any) => {
      if (data?.ticker?.messages) {
        try {
          const parsed = JSON.parse(data.ticker.messages);
          if (Array.isArray(parsed)) setTickerMessages(parsed);
        } catch { /* keep defaults */ }
      }
    }).catch((e) => console.error("Fetch failed", e));
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-40">
      <div className="glass-dark border-b border-silver/20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => setCurrent("home")} className="shrink-0">
            <Logo />
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {PUBLIC_NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setCurrent(n.id)}
                className={`relative px-3 py-2 text-[12.5px] tracking-wide rounded-md transition ${
                  current === n.id
                    ? "text-accent"
                    : "text-body hover:text-body"
                }`}
              >
                {t(n.key)}
                {current === n.id && (
                  <motion.span
                    layoutId="navactive"
                    className="absolute -bottom-0.5 left-2 right-2 h-px bg-gradient-to-r from-transparent via-accent to-transparent"
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <LanguageToggle />
            {user ? (
              <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent to-accent grid place-items-center font-display text-[10px] text-white">
                  {user.full_name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <span className="text-body hidden sm:inline">{user.full_name.split(" ")[0]}</span>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 rounded-full btn-primary text-xs inline-flex items-center gap-2"
              >
                <LogIn className="w-3.5 h-3.5" /> Portal Login
              </button>
            )}
          </div>

          <button
            className="lg:hidden p-2 text-accent"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-silver/15 overflow-hidden"
            >
              <div className="px-5 py-3 grid grid-cols-2 gap-2">
                {PUBLIC_NAV.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => { setCurrent(n.id); setOpen(false); }}
                    className={`text-left px-3 py-2 rounded-md text-sm ${
                      current === n.id
                        ? "bg-accent/40 text-accent"
                        : "text-body"
                    }`}
                  >
                    {t(n.key)}
                  </button>
                ))}
                <button
                  onClick={() => { onOpenLogin(); setOpen(false); }}
                  className="col-span-2 text-left px-3 py-2 rounded-md text-sm inline-flex items-center gap-2 bg-accent/20 text-accent"
                >
                  <LogIn className="w-4 h-4" /> Portal Login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Announcement ticker */}
      <div className="bg-gradient-to-r from-accent-dark via-accent to-accent-dark border-b border-silver/30 overflow-hidden">
        <div className="flex items-center gap-3 px-4 h-9 text-[12px] text-white/85">
          <span className="shrink-0 px-2 py-0.5 rounded bg-accent text-white font-bold tracking-wider text-[10px]">
            HQ LIVE
          </span>
          <div className="overflow-hidden flex-1">
            <div className="ticker-track inline-flex gap-12 whitespace-nowrap">
              {Array(2).fill(0).map((_, k) => (
                <span key={k} className="inline-flex gap-12">
                  {tickerMessages.map((msg, i) => (
                    <span key={i}>✦ {msg}</span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Section type already exported inline above
