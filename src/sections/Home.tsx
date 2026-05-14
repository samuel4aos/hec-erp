import { motion } from "framer-motion";
import { lazy, Suspense, useState, useEffect } from "react";
import { ArrowRight, Globe2, ShieldCheck, Sparkles, Users } from "lucide-react";
import EventsSection from "./EventsSection";
import OverseerSection from "./OverseerSection";
import { api } from "../utils/api";
import { useI18n } from "../i18n";

const Hero3D = lazy(() => import("../components/Hero3D"));

const statKeys = ['home.stats.branches', 'home.stats.members', 'home.stats.souls', 'home.stats.protected'];
const statIcons = [Globe2, Users, Sparkles, ShieldCheck];
const defaultStatValues = ['142', '84,210', '12,884', '100%'];

export default function Home({ go }: { go: (s: any) => void }) {
  const { t } = useI18n();
  const [statValues, setStatValues] = useState(defaultStatValues);
  const [heroImage, setHeroImage] = useState<string | null>(null);

  useEffect(() => {
    api.getPublicSiteContent().then((data: any) => {
      if (data?.hero?.image_url) setHeroImage(data.hero.image_url);
      if (data?.stats) {
        const keys = ['branches', 'members', 'souls', 'protected'];
        const vals: string[] = [];
        for (const k of keys) {
          try {
            const obj = JSON.parse(data.stats[k] || '{}');
            vals.push(obj.value || '');
          } catch { vals.push(''); }
        }
        if (vals.every(Boolean)) setStatValues(vals);
      }
    }).catch((e) => console.error("Fetch failed", e));
  }, []);

  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative min-h-[92vh] maroon-bg overflow-hidden">
        <div className="absolute inset-0 divine-grid opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.18),transparent_60%)]" />
        {heroImage && (
          <div className="absolute inset-0">
            <img src={heroImage} alt="" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-r from-maroon/90 to-transparent" />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-32 pb-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs text-gold"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-verdant-light animate-pulse" />
              Multi-Tenant Church ERP · Powered by Neon Postgres + RLS
            </motion.div>

              <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl mt-5 leading-[1.02]"
            >
              <span className="gold-text">Holiness</span>
              <br />
              <span className="text-parchment">{t('home.hero.title').split(',')[1] || 'Without which,'}</span>
              <br />
              <span className="font-script italic text-parchment/90">
                no man shall see the Lord.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-6 text-parchment/75 text-base md:text-lg max-w-xl leading-relaxed"
            >
              {t('home.hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <button
                onClick={() => go("live")}
                className="btn-gold px-6 py-3 rounded-full inline-flex items-center gap-2"
              >
                {t('home.watch')} <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => go("grace")}
                className="px-6 py-3 rounded-full glass text-parchment/90 hover:text-gold transition"
              >
                {t('home.give')}
              </button>
            </motion.div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {statKeys.map((key, i) => {
                const Icon = statIcons[i];
                return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="glass rounded-xl p-3"
                >
                  <Icon className="w-4 h-4 text-gold mb-1.5" />
                  <div className="font-display text-lg gold-text">
                    {statValues[i]}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-parchment/60">
                    {t(key)}
                  </div>
                </motion.div>
                );
              })}
            </div>
          </div>

          {/* 3D centerpiece */}
          <div className="relative h-[460px] lg:h-[640px]">
            <div className="absolute inset-0 rounded-[2rem] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.25),transparent_60%)] halo" />
              <Suspense
                fallback={
                  <div className="absolute inset-0 grid place-items-center text-gold/60 text-sm">
                    ✦ Loading sanctuary...
                  </div>
                }
              >
                <Hero3D />
              </Suspense>
            </div>
            <div className="absolute -bottom-2 left-0 right-0 text-center text-[11px] tracking-[0.4em] text-gold/70 uppercase">
              Established · 1986 · Lagos · Nigeria
            </div>
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <EventsSection />

      {/* OVERSEER */}
      <OverseerSection />
    </div>
  );
}


