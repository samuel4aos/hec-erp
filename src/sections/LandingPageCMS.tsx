import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Image, Type, MessageSquare, Video, Globe, Church, Radio, Heart, Upload } from "lucide-react";
import { api } from "../utils/api";

type Section = { label: string; icon: any; keys: string[] };

const SECTIONS: Section[] = [
  { label: "Hero", icon: Type, keys: ["hero.title", "hero.subtitle", "hero.image_url"] },
  { label: "Stats", icon: Type, keys: ["stats.branches", "stats.members", "stats.souls", "stats.protected"] },
  { label: "Overseer", icon: Image, keys: ["overseer.name", "overseer.title", "overseer.bio", "overseer.quote", "overseer.image_url"] },
  { label: "Video Message", icon: Video, keys: ["video.title", "video.preacher", "video.verse", "video.url"] },
  { label: "Live Stream", icon: Radio, keys: ["live.is_active", "live.stream_url", "live.viewer_count", "live.sermon_title", "live.preacher", "live.sermon_notes"] },
  { label: "Announcements", icon: MessageSquare, keys: ["ticker.messages"] },
  { label: "Social Links", icon: Globe, keys: ["social.facebook", "social.instagram", "social.youtube"] },
  { label: "Church Info", icon: Church, keys: ["church.name", "church.established", "church.address", "church.phone", "church.email", "church.logo_url"] },
];

export default function LandingPageCMS() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState(SECTIONS[0].label);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.getSiteContent().then((data: any) => {
      const flat: Record<string, string> = {};
      for (const section of Object.keys(data)) {
        for (const key of Object.keys(data[section])) {
          flat[`${section}.${key}`] = data[section][key];
        }
      }
      setContent(flat);
    });
  }, []);

  const update = (key: string, value: string) => setContent((prev) => ({ ...prev, [key]: value }));

  const handleImageUpload = async (key: string, file: File) => {
    setUploading(true);
    try {
      const result = await api.uploadFile(file);
      update(key, result.url);
    } catch {}
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.updateSiteContent(content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  const isImageKey = (key: string) => key.endsWith("_url") || key === "overseer.image_url";

  const currentSection = SECTIONS.find((s) => s.label === activeSection)!;

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <div className="pt-20">
        <div className="flex items-center gap-2 text-accent/80 text-[11px] tracking-[0.4em] uppercase mb-3">
          <Image className="w-4 h-4" /> HQ Super-Admin
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl heading-text">Landing Page CMS</h1>
            <p className="mt-3 text-body max-w-2xl">Edit every piece of content across the public website in real time.</p>
          </div>
          <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-full btn-primary text-sm inline-flex items-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? "Saved ✓" : "Save All Changes"}
          </button>
        </div>
        <div className="silver-divider mt-6 max-w-xs" />
      </div>

      <div className="mt-8 grid lg:grid-cols-[200px_1fr] gap-6">
        {/* Section Tabs */}
        <div className="space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.label}
              onClick={() => setActiveSection(s.label)}
              className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition ${
                activeSection === s.label ? "bg-accent/15 text-accent border border-silver/30" : "text-body hover:text-body hover:bg-white/5"
              }`}
            >
              <s.icon className="w-4 h-4" />
              {s.label}
            </button>
          ))}
        </div>

        {/* Content Editor */}
        <motion.div key={activeSection} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6">
          <div className="font-display text-xl text-body mb-5">{activeSection}</div>
          <div className="space-y-5">
            {currentSection.keys.map((key) => {
              const label = key.split(".").pop()?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || key;
              const isJson = key.startsWith("stats.") || key === "ticker.messages" || key === "giving.accounts";
              const val = content[key] || "";
              return (
                <div key={key}>
                  <label className="text-[10px] tracking-widest text-accent/80 uppercase mb-1.5 block">{label}</label>
                  {isImageKey(key) ? (
                    <div className="space-y-2">
                      {val && (
                        <img src={val} alt={label} className="w-32 h-32 object-cover rounded-xl border border-silver/30" />
                      )}
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-silver/30 text-sm text-body cursor-pointer hover:border-silver/50 transition">
                          <Upload className="w-4 h-4 text-accent" />
                          {uploading ? "Uploading..." : "Choose image"}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(key, file);
                            e.target.value = "";
                          }} />
                        </label>
                        <input value={val} onChange={(e) => update(key, e.target.value)} placeholder="Or paste image URL" className="flex-1 bg-white border border-silver/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50" />
                      </div>
                    </div>
                  ) : key === "overseer.bio" || key === "hero.subtitle" ? (
                    <textarea value={val} onChange={(e) => update(key, e.target.value)} rows={4} className="w-full bg-white border border-silver/30 rounded-xl px-4 py-3 text-sm text-body focus:outline-none focus:border-silver/50 resize-none" />
                  ) : isJson ? (
                    <textarea value={val} onChange={(e) => update(key, e.target.value)} rows={3} className="w-full bg-white border border-silver/30 rounded-xl px-4 py-3 text-sm text-body focus:outline-none focus:border-silver/50 font-mono text-xs" />
                  ) : (
                    <input value={val} onChange={(e) => update(key, e.target.value)} className="w-full bg-white border border-silver/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50" />
                  )}
                  {key.startsWith("stats.") && (
                    <div className="text-[10px] text-body mt-1">JSON format: {`{"value":"...","label":"..."}`}</div>
                  )}
                  {key === "ticker.messages" && (
                    <div className="text-[10px] text-body mt-1">JSON array of announcement strings</div>
                  )}
                  {key === "giving.accounts" && (
                    <div className="text-[10px] text-body mt-1">JSON array: {`[{"bank":"Bank Name","name":"Account Name","number":"0123456789","swift":"SWIFTCODE","purpose":"Tithes & Offerings","color":"#800000","flag":"🇳🇬"}]`}</div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
