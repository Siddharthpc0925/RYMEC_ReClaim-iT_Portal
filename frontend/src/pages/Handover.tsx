import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, ArrowRight, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';

interface HandoverProps {
  navigate: (route: string) => void;
}

export const Handover: React.FC<HandoverProps> = ({ navigate }) => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length < 6) {
      toast('Please enter the complete 6-digit handover code.', 'error');
      return;
    }

    if (!user) {
      toast('Please sign in to verify a handover.', 'error');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyHandover(code.trim());
      setSuccessData(res);
      toast('Handover verified! Item marked as RETURNED.', 'success');

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      await refreshUser();
    } catch (err: any) {
      toast(err.message || 'Invalid or expired handover code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-400/30 text-violet-400 text-xs font-semibold">
          <QrCode className="w-3.5 h-3.5" />
          <span>U3 Handover & Custody Verification Terminal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Verify Item Handover
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Enter the 6-digit confirmation code presented by the claimant or scanned from their QR code.
        </p>
      </div>

      {/* Main Glass Card */}
      <div className="glass rounded-[32px] p-6 sm:p-10 border border-white/20 shadow-2xl space-y-6">
        {!successData ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                6-Digit Handover Code
              </label>

              {/* Large Code Input */}
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="482915"
                className="w-full text-center text-3xl sm:text-4xl font-mono font-black tracking-[0.35em] py-4 rounded-2xl glass-input text-indigo-400 focus:outline-none shadow-inner"
              />

              <p className="text-[11px] text-slate-400 pt-1">
                Generated upon claim approval. Valid for 48 hours. SHA-256 server verified.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? (
                'Verifying Code with Security Core...'
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Verify Handover & Close Case</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Handover Success State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">Item Successfully Returned!</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                Handover verification verified by cryptographic hash. Custody audit timeline has been permanently updated to RETURNED.
              </p>
            </div>

            {/* Points Awarded Banner (U12) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950 to-violet-950 border border-indigo-400/30 text-xs space-y-1">
              <div className="font-bold text-indigo-300 flex items-center justify-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Good Samaritan Points Awarded (U12)</span>
              </div>
              <div className="text-slate-200">
                Finder Earned: <span className="font-bold text-emerald-400">+20 Trust Points</span> • Claimant Earned: <span className="font-bold text-emerald-400">+2 Points</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSuccessData(null);
                  setCode('');
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                Verify Another Handover
              </button>
              <button
                onClick={() => navigate(`/items/${successData.item.id}`)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <span>View Item Custody Log</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Info Card on Handover Protocol */}
      <div className="glass p-5 rounded-2xl border border-white/15 text-xs text-slate-400 space-y-2">
        <div className="font-bold text-slate-200 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>RYMEC Handover Security Protocol</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          1. Finder approves claim after verifying the claimant's answer to the challenge question.<br />
          2. Claimant receives a unique single-use 6-digit handover code.<br />
          3. Both parties meet at security desk or designated campus location.<br />
          4. Handover code is entered here, immediately closing the case and awarding trust points.
        </p>
      </div>
    </div>
  );
};
