import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Play, Quote, BookOpen } from "lucide-react";
import { api } from "../utils/api";
import { useI18n } from "../i18n";

function parseVideoUrl(url: string): { platform: "youtube" | "facebook" | null; src: string } | null {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]+)/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
      /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]+)/,
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return { platform: "youtube", src: `https://www.youtube.com/embed/${m[1]}?autoplay=0&rel=0&modestbranding=1` };
    }
  }
  if (lower.includes("facebook.com") || lower.includes("fb.watch")) {
    return { platform: "facebook", src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=760` };
  }
  return null;
}

export default function OverseerSection() {
  const { t } = useI18n();
  const [cms, setCms] = useState({
    name: 'Apostle Joshua O. Adekunle',
    title: 'General Overseer',
    bio: 'Called by God in 1986, Apostle Joshua O. Adekunle is the founder and General Overseer of the Holiness Evangelistic Church. With a mandate to preach "Holiness, without which no man shall see the Lord" (Hebrews 12:14), his ministry has spanned four decades across four continents.',
    quote: '"The church is not a building — it is a people torchlit by the Spirit, walking in the beauty of holiness until the Master returns."',
    image_url: '',
    videoUrl: '',
    videoTitle: 'The Beauty of Holiness',
    videoPreacher: 'Apostle Joshua O. Adekunle',
    videoVerse: 'Hebrews 12:14',
  });

  useEffect(() => {
    api.getPublicSiteContent().then((data: any) => {
      if (data?.overseer) {
        setCms((prev) => ({
          ...prev,
          name: data.overseer.name || prev.name,
          title: data.overseer.title || prev.title,
          bio: data.overseer.bio || prev.bio,
          quote: data.overseer.quote || prev.quote,
          image_url: data.overseer.image_url || prev.image_url,
        }));
      }
      if (data?.video) {
        setCms((prev) => ({
          ...prev,
          videoTitle: data.video.title || prev.videoTitle,
          videoPreacher: data.video.preacher || prev.videoPreacher,
          videoVerse: data.video.verse || prev.videoVerse,
          videoUrl: data.video.url || prev.videoUrl,
        }));
      }
    }).catch((e) => console.error("Fetch failed", e));
  }, []);
  return (
    <section className="relative py-20 px-5 lg:px-8 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        {/* Portrait & Bio */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative mx-auto max-w-sm">
            {/* Glow behind portrait */}
            <div className="absolute -inset-8 bg-[radial-gradient(ellipse_at_center,rgba(44,62,80,0.15),transparent_60%)]" />
            {/* Portrait frame */}
            <div className="relative rounded-[2rem] overflow-hidden border-2 border-silver/40 shadow-2xl">
              {cms.image_url ? (
                <img src={cms.image_url} alt={cms.name} className="w-full aspect-[4/5] object-cover" />
              ) : (
              <div className="aspect-[4/5] bg-gradient-to-br from-accent-dark via-accent-dark to-accent-dark flex items-end justify-center p-6">
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-accent/30 to-accent/50 border-2 border-silver/40 grid place-items-center">
                    <span className="font-display text-6xl text-white">JA</span>
                  </div>
                  <div className="mt-4 silver-divider" />
                </div>
              </div>
              )}
            </div>
            {/* Decorative frame corners */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-silver/60 rounded-tl-lg" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-silver/60 rounded-tr-lg" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-silver/60 rounded-bl-lg" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-silver/60 rounded-br-lg" />
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="text-[11px] tracking-[0.4em] uppercase text-accent/80">
            {t('overseer.title')}
          </div>
          <h2 className="font-display text-4xl md:text-5xl leading-tight">
            <span className="heading-text">{cms.name.split(' ').slice(0, -1).join(' ') || 'Apostle Joshua'}</span>
            <br />
            <span className="text-body">{cms.name.split(' ').pop() || 'O. Adekunle'}</span>
          </h2>
          <div className="text-body text-sm leading-relaxed max-w-lg space-y-4">
            {cms.bio.split('\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* Quote */}
          <div className="glass rounded-2xl p-5 border-l-4 border-silver">
            <Quote className="w-5 h-5 text-accent mb-2" />
            <p className="font-script italic text-lg text-body leading-relaxed">
              {cms.quote}
            </p>
            <div className="mt-3 text-xs text-accent/80">— {cms.name}</div>
          </div>

          {/* Video message CTA */}
          <div className="flex flex-wrap gap-3">
            <button className="px-5 py-2.5 rounded-full btn-primary text-sm inline-flex items-center gap-2">
              <Play className="w-4 h-4 fill-current" /> {t('overseer.watch')}
            </button>
            <button className="px-5 py-2.5 rounded-full glass text-sm inline-flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Read Ministry Bio
            </button>
          </div>
        </motion.div>
      </div>

      {/* Video Message Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-20"
      >
        <div className="text-center mb-10">
          <div className="text-[11px] tracking-[0.4em] uppercase text-accent/80 mb-3">
            Watch & Be Blessed
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-body">
            This Week's Message
          </h2>
          <div className="silver-divider mt-4 mx-auto max-w-xs" />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden glass-dark border border-silver/20">
            {(() => {
              const parsed = parseVideoUrl(cms.videoUrl);
              if (parsed) {
                return (
                  <div className="aspect-video relative">
                    <iframe src={parsed.src} className="absolute inset-0 w-full h-full" allow="autoplay; encrypted-media; fullscreen" allowFullScreen title="Weekly Message" />
                  </div>
                );
              }
              return (
              <div className="aspect-video relative bg-gradient-to-br from-accent-dark via-accent-dark to-accent-dark">
                {/* Play button overlay */}
                <div className="absolute inset-0 grid place-items-center">
                  <div className="w-20 h-20 rounded-full bg-accent/90 grid place-items-center cursor-pointer hover:scale-105 transition shadow-2xl">
                    <Play className="w-8 h-8 fill-white ml-1" />
                  </div>
                </div>
                {/* Background pattern */}
                <div className="absolute inset-0 divine-grid opacity-20" />
                {/* Cross silhouette */}
                <svg viewBox="0 0 100 100" className="absolute top-4 right-4 w-16 h-16 opacity-30">
                  <rect x="44" y="10" width="12" height="80" fill="#BDC3C7" />
                  <rect x="20" y="40" width="60" height="12" fill="#BDC3C7" />
                </svg>
                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="text-[10px] tracking-[0.3em] text-white/80 uppercase">Sunday Divine Encounter</div>
                  <div className="font-display text-xl text-white mt-1">"{cms.videoTitle}"</div>
                  <div className="text-sm text-white/75 mt-0.5">{cms.videoPreacher} · {cms.videoVerse}</div>
                </div>
              </div>
              );
            })()}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
