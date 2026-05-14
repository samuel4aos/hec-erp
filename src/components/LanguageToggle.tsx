import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe2, ChevronDown } from "lucide-react";
import { useI18n, LANGS, type Lang } from "../i18n";

export default function LanguageToggle() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 glass rounded-full text-[11px] text-parchment/80 hover:text-gold transition"
      >
        <Globe2 className="w-3.5 h-3.5" />
        <span>{LANGS[lang]}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              className="absolute right-0 top-full mt-1 z-50 glass-dark rounded-xl border border-gold/30 p-1 min-w-[140px]"
            >
              {(Object.entries(LANGS) as [Lang, string][]).map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => { setLang(code); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    lang === code ? "bg-gold/20 text-gold" : "text-parchment/70 hover:text-parchment hover:bg-white/5"
                  }`}
                >
                  {name}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
