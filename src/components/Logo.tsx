import { useEffect, useState } from "react";
import { api } from "../utils/api";

export default function Logo({ size = 44 }: { size?: number }) {
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    api.getPublicSiteContent().then((data: any) => {
      if (data?.church?.logo_url) setLogoUrl(data.church.logo_url);
    }).catch(() => {});
  }, []);

  if (logoUrl) {
    return (
      <div className="flex items-center gap-3">
        <img
          src={logoUrl}
          alt="Church Logo"
          className="rounded-full object-cover"
          style={{ width: size, height: size }}
        />
        <div className="leading-tight">
          <div className="font-display text-[15px] tracking-[0.18em] heading-text">HOLINESS</div>
          <div className="font-display text-[10px] tracking-[0.32em] text-body">EVANGELISTIC CHURCH</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div
        className="relative grid place-items-center rounded-full halo"
        style={{
          width: size,
          height: size,
          background:
            "radial-gradient(circle at 30% 30%, #f0cf5e 0%, #d4af37 40%, #800000 75%, #4a0000 100%)",
          boxShadow:
            "0 0 22px rgba(44,62,80,0.55), inset 0 1px 4px rgba(255,255,255,0.4)",
        }}
      >
        <svg viewBox="0 0 64 64" width={size * 0.62} height={size * 0.62}>
          <defs>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbe79a" />
              <stop offset="100%" stopColor="#9a7d22" />
            </linearGradient>
          </defs>
          <path d="M8 42 L32 36 L56 42 L56 50 L32 44 L8 50 Z" fill="url(#goldGrad)" stroke="#4a0000" strokeWidth="1" />
          <line x1="32" y1="36" x2="32" y2="44" stroke="#4a0000" strokeWidth="0.8" />
          <rect x="30" y="8" width="4" height="24" fill="url(#goldGrad)" />
          <rect x="24" y="14" width="16" height="4" fill="url(#goldGrad)" />
          <path d="M20 24 Q24 20 28 24 Q26 26 24 26 Q22 26 20 24 Z" fill="#f8f3e3" opacity="0.85" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="font-display text-[15px] tracking-[0.18em] heading-text">HOLINESS</div>
        <div className="font-display text-[10px] tracking-[0.32em] text-body">EVANGELISTIC CHURCH</div>
      </div>
    </div>
  );
}
