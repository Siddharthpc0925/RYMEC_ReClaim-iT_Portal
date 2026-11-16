import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Shield, User, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface LoginProps {
  navigate: (route: string) => void;
}

export const Login: React.FC<LoginProps> = ({ navigate }) => {
  const { login } = useAuth();
  const { toast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      toast('Please enter your roll number/email and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(identifier.trim(), password);
      toast('Login successful! Welcome to RYMEC ReClaim-iT.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      toast(err.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30 shadow-lg">
          <LogIn className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Sign In to ReClaim-iT
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter your RYMEC roll number or college email address to access your portal.
        </p>
      </div>

      {/* Login Card */}
      <div className="glass rounded-[32px] p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              College Email or Roll Number *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="3BR21CS001 or student@rymec.edu.in"
                required
                className="w-full glass-input pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full glass-input pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-40"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Quick-Fill Buttons */}
        <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Demo Instant Credentials (1-Click)</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => fillQuickDemo('admin@college.edu', 'Admin@123')}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs flex items-center justify-between text-left transition-colors"
            >
              <span>🛡️ <strong>Admin</strong> (Security Desk)</span>
              <span className="font-mono text-[10px] text-indigo-400">admin@college.edu</span>
            </button>

            <button
              type="button"
              onClick={() => fillQuickDemo('ananya.rao@rymec.edu.in', 'Student@123')}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs flex items-center justify-between text-left transition-colors"
            >
              <span>🎓 <strong>Student A</strong> (Ananya Rao)</span>
              <span className="font-mono text-[10px] text-indigo-400">ananya.rao@rymec.edu.in</span>
            </button>

            <button
              type="button"
              onClick={() => fillQuickDemo('rohan.patil@rymec.edu.in', 'Student@123')}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs flex items-center justify-between text-left transition-colors"
            >
              <span>🎓 <strong>Student B</strong> (Rohan Patil)</span>
              <span className="font-mono text-[10px] text-indigo-400">rohan.patil@rymec.edu.in</span>
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center text-xs text-slate-400 pt-2">
          Don't have an account yet?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-indigo-400 font-bold hover:underline"
          >
            Register Student Profile
          </button>
        </div>
      </div>
    </div>
  );
};
