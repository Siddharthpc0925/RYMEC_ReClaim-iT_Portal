import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Lock,
  MessageSquare,
  MapPin,
  ArrowRight,
  Radar,
  KeyRound,
  Award,
  Clock,
  ChevronRight,
  Tag,
  Building2,
  ExternalLink,
  Flame
} from 'lucide-react';
import { LandingHero } from '../components/public/LandingHero';
import { api } from '../lib/api';
import { Item } from '../types';

interface HomeProps {
  navigate: (route: string) => void;
}

export const Home: React.FC<HomeProps> = ({ navigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'LOST' | 'FOUND'>('ALL');
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    api.getItems({ limit: 6 })
      .then((res) => {
        setRecentItems(res.items || []);
      })
      .catch((err) => {
        console.error('Failed to load recent items:', err);
      })
      .finally(() => setLoadingItems(false));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (selectedFilter !== 'ALL') params.append('type', selectedFilter);
    navigate(`/browse?${params.toString()}`);
  };

  const handleCategorySelect = (category: string) => {
    navigate(`/browse?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* ── 1. Asymmetric Dual-Wing Command Radar Hero ── */}
      <LandingHero
        onReportLost={() => navigate('/report?type=LOST')}
        onReportFound={() => navigate('/report?type=FOUND')}
        onTrack={() => navigate('/handover')}
        onBrowse={() => navigate('/browse')}
        onSelectCategory={handleCategorySelect}
      />

      {/* ── 2. Integrated Campus Radar Search & Filter Terminal ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-emerald-500/30 bg-navy-950/85 backdrop-blur-2xl p-3 sm:p-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-3"
        >
          {/* Top Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-1.5">
              <Radar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Instant Campus Query
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {(['ALL', 'LOST', 'FOUND'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedFilter(type)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedFilter === type
                      ? type === 'LOST'
                        ? 'bg-rose-500 text-white shadow-md'
                        : type === 'FOUND'
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-white/20 text-white shadow-md'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {type === 'ALL' ? 'All Items' : type === 'LOST' ? 'Lost Property' : 'Found Property'}
                </button>
              ))}
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-emerald-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords: 'ID card CSE', 'Casio FX-991EX', 'HP Charger', 'Keys'..."
              className="w-full pl-11 pr-28 py-3.5 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none border border-white/10 bg-white/5 focus:border-emerald-400/60 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-bold shadow-md hover:from-emerald-500 hover:to-teal-400 active:scale-95 transition-all cursor-pointer"
            >
              Scan Radar
            </button>
          </form>
        </motion.div>
      </div>

      {/* ── 3. Live Campus Radar Feed (Recently Logged Items) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Live Campus Recovery Radar
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Active student reports across Ballari cantonment campus drop desks.
            </p>
          </div>

          <button
            onClick={() => navigate('/browse')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group"
          >
            <span>Open Full Directory ({recentItems.length}+ Items)</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {loadingItems ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl p-5 border border-white/10 bg-white/5 animate-pulse h-40" />
            ))}
          </div>
        ) : recentItems.length === 0 ? (
          <div className="text-center py-12 rounded-3xl border border-white/10 bg-white/5 space-y-2">
            <p className="text-slate-300 font-medium text-sm">No items currently reported on campus radar.</p>
            <p className="text-xs text-slate-500">Be the first to file a lost item or log found property.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/items/${item.id}`)}
                className="group relative rounded-2xl p-5 border border-white/15 bg-navy-950/70 hover:border-emerald-500/40 hover:bg-navy-950/90 transition-all duration-200 cursor-pointer shadow-lg space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        item.type === 'LOST'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {item.type === 'LOST' ? '🚨 LOST ITEM' : '🎁 FOUND PROPERTY'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Active'}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description || 'No additional details provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-300 truncate max-w-[200px]">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{item.location_name || 'RYMEC Campus'}</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-[11px] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Inspect <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. The 4-Stage Cryptographic Safe Handover Architecture ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Institutional Custody Protocol
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            How RYMEC ReClaim-iT Secures Property
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Engineered with zero-knowledge ID protection, explainable similarity scoring, and physical kiosk verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Step 1 */}
          <div className="rounded-2xl p-6 border border-emerald-500/20 bg-navy-950/60 backdrop-blur-xl space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-300 text-sm">
              01
            </div>
            <h3 className="font-bold text-white text-base">Neural Match Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time multi-factor algorithmic matching compares item category, campus zone proximity, date gap, brand, and visual description synonyms.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl p-6 border border-teal-500/20 bg-navy-950/60 backdrop-blur-xl space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center font-black text-teal-300 text-sm">
              02
            </div>
            <h3 className="font-bold text-white text-base">Zero-Knowledge Proof</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              To prevent fraudulent claims, claimants must correctly answer secret verification questions set by the finder before any meetup is arranged.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl p-6 border border-cyan-500/20 bg-navy-950/60 backdrop-blur-xl space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center font-black text-cyan-300 text-sm">
              03
            </div>
            <h3 className="font-bold text-white text-base">6-Digit Handover PIN</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Once verified, the RYMEC-iSMART security gateway issues an encrypted 6-digit one-time PIN required to close the recovery loop.
            </p>
          </div>

          {/* Step 4 */}
          <div className="rounded-2xl p-6 border border-amber-500/20 bg-navy-950/60 backdrop-blur-xl space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-black text-amber-300 text-sm">
              04
            </div>
            <h3 className="font-bold text-white text-base">Kiosk Handover &amp; Citation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Property is handed over at campus security desks. Finders are awarded +50 Karma Points and official downloadable Good Samaritan Citation certificates.
            </p>
          </div>

        </div>
      </div>

      {/* ── 5. Campus Drop Desks & Custody Kiosks ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Campus Drop Desks &amp; Custody Stations
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure physical locations to safely deposit found items or collect verified belongings.
            </p>
          </div>

          <button
            onClick={() => navigate('/hotspots')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group"
          >
            <span>Interactive Campus Grid</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              name: 'Main Security Gate 1',
              zone: 'Campus Entrance',
              timing: '24/7 Active Desk',
              slug: 'main-gate-security'
            },
            {
              name: 'Admin Block Reception',
              zone: 'Counter 03',
              timing: '9:00 AM – 5:00 PM',
              slug: 'admin-block'
            },
            {
              name: 'Central Library Inward',
              zone: 'Ground Floor Desk',
              timing: '8:30 AM – 8:00 PM',
              slug: 'central-library'
            },
            {
              name: 'Mechanical Workshop Kiosk',
              zone: 'Security Post 2',
              timing: '9:00 AM – 5:30 PM',
              slug: 'mech-block'
            }
          ].map((kiosk, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/near/${kiosk.slug}`)}
              className="p-5 rounded-2xl border border-white/10 bg-navy-950/60 hover:border-emerald-500/40 hover:bg-navy-950/80 transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                  {kiosk.timing}
                </span>
                <MapPin className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </div>

              <h4 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                {kiosk.name}
              </h4>

              <p className="text-xs text-slate-400">
                Zone: {kiosk.zone}
              </p>

              <div className="pt-2 text-[11px] font-semibold text-emerald-400/80 group-hover:text-emerald-300 flex items-center gap-1">
                <span>View Custody Items</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
