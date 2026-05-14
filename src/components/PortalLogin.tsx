import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, LogIn, Eye, EyeOff, Church } from 'lucide-react';
import { useAuth, type UserRole } from '../store/auth';

const roleLabels: Record<UserRole, string> = {
  hq_admin: 'HQ Super-Admin',
  pastor: 'Branch Pastor',
  treasurer: 'Branch Treasurer',
  ushers: 'Head of Ushers',
  admin_staff: 'Admin Staff',
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PortalLogin({ open, onClose }: Props) {
  const { login, demoLogin, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!email || !password) {
      setLocalError('Email and password required');
      return;
    }
    try {
      await login(email, password);
      onClose();
    } catch (err: any) {
      setLocalError(err?.message || error || 'Login failed');
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setLocalError('');
    try {
      await demoLogin(demoEmail);
      onClose();
    } catch (err: any) {
      setLocalError(err?.message || error || 'Login failed');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 grid place-items-center p-4"
          >
            <div
              className="w-full max-w-md glass-dark rounded-3xl p-8 relative border border-gold/30"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-parchment/60 hover:text-gold"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gold to-maroon grid place-items-center mb-4">
                  <Church className="w-8 h-8 text-ink" />
                </div>
                <div className="font-display text-xl gold-text">HEC Portal Login</div>
                <div className="text-[11px] text-parchment/60 mt-1">
                  Holiness Evangelistic Church · ERP System
                </div>
              </div>

              {(localError || error) && (
                <div className="mb-4 text-xs text-red-400 bg-red-900/20 border border-red-900/40 rounded-lg px-4 py-2.5">
                  {localError || error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <div className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1.5">
                    Email
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@holinessec.org"
                    className="w-full bg-black/40 border border-gold/15 rounded-xl px-4 py-3 text-sm text-parchment focus:outline-none focus:border-gold/50"
                  />
                </label>

                <label className="block">
                  <div className="text-[10px] tracking-widest text-parchment/55 uppercase mb-1.5">
                    Password
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-gold/15 rounded-xl px-4 py-3 text-sm text-parchment focus:outline-none focus:border-gold/50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment/50"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full btn-gold inline-flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" /> Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-gold/15">
                <div className="text-[10px] tracking-widest text-parchment/40 uppercase mb-2 text-center">
                  Demo Accounts
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  {[
                    { role: 'hq_admin' as UserRole, email: 'hq@holinessec.org' },
                    { role: 'pastor' as UserRole, email: 'pastor.lagos@holinessec.org' },
                    { role: 'treasurer' as UserRole, email: 'treasurer.lagos@holinessec.org' },
                    { role: 'ushers' as UserRole, email: 'ushers.lagos@holinessec.org' },
                  ].map((a) => (
                    <button
                      key={a.role}
                      type="button"
                      disabled={loading}
                      onClick={() => handleDemoLogin(a.email)}
                      className="text-left px-2 py-1.5 rounded-lg bg-black/30 border border-gold/10 hover:border-gold/40 transition disabled:opacity-50"
                    >
                      <div className="text-gold/90">{roleLabels[a.role]}</div>
                      <div className="text-parchment/50 truncate">{a.email}</div>
                    </button>
                  ))}
                </div>
                <div className="text-center text-[10px] text-parchment/40 mt-2">
                  One-click demo — no password needed
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
