import { Canvas, useFrame } from "@react-three/fiber";
import { Float, ContactShadows } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./LiveStream";
import { Send, Heart, Quote, Play, ShieldCheck } from "lucide-react";

function Jar({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) group.current.rotation.y = state.clock.elapsedTime * 0.25;
  });

  // generate slips inside jar
  const slips: { x: number; y: number; z: number; rot: number }[] = [];
  const max = Math.min(count, 40);
  for (let i = 0; i < max; i++) {
    const a = (i / max) * Math.PI * 2;
    const r = 0.35 + (i % 3) * 0.15;
    slips.push({
      x: Math.cos(a) * r,
      y: -0.85 + (i % 8) * 0.18,
      z: Math.sin(a) * r,
      rot: a,
    });
  }

  return (
    <group ref={group}>
      {/* Jar body (transparent glass) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.95, 1.05, 2.4, 48, 1, true]} />
        <meshPhysicalMaterial
          color="#fff8e0"
          transmission={0.9}
          thickness={0.6}
          roughness={0.05}
          metalness={0.05}
          ior={1.45}
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Jar bottom */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[1.05, 1.05, 0.05, 48]} />
        <meshPhysicalMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Jar lid */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 0.18, 48]} />
        <meshStandardMaterial color="#800000" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.36, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.04, 48]} />
        <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.18} />
      </mesh>
      {/* Slips */}
      {slips.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]} rotation={[Math.random() * 0.5, s.rot, Math.random() * 0.5]}>
          <boxGeometry args={[0.28, 0.04, 0.18]} />
          <meshStandardMaterial color={i % 3 === 0 ? "#f8f3e3" : i % 3 === 1 ? "#fbe79a" : "#f0d8a0"} />
        </mesh>
      ))}
      {/* Glow */}
      <pointLight position={[0, 0, 0]} intensity={0.8} color="#f0cf5e" distance={3} />
    </group>
  );
}

const initialPrayers = [
  "🙏 Healing for my mother, surgery on Friday — Sis. Adaeze",
  "🙏 New job opportunity in Toronto — Bro. Kwame",
  "🙏 Marriage restoration — Anonymous",
  "🙏 Visa appeal for my brother — Sis. Bola",
];

const testimonies = [
  {
    name: "Sis. Faith O.",
    branch: "Lagos HQ",
    title: "Healed of stage 2 cancer after the August fast",
    body: "Doctors confirmed the tumor is gone. I came to HEC in March barely walking — today I lead the choir again. Glory!",
    likes: 1284,
    video: true,
  },
  {
    name: "Bro. Samuel K.",
    branch: "Nairobi East",
    title: "Promoted after 9 years of stagnation",
    body: "Pastor's word in July's prophetic service: 'Your delay ends this month.' Three weeks later, the appointment letter came.",
    likes: 902,
    video: false,
  },
  {
    name: "Sis. Hannah P.",
    branch: "London UK",
    title: "Pregnant after 7 years",
    body: "We held the prayer cloth from the convocation. By Christmas, the test was positive. Baby Joshua is now 4 months!",
    likes: 2104,
    video: true,
  },
  {
    name: "Bro. Daniel M.",
    branch: "Houston TX",
    title: "Delivered from a 12-year addiction",
    body: "The Holy Spirit met me at the altar call on Easter Sunday. I haven't touched it since. My family is restored.",
    likes: 1670,
    video: false,
  },
];

export default function PrayerTestimony() {
  const [prayers, setPrayers] = useState(initialPrayers);
  const [draft, setDraft] = useState("");
  const [dropping, setDropping] = useState(false);

  const drop = () => {
    if (!draft.trim()) return;
    setDropping(true);
    setTimeout(() => {
      setPrayers([`🙏 ${draft} — Anonymous`, ...prayers]);
      setDraft("");
      setDropping(false);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <Header
        title="Prayer Jar & Testimony Wall"
        subtitle="Drop your petition into the 3D jar — intercessors pray over every request. Read what God is doing across the HEC family."
      />

      <div className="mt-10 grid lg:grid-cols-[1fr_1.2fr] gap-8">
        {/* 3D prayer jar */}
        <div>
          <div className="glass-dark rounded-2xl overflow-hidden" style={{ height: 480 }}>
            <Canvas camera={{ position: [0, 1, 4.5], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[3, 4, 3]} intensity={1.2} color="#fff5d6" />
              <pointLight position={[-3, 2, -2]} intensity={1} color="#800000" />
              <pointLight position={[3, -1, 2]} intensity={0.8} color="#006400" />
              <Suspense fallback={null}>
                <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
                  <Jar count={prayers.length} />
                </Float>
                <ContactShadows position={[0, -1.4, 0]} opacity={0.6} scale={5} blur={2} />
              </Suspense>
            </Canvas>
          </div>
          <div className="text-center text-[11px] tracking-widest text-gold/70 uppercase mt-2">
            {prayers.length} active petitions · refreshed live
          </div>

          {/* Compose */}
          <div className="mt-5 glass rounded-2xl p-5">
            <div className="text-[11px] tracking-widest text-gold/80 uppercase mb-2">
              Drop your prayer
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder="Lord, I bring before You..."
              className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold/50 resize-none"
            />
            <div className="mt-3 flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-xs text-parchment/65">
                <input type="checkbox" className="accent-gold" defaultChecked /> Submit anonymously
              </label>
              <button
                onClick={drop}
                disabled={dropping}
                className="px-5 py-2 rounded-full btn-gold text-sm inline-flex items-center gap-2"
              >
                {dropping ? "Dropping..." : <>Drop Prayer <Send className="w-3.5 h-3.5" /></>}
              </button>
            </div>
          </div>
        </div>

        {/* Recent prayers + testimony wall */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-5">
            <div className="font-display text-lg text-parchment mb-3">
              Latest petitions
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
              <AnimatePresence>
                {prayers.map((p, i) => (
                  <motion.div
                    key={p + i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-parchment/85 px-3 py-2 rounded-lg bg-black/30 border border-gold/10"
                  >
                    {p}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="font-display text-lg gold-text inline-flex items-center gap-2">
                <Quote className="w-4 h-4" /> Testimony Wall
              </div>
              <span className="text-[10px] tracking-widest text-verdant-light inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Pastor-moderated
              </span>
            </div>
            <div className="space-y-4">
              {testimonies.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass rounded-2xl p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-maroon to-gold grid place-items-center font-display text-xs text-parchment shrink-0">
                      {t.name.split(" ").map(n => n[0]).slice(0,2).join("")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <div className="text-sm text-parchment">{t.name}</div>
                          <div className="text-[11px] text-gold/70">{t.branch}</div>
                        </div>
                        {t.video && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-parchment/70 px-2 py-0.5 rounded-full bg-maroon/40 border border-gold/20">
                            <Play className="w-2.5 h-2.5 fill-current" /> Video story
                          </span>
                        )}
                      </div>
                      <div className="font-display text-base text-parchment mt-2">
                        "{t.title}"
                      </div>
                      <p className="text-sm text-parchment/70 mt-1.5 leading-relaxed">
                        {t.body}
                      </p>
                      <div className="mt-3 flex items-center gap-4 text-xs">
                        <button className="inline-flex items-center gap-1.5 text-parchment/65 hover:text-gold">
                          <Heart className="w-3.5 h-3.5" /> {t.likes.toLocaleString()}
                        </button>
                        <button className="text-parchment/65 hover:text-gold">Share testimony</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
