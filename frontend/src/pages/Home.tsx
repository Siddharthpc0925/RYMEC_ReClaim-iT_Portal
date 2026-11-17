import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Lock,
  MessageSquare,
  Radio,
  MapPin,
  ArrowRight,
  Filter,
  Award,
  Layers,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Flame,
  Building2
} from 'lucide-react';
import { LandingHero } from '../components/public/LandingHero';
import { ItemCard } from '../components/items/ItemCard';
import { api } from '../lib/api';
import { Item, Location } from '../types';

interface HomeProps {
  navigate: (route: string) => void;
}

export const Home: React.FC<HomeProps> = ({ navigate }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'LOST' | 'FOUND'>('ALL');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      api.getItems({ limit: 6 }).catch(() => ({ items: [] })),
      api.getLocations().catch(() => ({ locations: [] }))
    ]).then(([itemsRes, locsRes]) => {
      setItems(itemsRes.items || []);
      setLocations(locsRes.locations || []);
      setLoading(false);
    });
  }, []);

  const filteredItems = items.filter((item) => {
    if (filterType === 'ALL') return true;
    return item.type === filterType;
  });

  const faqs = [
    {
      q: 'Where are the official RYMEC drop-desks located?',
      a: 'Official drop desks are stationed at the Main Security Gate Kiosk (24/7), the Central Library Ground Floor Circulation Counter, the Administrative Block Reception (Room 102), and individual Department Security Desks.'
    },
    {
      q: 'How does the Explainable AI Cross-Matching work?',
      a: 'Whenever an item is reported, our scoring algorithm cross-evaluates category taxonomy, campus zone proximity, timestamp delta, brand, color tokens, and semantic descriptions to compute a match percentage and detail exactly why items match.'
    },
    {
      q: 'Is my student ID number or contact information visible publicly?',
      a: 'Never. Student USNs, roll numbers, and contact details remain locked in our zero-knowledge vault. Contact information is only shared when both finder and claimant mutually agree during in-app masked verification.'
    },
    {
      q: 'How does the 6-Digit Handover Verification Code prevent false claims?',
      a: 'Before receiving property, claimants must correctly answer a private verification question set by the finder (e.g. "What wallpaper is on the lockscreen?"). Upon success, a one-time 6-digit code is generated and verified in person.'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* ── 1. Split Terminal Hero with Live Radar HUD ── */}
      <LandingHero
        onReport={(type) => navigate(`/report${type ? `?type=${type}` : ''}`)}
        onTrack={() => navigate('/handover')}
        onBrowse={(cat) => navigate(cat ? `/browse?search=${encodeURIComponent(cat)}` : '/browse')}
        onSearch={(q) => navigate(`/browse?search=${encodeURIComponent(q)}`)}
      />

      {/* ── 2. Live Campus Recovery Stream (Real Recent Items) ── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Campus Stream</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Recent Campus Recovery Notices
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Real-time property notices broadcasted across RYMEC campus departments.
            </p>
          </div>

          {/* Stream Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shrink-0">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              All Notices
            </button>
            <button
              onClick={() => setFilterType('LOST')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'LOST'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🔴 Lost Notices
            </button>
            <button
              onClick={() => setFilterType('FOUND')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'FOUND'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🟢 Safe at Drop Desks
            </button>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-white/15 bg-white/5 p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">All Clear on Campus Radar</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              No unresolved notices found under this filter. If you have lost or found something, file a notice now.
            </p>
            <button
              onClick={() => navigate('/report')}
              className="mt-2 px-5 py-2 rounded-xl ios-glass-btn-primary text-xs font-bold text-white shadow-md"
            >
              Report Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => navigate(`/items/${item.id}`)}
              />
            ))}
          </div>
        )}

        {/* Directory CTA */}
        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/browse')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-semibold transition-all hover:scale-105 shadow-md cursor-pointer"
          >
            <span>Explore Complete Campus Directory</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </section>

      {/* ── 3. Asymmetric Bento Recovery Architecture Grid ── */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Institutional Engineering
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Built Specifically for RYMEC Campus Recovery
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Engineered with zero false claims, cryptographic safety protocols, and student privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Bento Card 1: Explainable AI Matcher (7 Cols) */}
          <div className="md:col-span-7 rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-950/30 via-navy-950/70 to-black/80 p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-300 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30">
                Algorithmic Engine
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                Explainable Multi-Vector AI Matching
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Rather than an opaque black box, our algorithm computes a weighted multi-factor match score and shows both parties the exact reason why items correspond.
              </p>
            </div>

            {/* Visual Vector Scoring Simulation */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Category &amp; Taxonomy Similarity</span>
                <span className="text-emerald-400 font-mono font-bold">100%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full w-full" />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-300 font-medium">Campus Zone Proximity (Library Block)</span>
                <span className="text-teal-300 font-mono font-bold">95%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400 rounded-full w-[95%]" />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-300 font-medium">Temporal Delta (&lt; 2 Hours Apart)</span>
                <span className="text-cyan-300 font-mono font-bold">90%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full w-[90%]" />
              </div>
            </div>
          </div>

          {/* Bento Card 2: Vault-Grade Privacy (5 Cols) */}
          <div className="md:col-span-5 rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 via-black/50 to-black/80 p-6 sm:p-8 backdrop-blur-2xl shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 w-fit">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Zero-Knowledge Privacy Vault
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Student USNs, phone numbers, and hostel rooms are protected. If an ID card is turned in, the owner is alerted directly without broadcasting credentials publicly.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-amber-300 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Full compliance with institutional data governance</span>
            </div>
          </div>

          {/* Bento Card 3: Cryptographic QR Handover (5 Cols) */}
          <div className="md:col-span-5 rounded-3xl border border-white/20 bg-gradient-to-br from-cyan-950/20 via-black/50 to-black/80 p-6 sm:p-8 backdrop-blur-2xl shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 w-fit">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                6-Digit Verification Protocol
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Zero false handovers. The claimant must answer a private security question to unlock a time-limited 6-digit TOTP cryptographic code for in-person collection.
              </p>
            </div>

            <button
              onClick={() => navigate('/handover')}
              className="w-full py-2.5 rounded-xl border border-cyan-400/30 bg-cyan-500/20 text-cyan-200 text-xs font-bold hover:bg-cyan-500/30 transition-colors text-center cursor-pointer"
            >
              Open Handover Terminal ➔
            </button>
          </div>

          {/* Bento Card 4: Karma & Recognition Certificate (7 Cols) */}
          <div className="md:col-span-7 rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-950/25 via-navy-950/70 to-black/80 p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Award className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-xs font-mono font-bold text-amber-300 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30">
                Placement Citation
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                Student Honor Citations &amp; Karma Points
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Students who return lost property earn verified karma points and an official College Citation Certificate signed by the Principal for their academic portfolio.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/certificate')}
                className="px-5 py-2.5 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-200 text-xs font-bold hover:bg-amber-400/30 transition-colors cursor-pointer"
              >
                View Sample Certificate
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer"
              >
                Check My Karma Score
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── 4. Campus Safe Drop Desks Quick Map Strip ── */}
      <section className="rounded-3xl border border-white/15 bg-navy-950/90 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Campus Drop Kiosks</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Official Physical Handover Stations
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Drop found property at any monitored kiosk. Staff will log and safeguard it immediately.
            </p>
          </div>

          <button
            onClick={() => navigate('/hotspots')}
            className="px-5 py-2.5 rounded-xl ios-glass-btn-primary text-xs font-bold text-white shadow-md self-start sm:self-auto cursor-pointer"
          >
            Open Interactive Campus Map ➔
          </button>
        </div>

        {/* Drop Kiosks Quick Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1 hover:border-emerald-400/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Main Security Gate</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">Cantonment Entrance · Open 24/7</p>
            <p className="text-[11px] text-emerald-300 font-semibold pt-1">Station 01</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1 hover:border-emerald-400/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Central Library Kiosk</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">Ground Floor Circulation Counter</p>
            <p className="text-[11px] text-emerald-300 font-semibold pt-1">Station 02</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1 hover:border-emerald-400/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Administrative Block</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">Room 102 · Student Affairs Desk</p>
            <p className="text-[11px] text-emerald-300 font-semibold pt-1">Station 03</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1 hover:border-emerald-400/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Engineering Labs Core</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">Mech &amp; CSE Department Desks</p>
            <p className="text-[11px] text-emerald-300 font-semibold pt-1">Station 04</p>
          </div>
        </div>
      </section>

      {/* ── 5. Safety & Verification FAQ Accordion ── */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Institutional Guidelines
          </span>
          <h2 className="text-2xl font-black text-white">
            Frequently Asked Recovery Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/15 bg-navy-950/60 backdrop-blur-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-white">
                    {faq.q}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 text-emerald-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
