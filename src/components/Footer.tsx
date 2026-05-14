import Logo from "./Logo";
import { Globe2, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-gold/20 maroon-bg">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-14 grid md:grid-cols-4 gap-8">
        <div>
          <Logo size={48} />
          <p className="text-xs text-parchment/60 mt-4 leading-relaxed">
            "Holiness, without which no man shall see the Lord."
            <br />
            — Hebrews 12:14
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-[11px] text-gold/80">
            <Globe2 className="w-3 h-3" /> 142 branches · 28 nations
          </div>
        </div>

        <div>
          <div className="text-[11px] tracking-widest text-gold/80 uppercase mb-3">Quick Links</div>
          <ul className="space-y-2 text-sm text-parchment/70">
            <li>About HEC</li>
            <li>Statement of Faith</li>
            <li>Locate a Branch</li>
            <li>Plant a Branch</li>
            <li>Volunteer</li>
          </ul>
        </div>

        <div>
          <div className="text-[11px] tracking-widest text-gold/80 uppercase mb-3">Engage</div>
          <ul className="space-y-2 text-sm text-parchment/70">
            <li>Live Stream</li>
            <li>Daily Manna</li>
            <li>HEC Academy</li>
            <li>Bookstore</li>
            <li>Testimonies</li>
          </ul>
        </div>

        <div>
          <div className="text-[11px] tracking-widest text-gold/80 uppercase mb-3">Headquarters</div>
          <ul className="space-y-2 text-sm text-parchment/70">
            <li className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" /> 14, Holiness Way, Ikeja, Lagos · Nigeria</li>
            <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gold" /> +234 (0) 803 000 0000</li>
            <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gold" /> hq@holinessec.org</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gold/15">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-5 flex items-center justify-between flex-wrap gap-3 text-[11px] text-parchment/55">
          <div>© 1986–2026 Holiness Evangelistic Church · All rights reserved.</div>
          <div className="inline-flex items-center gap-4">
            <span>Multi-Tenant ERP · Neon DB · RLS-secured</span>
            <span className="text-gold/70">v2.6.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
