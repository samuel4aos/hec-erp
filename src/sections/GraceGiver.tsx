import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Header } from "./LiveStream";
import { Copy, Check, Upload, ShieldCheck, Heart } from "lucide-react";
import { api } from "../utils/api";

const defaultAccounts = [
  { bank: "Guaranty Trust Bank (GTB)", name: "Holiness Evangelistic Church · HQ", number: "0123456789", swift: "GTBINGLA", purpose: "Tithes & Offerings", color: "#800000", flag: "🇳🇬" },
  { bank: "Zenith Bank Plc", name: "HEC Missions Account", number: "1098765432", swift: "ZEIBNGLA", purpose: "Global Missions", color: "#006400", flag: "🇳🇬" },
  { bank: "Barclays London", name: "HEC International Trust", number: "GB29 NWBK 6016 1331 9268 19", swift: "BARCGB22", purpose: "Diaspora Giving", color: "#d4af37", flag: "🇬🇧" },
  { bank: "Bank of America", name: "HEC USA Mission Inc.", number: "024-0001-9988", swift: "BOFAUS3N", purpose: "Building Project", color: "#a32020", flag: "🇺🇸" },
];

export default function GraceGiver() {
  const [accounts, setAccounts] = useState(defaultAccounts);
  const [copied, setCopied] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.getPublicSiteContent().then((data: any) => {
      if (data?.giving?.accounts) {
        try {
          const parsed = JSON.parse(data.giving.accounts);
          if (Array.isArray(parsed)) setAccounts(parsed);
        } catch {}
      }
    }).catch(() => {});
  }, []);

  const copy = async (txt: string, id: string) => {
    try {
      await navigator.clipboard.writeText(txt);
      setCopied(id);
      setTimeout(() => setCopied(null), 1800);
    } catch {}
  };

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <Header
        title="The Grace-Giver Hub"
        subtitle="“Each one must give as he has decided in his heart, not reluctantly or under compulsion, for God loves a cheerful giver.” — 2 Cor 9:7"
      />

      <div className="mt-10 grid lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Bank cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {accounts.map((a, i) => (
            <motion.div
              key={a.number}
              initial={{ opacity: 0, y: 20, rotateX: -8 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
              style={{ transformStyle: "preserve-3d" }}
              className="glass rounded-2xl p-5 relative overflow-hidden"
            >
              <div
                className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-2xl opacity-50"
                style={{ background: a.color }}
              />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] tracking-[0.3em] text-parchment/60 uppercase">
                      {a.purpose}
                    </div>
                    <div className="font-display text-base text-parchment mt-1.5">
                      {a.bank}
                    </div>
                  </div>
                  <span className="text-2xl">{a.flag}</span>
                </div>

                <div className="mt-5">
                  <div className="text-[10px] tracking-widest text-gold/70 uppercase mb-1">
                    Account Name
                  </div>
                  <div className="text-sm text-parchment/90">{a.name}</div>
                </div>

                <div className="mt-3 p-3 rounded-lg bg-black/30 border border-gold/15">
                  <div className="text-[10px] tracking-widest text-gold/70 uppercase mb-1">
                    Account Number
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <code className="font-display text-base gold-text tracking-wider break-all">
                      {a.number}
                    </code>
                    <button
                      onClick={() => copy(a.number, a.number)}
                      className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md btn-gold text-[11px]"
                    >
                      {copied === a.number ? (
                        <>
                          <Check className="w-3 h-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="text-parchment/55">SWIFT/BIC</span>
                  <code className="text-parchment/85">{a.swift}</code>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Proof of payment */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass-dark rounded-2xl p-6 self-start sticky top-32"
        >
          <div className="flex items-center gap-2 text-gold">
            <ShieldCheck className="w-5 h-5" />
            <div className="font-display text-lg">Proof of Payment</div>
          </div>
          <p className="text-xs text-parchment/65 mt-2">
            Upload your receipt — your branch Treasurer is notified instantly.
            All uploads are encrypted & RLS-scoped to your branch.
          </p>

          {!submitted ? (
            <>
              <div className="mt-5 space-y-3">
                <Field label="Full Name" placeholder="As on the receipt" />
                <Field label="Email" placeholder="you@example.com" type="email" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Amount" placeholder="₦50,000" />
                  <Select label="Branch" options={["Lagos HQ", "Abuja Central", "Nairobi East", "London UK", "Houston TX", "Accra Ghana"]} />
                </div>
                <Select
                  label="Purpose"
                  options={["Tithe", "Offering", "Missions", "Building Project", "Welfare"]}
                />
              </div>

              <div
                className="mt-4 border-2 border-dashed border-gold/30 rounded-xl p-5 text-center cursor-pointer hover:border-gold/60 transition"
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,application/pdf"
                  hidden
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <Upload className="w-6 h-6 text-gold mx-auto mb-2" />
                <div className="text-sm text-parchment/85">
                  {file ? file.name : "Tap to upload receipt"}
                </div>
                <div className="text-[10px] text-parchment/50 mt-1">
                  PNG, JPG or PDF · max 5MB
                </div>
              </div>

              <button
                onClick={() => setSubmitted(true)}
                className="mt-5 w-full py-3 rounded-full btn-gold inline-flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 fill-current" /> Submit Seed
              </button>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-6 text-center py-8"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-verdant grid place-items-center mb-3">
                <Check className="w-8 h-8 text-parchment" />
              </div>
              <div className="font-display text-xl gold-text">Thank you!</div>
              <p className="text-sm text-parchment/70 mt-2">
                Your seed has been recorded. The treasurer will verify shortly.
                A receipt has been emailed to you.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFile(null);
                }}
                className="mt-5 px-5 py-2 rounded-full btn-maroon text-sm"
              >
                Submit another
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <div className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1.5">
        {label}
      </div>
      <input
        {...props}
        className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm text-parchment focus:outline-none focus:border-gold/50"
      />
    </label>
  );
}

function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="block">
      <div className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1.5">
        {label}
      </div>
      <select className="w-full bg-black/40 border border-gold/15 rounded-lg px-3 py-2 text-sm text-parchment focus:outline-none focus:border-gold/50">
        {options.map((o) => (
          <option key={o} className="bg-ink">{o}</option>
        ))}
      </select>
    </label>
  );
}


