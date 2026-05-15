import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit3, Book, Banknote, ShoppingBag, Check, X, Save, Upload } from "lucide-react";
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
  status: string;
}

interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  currency: string;
  is_active: boolean;
}

interface Order {
  id: string;
  full_name: string;
  email: string;
  total_amount: number;
  branch_name: string;
  address: string;
  status: string;
  created_at: string;
}

type Tab = "products" | "bank-accounts" | "orders";

const defaultProduct = { title: "", author: "", price: 0, color1: "#800000", color2: "#4a0000", rating: 5.0, reviews: 0, status: "draft" };

export default function BookstoreAdmin() {
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [bankForm, setBankForm] = useState({ bank_name: "", account_name: "", account_number: "", currency: "NGN" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.getProducts().then((p) => setProducts(p.map((x: any) => ({ ...x, price: parseFloat(x.price) })))).catch(() => {});
    api.getBankAccounts().then(setBankAccounts).catch(() => {});
    api.getOrders().then(setOrders).catch(() => {});
  }, []);

  const msg = (s: string) => { setMessage(s); setTimeout(() => setMessage(""), 2000); };

  const saveProduct = async () => {
    if (!editing) return;
    try {
      if (editing.id) {
        const updated = await api.updateProduct(editing.id, editing);
        setProducts((p) => p.map((x) => (x.id === editing.id ? updated : x)));
        msg("Product updated");
      } else {
        const created = await api.createProduct(editing);
        setProducts((p) => [created, ...p]);
        msg("Product created");
      }
      setEditing(null);
    } catch { msg("Failed to save product"); }
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      setProducts((p) => p.filter((x) => x.id !== id));
      msg("Product deleted");
    } catch { msg("Failed to delete"); }
  };

  const saveBank = async () => {
    try {
      const created = await api.createBankAccount(bankForm);
      setBankAccounts((b) => [created, ...b]);
      setBankForm({ bank_name: "", account_name: "", account_number: "", currency: "NGN" });
      msg("Bank account added");
    } catch { msg("Failed to add bank account"); }
  };

  const deleteBank = async (id: string) => {
    try {
      await api.deleteBankAccount(id);
      setBankAccounts((b) => b.filter((x) => x.id !== id));
      msg("Bank account removed");
    } catch { msg("Failed to remove"); }
  };

  const verifyOrder = async (id: string) => {
    try {
      await api.verifyOrder(id);
      setOrders((o) => o.map((x) => (x.id === id ? { ...x, status: "verified" } : x)));
      msg("Order verified");
    } catch { msg("Verification failed"); }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <div className="pt-20">
        <h1 className="font-display text-4xl md:text-5xl heading-text">Bookstore Admin</h1>
        <p className="mt-3 text-body">Manage products, bank accounts, and orders.</p>
        <div className="silver-divider mt-6 max-w-xs" />
      </div>

      {message && (
        <div className="mt-4 px-4 py-2.5 rounded-lg bg-accent/20 border border-accent/40 text-accent text-sm">{message}</div>
      )}

      <div className="mt-6 flex gap-1 glass-dark rounded-2xl p-1 w-fit">
        {([
          { key: "products", label: "Products", icon: Book },
          { key: "bank-accounts", label: "Bank Accounts", icon: Banknote },
          { key: "orders", label: "Orders", icon: ShoppingBag },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm inline-flex items-center gap-2 transition ${
              tab === t.key ? "bg-accent/15 text-accent border border-silver/30" : "text-body hover:text-body"
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Products tab */}
      {tab === "products" && (
        <div className="mt-6">
          <button onClick={() => setEditing({ ...defaultProduct })} className="mb-4 px-4 py-2 rounded-full btn-primary text-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </button>

          <div className="grid gap-3">
            {products.map((p) => (
              <div key={p.id} className="glass rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-16 rounded-md shrink-0" style={{ background: `linear-gradient(135deg,${p.color1},${p.color2})` }} />
                <div className="flex-1 min-w-0">
                  <div className="text-body font-medium">{p.title}</div>
                  <div className="text-xs text-body">{p.author} · ${p.price.toFixed(2)}</div>
                  <div className="text-[10px] text-body mt-0.5">
                    <span className={`px-1.5 py-0.5 rounded ${p.status === "live" ? "bg-accent/20 text-accent" : "bg-accent/20 text-accent"}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
                <button onClick={() => setEditing(p)} className="p-2 rounded-lg hover:bg-white/5 text-body"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-lg hover:bg-white/5 text-accent"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {products.length === 0 && <div className="text-center text-body py-8 text-sm">No products yet</div>}
          </div>

          {/* Product editor modal */}
          {editing && (
            <>
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setEditing(null)} />
              <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 glass-dark rounded-2xl p-6 border border-silver/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-display text-lg text-body">{editing.id ? "Edit Product" : "New Product"}</div>
                  <button onClick={() => setEditing(null)} className="text-body"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-3">
                  <input value={editing.title || ""} onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))} placeholder="Title" className="w-full bg-white border border-silver/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50" />
                  <input value={editing.author || ""} onChange={(e) => setEditing((p) => ({ ...p, author: e.target.value }))} placeholder="Author" className="w-full bg-white border border-silver/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50" />
                  <input type="number" step="0.01" value={editing.price || ""} onChange={(e) => setEditing((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))} placeholder="Price" className="w-full bg-white border border-silver/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50" />
                  <div className="flex gap-3">
                    <div>
                      <label className="text-[10px] text-body block mb-1">Color 1</label>
                      <input type="color" value={editing.color1 || "#800000"} onChange={(e) => setEditing((p) => ({ ...p, color1: e.target.value }))} className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-silver/15" />
                    </div>
                    <div>
                      <label className="text-[10px] text-body block mb-1">Color 2</label>
                      <input type="color" value={editing.color2 || "#4a0000"} onChange={(e) => setEditing((p) => ({ ...p, color2: e.target.value }))} className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-silver/15" />
                    </div>
                    <div>
                      <label className="text-[10px] text-body block mb-1">Rating</label>
                      <input type="number" step="0.1" min="0" max="5" value={editing.rating || 5} onChange={(e) => setEditing((p) => ({ ...p, rating: parseFloat(e.target.value) || 5 }))} className="w-16 bg-white border border-silver/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent/50" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-body block mb-1">Status</label>
                    <select value={editing.status || "draft"} onChange={(e) => setEditing((p) => ({ ...p, status: e.target.value }))} className="w-full bg-white border border-silver/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50">
                      <option value="draft">Draft</option>
                      <option value="live">Live</option>
                    </select>
                  </div>
                </div>
                <div className="mt-5 flex gap-2">
                  <button onClick={saveProduct} className="flex-1 py-3 rounded-full btn-primary text-sm inline-flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Save</button>
                  <button onClick={() => setEditing(null)} className="px-6 py-3 rounded-full glass text-sm">Cancel</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Bank Accounts tab */}
      {tab === "bank-accounts" && (
        <div className="mt-6">
          <div className="glass rounded-2xl p-5 mb-6">
            <div className="font-display text-base text-body mb-3">Add Bank Account</div>
            <div className="grid sm:grid-cols-4 gap-3">
              <input value={bankForm.bank_name} onChange={(e) => setBankForm((b) => ({ ...b, bank_name: e.target.value }))} placeholder="Bank name (e.g. GTBank)" className="bg-white border border-silver/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50" />
              <input value={bankForm.account_name} onChange={(e) => setBankForm((b) => ({ ...b, account_name: e.target.value }))} placeholder="Account name" className="bg-white border border-silver/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50" />
              <input value={bankForm.account_number} onChange={(e) => setBankForm((b) => ({ ...b, account_number: e.target.value }))} placeholder="Account number" className="bg-white border border-silver/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50" />
              <button onClick={saveBank} className="py-2.5 rounded-full btn-primary text-sm inline-flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add</button>
            </div>
          </div>

          <div className="grid gap-3">
            {bankAccounts.map((b) => (
              <div key={b.id} className="glass rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-body font-medium">{b.bank_name}</div>
                  <div className="text-xs text-body">{b.account_name} · <span className="font-mono text-accent">{b.account_number}</span> · {b.currency}</div>
                </div>
                <button onClick={() => deleteBank(b.id)} className="p-2 rounded-lg hover:bg-white/5 text-accent"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {bankAccounts.length === 0 && <div className="text-center text-body py-8 text-sm">No bank accounts set up</div>}
          </div>
        </div>
      )}

      {/* Orders tab */}
      {tab === "orders" && (
        <div className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-silver/15 text-[10px] uppercase tracking-widest text-body">
                  <th className="text-left px-4 py-3 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 font-medium">Branch</th>
                  <th className="text-left px-4 py-3 font-medium">Address</th>
                  <th className="text-right px-4 py-3 font-medium">Amount</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Date</th>
                  <th className="text-center px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-body">No orders yet</td></tr>
                )}
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-silver/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3 text-body">
                      <div>{o.full_name}</div>
                      <div className="text-[10px] text-body">{o.email}</div>
                    </td>
                    <td className="px-4 py-3 text-body text-xs">{o.branch_name || "—"}</td>
                    <td className="px-4 py-3 text-body text-xs max-w-[200px] truncate">{o.address || "—"}</td>
                    <td className="px-4 py-3 text-right font-display heading-text">${parseFloat(o.total_amount as any).toFixed(2)}</td>
                    <td className="text-center px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        o.status === "verified" ? "bg-accent/20 text-accent" :
                        o.status === "pending" ? "bg-accent/20 text-accent" : "bg-surface/10 text-body"
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="text-right px-4 py-3 text-body text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="text-center px-4 py-3">
                      {o.status === "pending" && (
                        <button onClick={() => verifyOrder(o.id)} className="p-1.5 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition" title="Verify order">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
