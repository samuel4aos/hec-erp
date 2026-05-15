import { useState } from "react";
import { Header } from "./LiveStream";
import { ChevronLeft, ChevronRight, BookOpen, Calendar, Share2 } from "lucide-react";
import { motion } from "framer-motion";

const devotionals = [
  {
    date: "Today · Sunday",
    title: "The Beauty of Holiness",
    verse: "Hebrews 12:14",
    quote:
      "Pursue peace with all people, and holiness, without which no one will see the Lord.",
    body: "Holiness is not a museum exhibit — it is the daily air the believer breathes. Every choice, every word, every glance is a brick in the temple the Holy Spirit is building inside you. Refuse to negotiate with sin today. The God who calls you holy is also the God who makes you holy.",
    confession:
      "I am the temple of the Holy Spirit. Sin has no claim, no foothold, no future in me. I walk in the beauty of holiness today.",
  },
  {
    date: "Tomorrow · Monday",
    title: "When Heaven Opens",
    verse: "Malachi 3:10",
    quote:
      "Bring all the tithes into the storehouse... and prove Me now in this, says the Lord of hosts.",
    body: "God is the only Person in Scripture who invites you to test Him. When the storehouse is honored, the windows of heaven cannot stay shut. Faithfulness in the smallest currency of obedience opens the largest doors of supply.",
    confession:
      "I am a faithful steward. My giving opens heaven over my finances, my family, and my future.",
  },
  {
    date: "Tuesday",
    title: "The Quiet Power of Waiting",
    verse: "Isaiah 40:31",
    quote: "Those who wait on the Lord shall renew their strength.",
    body: "Waiting is not wasted time — it is renovation time. While you wait, God is replacing eagle-feathers, retraining your spirit, repositioning your destiny. Do not abandon the altar before the answer arrives.",
    confession: "I wait with strength. My season is being prepared.",
  },
  {
    date: "Wednesday",
    title: "Walk in the Spirit",
    verse: "Galatians 5:16",
    quote: "Walk in the Spirit, and you shall not fulfill the lust of the flesh.",
    body: "The Spirit-led life is not the absence of temptation — it is the presence of a stronger Voice. Tune your ear to Him this morning before the world's noise clutters the channel.",
    confession: "I am Spirit-led. I am Spirit-fed. I am Spirit-fueled.",
  },
];

export default function DailyManna() {
  const [i, setI] = useState(0);
  const [turning, setTurning] = useState(false);
  const d = devotionals[i];

  const turn = (dir: 1 | -1) => {
    setTurning(true);
    setTimeout(() => {
      setI((prev) => (prev + dir + devotionals.length) % devotionals.length);
      setTurning(false);
    }, 450);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <Header
        title="Daily Manna"
        subtitle="A fresh portion of the Word, served every dawn. Tap the page to turn."
      />

      <div className="mt-10 grid lg:grid-cols-[1.3fr_1fr] gap-8 items-start">
        {/* Book */}
        <div className="relative">
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg,#4a0000,#1a0606)",
              padding: "28px",
              boxShadow: "0 30px 80px -20px rgba(0,0,0,0.7)",
            }}
          >
            {/* Spine shadow */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-black/60 to-transparent -translate-x-1/2 z-10" />

            <div
              className={`grid grid-cols-2 gap-0 bg-[radial-gradient(ellipse_at_center,#fdf6dd,#e9dcb0)] rounded-lg ${
                turning ? "page-turn" : ""
              }`}
              style={{
                minHeight: 520,
                color: "#3a1a0a",
                boxShadow: "inset 0 0 60px rgba(120,60,20,0.25)",
              }}
            >
              {/* Left page */}
              <div className="p-8 border-r border-amber-900/20">
                <div className="text-[10px] tracking-[0.4em] uppercase text-amber-900/70 inline-flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> {d.date}
                </div>
                <div className="font-display text-3xl mt-3 text-amber-950">
                  {d.title}
                </div>
                <div className="mt-2 text-sm font-semibold text-red-900">
                  {d.verse}
                </div>
                <blockquote className="mt-5 font-script italic text-xl leading-snug text-amber-950 border-l-2 border-red-900/40 pl-3">
                  "{d.quote}"
                </blockquote>
                <div className="mt-6 text-[11px] uppercase tracking-widest text-amber-900/60">
                  ✦ Reflection ✦
                </div>
                <p className="mt-2 text-sm leading-relaxed text-amber-950/90">
                  {d.body}
                </p>
              </div>
              {/* Right page */}
              <div className="p-8">
                <div className="text-[10px] tracking-[0.4em] uppercase text-amber-900/70">
                  Today's Confession
                </div>
                <p className="mt-3 font-script italic text-lg leading-snug text-amber-950">
                  "{d.confession}"
                </p>

                <div className="mt-6 grid grid-cols-3 gap-2">
                  {["Memorize", "Meditate", "Apply"].map((s, k) => (
                    <div
                      key={s}
                      className="rounded-md p-2.5 text-center"
                      style={{
                        background: "rgba(120,60,20,0.08)",
                        border: "1px solid rgba(120,60,20,0.25)",
                      }}
                    >
                      <div className="text-[9px] tracking-widest text-red-900/80">
                        STEP {k + 1}
                      </div>
                      <div className="text-xs font-semibold text-amber-950 mt-0.5">
                        {s}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <div className="text-[10px] uppercase tracking-widest text-amber-900/60 mb-2">
                    Prayer points
                  </div>
                  <ul className="text-sm text-amber-950/85 space-y-1.5">
                    <li>✦ Father, sanctify me wholly today.</li>
                    <li>✦ Holy Spirit, take charge of my decisions.</li>
                    <li>✦ Surround my family with mercy.</li>
                  </ul>
                </div>

                <div className="mt-8 flex items-center justify-between text-[10px] text-amber-900/60">
                  <span>HEC · Daily Manna</span>
                  <span>{i + 1} / {devotionals.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => turn(-1)}
              className="px-4 py-2 rounded-full glass text-sm inline-flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button className="px-4 py-2 rounded-full btn-primary text-sm inline-flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Share today's word
            </button>
            <button
              onClick={() => turn(1)}
              className="px-4 py-2 rounded-full glass text-sm inline-flex items-center gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-5">
          <div className="glass rounded-2xl p-5">
            <div className="font-display text-lg heading-text inline-flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> This week
            </div>
            <div className="mt-3 space-y-2">
              {devotionals.map((dv, k) => (
                <button
                  key={dv.title}
                  onClick={() => setI(k)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border transition ${
                    k === i
                      ? "bg-accent/40 border-silver/40 text-body"
                      : "border-transparent hover:bg-white/5 text-body"
                  }`}
                >
                  <div className="text-[10px] tracking-widest text-accent/70">
                    {dv.date}
                  </div>
                  <div className="text-sm">{dv.title}</div>
                </button>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-dark rounded-2xl p-5"
          >
            <div className="text-[10px] tracking-widest text-accent/80 uppercase">
              Verse of the Hour
            </div>
            <div className="font-script italic text-2xl leading-tight text-body mt-2">
              "Be still, and know that I am God."
            </div>
            <div className="text-sm text-accent mt-2">— Psalm 46:10</div>
          </motion.div>

          <div className="glass rounded-2xl p-5">
            <div className="font-display text-base text-body">
              Subscribe to Daily Manna
            </div>
            <p className="text-xs text-body mt-1">
              Get the devotional via Email/SMS at 5:30 AM your local time.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                placeholder="you@example.com"
                className="flex-1 bg-white border border-silver/30 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-silver/50"
              />
              <button className="px-4 py-2 rounded-full btn-primary text-sm">Subscribe</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
