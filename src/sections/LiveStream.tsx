import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Play, Volume2, Maximize2, Minimize2, MessageCircle, Heart, Send, Users, Radio } from "lucide-react";
import { api } from "../utils/api";

function parseStreamUrl(url: string): { platform: "youtube" | "facebook"; url: string } | null {
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
      if (m) return { platform: "youtube", url: m[1] };
    }
    return null;
  }

  if (lower.includes("facebook.com") || lower.includes("fb.watch") || lower.includes("fb.com")) {
    return { platform: "facebook", url };
  }

  return null;
}

const initialChat = [
  { name: "Sis. Grace · Lagos", msg: "Glory! Streaming clear from Ikeja 🙌", t: "now" },
  { name: "Bro. Otieno · Nairobi", msg: "Praise God! 4:00 AM here in Kenya.", t: "1m" },
  { name: "Pst. Mary · London", msg: "Bringing 12 first-timers tonight!", t: "2m" },
  { name: "Bro. Daniel · Houston", msg: "The anointing is heavy 🔥🔥🔥", t: "3m" },
  { name: "Sis. Esther · Accra", msg: "I receive every word in Jesus name.", t: "4m" },
];

export default function LiveStream() {
  const [chat, setChat] = useState(initialChat);
  const [msg, setMsg] = useState("");
  const [theatre, setTheatre] = useState(false);
  const [hearts, setHearts] = useState(2148);
  const [streamUrl, setStreamUrl] = useState("");
  const [sermonTitle, setSermonTitle] = useState('"The Beauty of Holiness"');
  const [sermonPreacher, setSermonPreacher] = useState("Apostle Joshua O. Adekunle · General Overseer");
  const [viewerCount, setViewerCount] = useState(8412);
  const [isLive, setIsLive] = useState(true);
  const [sermonNotes, setSermonNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    api.getPublicSiteContent().then((data: any) => {
      if (data?.live) {
        const url = data.live.stream_url || data.live.youtube_url;
        if (url) setStreamUrl(url);
        if (data.live.sermon_title) setSermonTitle(data.live.sermon_title);
        if (data.live.preacher) setSermonPreacher(data.live.preacher);
        if (data.live.viewer_count) setViewerCount(Number(data.live.viewer_count));
        if (data.live.is_active !== undefined) setIsLive(data.live.is_active === 'true' || data.live.is_active === true);
        if (data.live.sermon_notes) setSermonNotes(data.live.sermon_notes);
      }
    }).catch(() => {});
  }, []);

  const streamData = parseStreamUrl(streamUrl);
  const embedUrl = streamData
    ? streamData.platform === "youtube"
      ? `https://www.youtube.com/embed/${streamData.url}?autoplay=1&rel=0&modestbranding=1`
      : `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(streamUrl)}&show_text=0&width=560`
    : null;

  const send = () => {
    if (!msg.trim()) return;
    setChat([{ name: "You · Lagos HQ", msg, t: "now" }, ...chat]);
    setMsg("");
  };

  const copyNotes = () => {
    if (!sermonNotes) return;
    navigator.clipboard.writeText(sermonNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <Header
        title="Live Stream Theatre"
        subtitle="Synchronized broadcast of every HQ service. Theatre mode immerses you in the sanctuary."
      />

      <div className={`mt-8 grid gap-6 ${theatre ? "" : "lg:grid-cols-[1fr_360px]"}`}>
        {/* Player */}
        <div>
          <div
            className="relative rounded-2xl overflow-hidden bg-black"
            style={{ aspectRatio: "16/9" }}
          >
            {embedUrl ? (
              <iframe
                ref={iframeRef}
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                title="YouTube Live Stream"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center">
                  <Radio className="w-12 h-12 text-gold/40 mx-auto mb-3" />
                  <div className="text-parchment/50 text-sm">No stream configured</div>
                  <div className="text-parchment/30 text-[11px] mt-1">Admin can set a YouTube or Facebook URL in CMS</div>
                </div>
              </div>
            )}

            {/* Overlay badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
              {isLive && embedUrl && (
                <span className="px-2.5 py-1 rounded-md bg-maroon text-parchment text-[11px] font-bold tracking-widest inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" /> LIVE
                </span>
              )}
              <span className="px-2 py-1 rounded-md glass text-[11px] text-parchment/80 inline-flex items-center gap-1.5">
                <Users className="w-3 h-3" /> {viewerCount.toLocaleString()} watching
              </span>
            </div>

            {/* Floating hearts */}
            <div className="absolute bottom-20 right-6 flex flex-col items-center pointer-events-none z-10">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 0, opacity: 0.8, scale: 0.6 }}
                  animate={{ y: -120 - i * 30, opacity: 0, scale: 1.1 }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
                >
                  <Heart className="w-5 h-5 text-gold fill-gold" />
                </motion.div>
              ))}
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/85 to-transparent z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button className="w-10 h-10 grid place-items-center rounded-full btn-gold">
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHearts(hearts + 1)}
                    className="px-3 py-1.5 rounded-md glass text-[11px] text-gold inline-flex items-center gap-1.5"
                  >
                    <Heart className="w-3.5 h-3.5 fill-gold" /> {hearts.toLocaleString()}
                  </button>
                  <button
                    onClick={() => setTheatre((v) => !v)}
                    className="p-2 rounded-md glass text-parchment/80"
                  >
                    {theatre ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sermon Info */}
          <div className="mt-5 glass rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-[11px] tracking-widest text-gold/80">LIVE · DIVINE ENCOUNTER</div>
                <div className="font-display text-2xl text-parchment mt-1">
                  {sermonTitle}
                </div>
                <div className="text-sm text-parchment/65 mt-1">
                  Preached by · {sermonPreacher}
                </div>
              </div>
              <div className="flex gap-2">
                {sermonNotes && (
                  <button
                    onClick={() => setShowNotes((v) => !v)}
                    className="px-4 py-2 rounded-full btn-maroon text-sm"
                  >
                    Sermon Notes
                  </button>
                )}
                <button className="px-4 py-2 rounded-full btn-gold text-sm">Sow a Seed</button>
              </div>
            </div>

            {/* Sermon Notes */}
            {showNotes && sermonNotes && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 p-4 glass-dark rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11px] tracking-widest text-gold/80 uppercase">Sermon Notes</div>
                  <button onClick={copyNotes} className="text-[10px] px-2 py-1 rounded bg-gold/20 text-gold">
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="text-sm text-parchment/80 whitespace-pre-wrap leading-relaxed">
                  {sermonNotes}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Chat sidebar — YouTube live chat */}
        {!theatre && (
          <div className="glass-dark rounded-2xl flex flex-col h-[640px]">
            <div className="px-4 py-3 border-b border-gold/15 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm text-parchment">
                <MessageCircle className="w-4 h-4 text-gold" />
                {streamData?.platform === "youtube" ? "Live Chat" : "Sanctuary Chat"}
              </div>
              <span className="text-[10px] text-parchment/50">
                {streamData?.platform === "youtube" ? "synced with YouTube" : "internal chat"}
              </span>
            </div>
            {streamData?.platform === "youtube" ? (
              <iframe
                src={`https://www.youtube.com/live_chat?v=${streamData.url}&embed_domain=${window.location.hostname}`}
                className="flex-1 w-full"
                style={{ minHeight: 0 }}
                title="YouTube Live Chat"
              />
            ) : (
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {chat.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[13px]"
                  >
                    <div className="text-gold/90 text-[11px] font-semibold flex justify-between">
                      <span>{c.name}</span>
                      <span className="text-parchment/40">{c.t}</span>
                    </div>
                    <div className="text-parchment/85 mt-0.5">{c.msg}</div>
                  </motion.div>
                ))}
              </div>
            )}
            {streamData?.platform !== "youtube" && (
              <div className="p-3 border-t border-gold/15 flex gap-2">
                <input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Share an Amen..."
                  className="flex-1 bg-black/40 border border-gold/15 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-gold/50"
                />
                <button onClick={send} className="w-10 h-10 grid place-items-center rounded-full btn-gold">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="pt-20">
      <h1 className="font-display text-4xl md:text-5xl gold-text">{title}</h1>
      {subtitle && <p className="mt-3 text-parchment/65 max-w-2xl">{subtitle}</p>}
      <div className="gold-divider mt-6 max-w-xs" />
    </div>
  );
}
