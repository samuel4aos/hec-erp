import { useEffect, useState } from "react";
import { Header } from "./LiveStream";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, FileCheck2, Mail, Upload, Check, Star, Building2, MapPin, User } from "lucide-react";
import { api } from "../utils/api";

interface Product {
  id: string;
  title: string;
  author: string;
  price: number;
  color1: string;
  color2: string;
  rating: number;
  reviews: number;
}

interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  currency: string;
}

interface Branch {
  id: string;
  name: string;
}

export default function Bookstore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [checkout, setCheckout] = useState(false);
  const [stage, setStage] = useState<"pay" | "verifying" | "done">("pay");
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Checkout form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [branchId, setBranchId] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    api.getProducts().then((p) => setProducts(p.filter((x: any) => x.status === "live").map((x: any) => ({ ...x, price: parseFloat(x.price) })))).catch(() => {});
    api.getBankAccounts().then(setBanks).catch(() => {});
    api.getBranches().then(setBranches).catch(() => {});
  }, []);

  const total = cart.reduce((s, b) => s + b.price, 0);

  const add = (b: Product) => setCart((c) => [...c, b]);
  const remove = (i: number) => setCart((c) => c.filter((_, k) => k !== i));

  const submit = async () => {
    if (!fullName || !email) return;
    setStage("verifying");
    try {
      await api.placeOrder({
        items: cart.map((b) => ({ product_id: b.id, title: b.title, price: b.price })),
        full_name: fullName,
        email,
        branch_id: branchId || null,
        address,
        total_amount: total,
      });
      setStage("done");
    } catch {
      setStage("pay");
    }
  };

  const selectedBank = banks[0];

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <Header
        title="HEC Digital Bookstore"
        subtitle="Curated study materials. Your manual payment is verified by HQ — the PDF is auto-emailed to you the moment it clears."
      />

      <div className="mt-8 flex items-center justify-between">
        <div className="text-[11px] tracking-widest text-accent/70 uppercase">
          Featured · Curated by HQ Editorial
        </div>
        <button
          onClick={() => setCheckout(true)}
          className="relative px-4 py-2 rounded-full btn-primary text-sm inline-flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" /> Cart
          {cart.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent text-white text-[10px] grid place-items-center font-bold">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((b, i) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -6 }}
            className="glass rounded-2xl p-5"
          >
            <div className="relative h-56 mx-auto mb-5" style={{ perspective: 800 }}>
              <motion.div
                whileHover={{ rotateY: -18, rotateX: 4 }}
                transition={{ type: "spring", stiffness: 200 }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative w-32 h-52 mx-auto"
              >
                <div
                  className="absolute left-0 top-0 w-2 h-full"
                  style={{
                    background: `linear-gradient(180deg, ${b.color2}, ${b.color1})`,
                    transform: "translateZ(-6px) translateX(-1px)",
                    boxShadow: "inset -2px 0 4px rgba(0,0,0,0.5)",
                  }}
                />
                <div
                  className="absolute inset-0 rounded-r-md p-3 flex flex-col justify-between"
                  style={{
                    background: `linear-gradient(135deg, ${b.color1}, ${b.color2})`,
                    boxShadow: "0 18px 40px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)",
                    border: "1px solid rgba(44,62,80,0.4)",
                  }}
                >
                  <div className="text-[8px] tracking-[0.3em] text-accent/90 uppercase">HEC Press</div>
                  <div>
                    <div className="font-display text-[13px] leading-tight text-body">{b.title}</div>
                    <div className="text-[9px] text-accent mt-1">{b.author}</div>
                  </div>
                  <div className="border-t border-silver/40 pt-1.5 text-[8px] text-accent/80 tracking-widest">HOLINESS · EVANGELISTIC · CHURCH</div>
                </div>
                <div
                  className="absolute right-0 top-1 bottom-1 w-1.5 rounded-r-sm"
                  style={{ background: "repeating-linear-gradient(180deg,#f8f3e3,#f8f3e3 1px,#d4c89a 2px,#d4c89a 3px)" }}
                />
              </motion.div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-body">
              <span className="inline-flex items-center gap-1 text-accent">
                <Star className="w-3 h-3 fill-current" /> {b.rating} · {b.reviews}
              </span>
              <span className="text-body font-display">${b.price.toFixed(2)}</span>
            </div>
            <div className="font-display text-base text-body mt-2">{b.title}</div>
            <div className="text-[11px] text-body">by {b.author}</div>

            <button onClick={() => add(b)} className="mt-4 w-full py-2 rounded-full btn-primary text-sm border border-silver/30">
              Add to cart
            </button>
          </motion.div>
        ))}
      </div>

      {/* Cart / Checkout drawer */}
      <AnimatePresence>
        {checkout && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckout(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 22 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[440px] z-50 glass-dark border-l border-silver/30 flex flex-col"
            >
              <div className="p-5 border-b border-silver/20 flex items-center justify-between">
                <div className="font-display text-lg text-body">Checkout</div>
                <button onClick={() => setCheckout(false)} className="text-body">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {cart.length === 0 && (
                  <div className="text-center text-sm text-body py-12">Your cart is empty.</div>
                )}

                {/* Cart items */}
                {cart.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 glass rounded-xl p-3">
                    <div className="w-10 h-14 rounded-sm shrink-0" style={{ background: `linear-gradient(135deg,${b.color1},${b.color2})` }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-body truncate">{b.title}</div>
                      <div className="text-[11px] text-accent">${b.price.toFixed(2)}</div>
                    </div>
                    <button onClick={() => remove(i)} className="text-body hover:text-accent">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {cart.length > 0 && stage === "pay" && (
                  <>
                    {/* Buyer details form */}
                    <div className="glass rounded-xl p-4 space-y-3">
                      <div className="text-[11px] tracking-widest text-accent/80 uppercase mb-1">Your Details</div>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/60" />
                        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name *" className="w-full bg-white border border-silver/30 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent/50" />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/60" />
                        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email *" className="w-full bg-white border border-silver/30 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent/50" />
                      </div>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/60" />
                        <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="w-full bg-white border border-silver/30 rounded-xl pl-10 pr-4 py-2.5 text-sm text-body focus:outline-none focus:border-silver/50 appearance-none">
                          <option value="">Select your church branch</option>
                          {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-accent/60" />
                        <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your address" rows={2} className="w-full bg-white border border-silver/30 rounded-xl pl-10 pr-4 py-2.5 text-sm text-body focus:outline-none focus:border-silver/50 resize-none" />
                      </div>
                    </div>

                    {/* Payment info */}
                    <div className="glass rounded-xl p-4">
                      <div className="text-[11px] tracking-widest text-accent/80 uppercase mb-2">Manual Payment</div>
                      <p className="text-xs text-body">
                        Transfer the total to the account below, then upload your receipt. HQ verifies within minutes — your PDFs are emailed automatically.
                      </p>
                      {selectedBank ? (
                        <div className="mt-3 p-3 rounded-lg bg-white border border-silver/30 text-xs">
                          <div className="text-body">{selectedBank.bank_name}</div>
                          <div className="font-display heading-text">{selectedBank.account_name}</div>
                          <div className="font-mono text-accent text-sm mt-1">{selectedBank.account_number}</div>
                          <div className="text-body mt-1">Ref:</div>
                          <code className="text-accent">HEC-BK-{Math.random().toString(36).slice(2, 8).toUpperCase()}</code>
                        </div>
                      ) : (
                        <div className="mt-3 p-3 rounded-lg bg-white border border-silver/30 text-xs text-body">
                          No bank accounts configured. Contact HQ for payment instructions.
                        </div>
                      )}
                      <button className="mt-3 w-full py-2 rounded-full glass text-sm inline-flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" /> Upload payment proof
                      </button>
                    </div>
                  </>
                )}

                {stage === "verifying" && (
                  <div className="text-center py-8">
                    <div className="mx-auto w-12 h-12 rounded-full border-2 border-silver/30 border-t-gold animate-spin" />
                    <div className="mt-4 font-display text-body">Submitting order...</div>
                    <div className="text-xs text-body mt-1">HQ Treasurer will review your payment.</div>
                  </div>
                )}

                {stage === "done" && (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 mx-auto rounded-full bg-accent grid place-items-center text-white">
                      <Check className="w-7 h-7 text-body" />
                    </div>
                    <div className="mt-4 font-display text-lg heading-text">Order Submitted</div>
                    <p className="text-sm text-body mt-2">
                      Your order is pending HQ verification. PDFs will be emailed once payment clears.
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 text-xs text-accent glass rounded-full px-3 py-1.5">
                      <Mail className="w-3.5 h-3.5" /> {cart.length} file{cart.length > 1 ? "s" : ""} pending
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-silver/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-body">Total</span>
                  <span className="font-display text-xl heading-text">${total.toFixed(2)}</span>
                </div>
                {stage === "pay" && cart.length > 0 && (
                  <button onClick={submit} disabled={!fullName || !email} className="w-full py-3 rounded-full btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50">
                    <FileCheck2 className="w-4 h-4" /> Place Order
                  </button>
                )}
                {stage === "done" && (
                  <button onClick={() => { setCheckout(false); setCart([]); setStage("pay"); setFullName(""); setEmail(""); setBranchId(""); setAddress(""); }} className="w-full py-3 rounded-full btn-primary">
                    Done
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
