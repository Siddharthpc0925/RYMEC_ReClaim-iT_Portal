import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Lock,
  MessageSquare
} from 'lucide-react';
import { LandingHero } from '../components/public/LandingHero';

interface HomeProps {
  navigate: (route: string) => void;
}

export const Home: React.FC<HomeProps> = ({ navigate }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <div className="space-y-14 pb-12">
      {/* 1. Hero Liquid Glass Panel with High-Res Campus Photo & VVS Identity */}
      <LandingHero
        onReport={() => navigate('/report?type=LOST')}
        onTrack={() => navigate('/handover')}
        onBrowse={() => navigate('/browse')}
      />

      {/* Floating Search Bar */}
      <motion.form
        onSubmit={handleSearchSubmit}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative max-w-2xl mx-auto -mt-6 z-20 px-4"
      >
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lost wallet, phone, keys, calculator, books..."
            className="w-full pl-12 pr-28 py-4 rounded-full text-sm text-white placeholder:text-slate-400 focus:outline-none shadow-2xl border border-white/20 bg-navy-950/80 backdrop-blur-2xl"
          />
          <button
            type="submit"
            className="absolute right-2 px-6 py-2.5 rounded-full ios-glass-btn-primary text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
          >
            Search
          </button>
        </div>
      </motion.form>

      {/* 2. Why RYMEC ReClaim-iT Works (Feature Highlights) */}
      <div className="max-w-5xl mx-auto px-4">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="ios-glass-card p-6 rounded-3xl border border-white/20 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-black">
              01
            </div>
            <h3 className="font-bold text-base text-white">Explainable AI Matching</h3>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              Our pure scoring algorithm compares category, campus zone, date gap, brand, colour synonyms and description similarity to explain exactly why items match.
            </p>
          </div>

          <div className="ios-glass-card p-6 rounded-3xl border border-white/20 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black">
              02
            </div>
            <h3 className="font-bold text-base text-white">Zero False Claims</h3>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              Claimants must answer hidden verification questions before receiving a secure 6-digit handover code. Verified in person at security desk or finder meetup.
            </p>
          </div>

          <div className="ios-glass-card p-6 rounded-3xl border border-white/20 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-black">
              03
            </div>
            <h3 className="font-bold text-base text-white">Student Privacy First</h3>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              College ID cards are matched privately without public broadcast. In-app chat masks your phone and email until both parties agree to reveal.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
