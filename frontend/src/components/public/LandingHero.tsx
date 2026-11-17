import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Search, 
  MapPin, 
  QrCode, 
  PlusCircle, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Compass,
  Radio,
  FileText,
  KeyRound,
  Laptop,
  CreditCard,
  BookOpen
} from 'lucide-react';

interface LandingHeroProps {
  onReport: (type?: 'LOST' | 'FOUND') => void;
  onTrack: () => void;
  onBrowse: (category?: string) => void;
  onSearch?: (query: string) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onReport,
  onTrack,
  onBrowse,
  onSearch
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [quickCode, setQuickCode] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchInput.trim()) {
      onSearch(searchInput.trim());
    } else {
      onBrowse();
    }
  };

  const handleQuickVerify = (e: React.FormEvent) => {
    e.preventDefault();
    onTrack();
  };

  const quickCategories = [
    { label: 'Wallets & IDs', icon: CreditCard, query: 'wallet' },
    { label: 'Electronics', icon: Laptop, query: 'laptop' },
    { label: 'Keys', icon: KeyRound, query: 'keys' },
    { label: 'Books & Calcs', icon: BookOpen, query: 'calculator' },
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/15 bg-navy-950/80 backdrop-blur-2xl shadow-2xl p-6 sm:p-8 lg:p-10 mb-8">
      {/* Background Campus Ambient Mesh */}
      <div className="absolute inset-0 -z-20 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-600/30 via-teal-900/10 to-transparent" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      {/* Top Institutional Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10 mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="uppercase tracking-widest text-[11px]">RYMEC Campus Lost &amp; Found Command Radar</span>
          <span className="text-white/30 hidden sm:inline">•</span>
          <span className="text-slate-300 hidden sm:inline">V.V. Sangha, Ballari</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-400/15 border border-amber-300/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
            NAAC A+ Accredited
          </span>
          <span className="rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-[10px] font-bold text-slate-200">
            VTU Belagavi
          </span>
        </div>
      </div>

      {/* 2-Column Split Terminal Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Command & Action Center (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1 text-xs text-emerald-300 backdrop-blur-md">
              <Compass className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-semibold tracking-wide">Automated Campus Asset Recovery Hub</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Smart Lost &amp; Found{' '}
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                Recovery Radar
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
              Instant campus reporting, explainable algorithmic cross-matching, private student ID vaults, and cryptographic 6-digit handover verification across all 8 academic blocks.
            </p>
          </div>

          {/* Quick Search Bar directly inside Hero */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-emerald-400 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search lost items (e.g. calculator, keys, smart watch, wallet)..."
                className="w-full pl-11 pr-24 py-3.5 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none border border-white/20 bg-black/40 backdrop-blur-xl focus:border-emerald-400 transition-colors shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-2 rounded-xl ios-glass-btn-primary text-white text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Scan Now
              </button>
            </div>
          </form>

          {/* Quick Category Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Quick Scan:</span>
            {quickCategories.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => onBrowse(c.query)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1 text-xs text-slate-200 hover:text-white transition-all cursor-pointer"
                >
                  <Icon className="w-3 h-3 text-emerald-400" />
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dual Action Bento Command Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* Tile 1: Lost Property */}
            <div 
              onClick={() => onReport('LOST')}
              className="group cursor-pointer rounded-2xl p-5 border border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-black/40 to-black/60 hover:border-rose-400/60 transition-all hover:-translate-y-1 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Priority Broadcast
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-rose-200 transition-colors">
                I Lost Something
              </h3>
              <p className="text-xs text-slate-300/80 mt-1 leading-relaxed">
                Publish a secured notice. Automatic semantic matching scans all campus drop-desks continuously.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 mt-4 group-hover:translate-x-1 transition-transform">
                <span>File Lost Notice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Tile 2: Found Property */}
            <div 
              onClick={() => onReport('FOUND')}
              className="group cursor-pointer rounded-2xl p-5 border border-emerald-500/30 bg-gradient-to-br from-emerald-950/25 via-black/40 to-black/60 hover:border-emerald-400/60 transition-all hover:-translate-y-1 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Earn Citations
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-200 transition-colors">
                I Found Something
              </h3>
              <p className="text-xs text-slate-300/80 mt-1 leading-relaxed">
                Found keys, cards, or gadgets? Log it here or drop it at a designated campus security kiosk.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 mt-4 group-hover:translate-x-1 transition-transform">
                <span>Deposit Found Item</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Live Campus Recovery Radar HUD (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Radar Terminal Box */}
          <div className="relative rounded-2xl border border-white/20 bg-gradient-to-b from-white/10 via-black/60 to-black/80 p-5 backdrop-blur-2xl shadow-2xl overflow-hidden">
            
            {/* Live Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Campus Telemetry Hub
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                ZONE 583104 • LIVE
              </span>
            </div>

            {/* Visual Radar Scope graphic */}
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-black/60 border border-emerald-500/30 flex items-center justify-center p-4">
              {/* Concentric radar rings */}
              <div className="absolute inset-2 rounded-full border border-emerald-500/20" />
              <div className="absolute inset-8 rounded-full border border-emerald-500/30" />
              <div className="absolute inset-16 rounded-full border border-emerald-500/40" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-px bg-emerald-500/20" />
                <div className="h-full w-px bg-emerald-500/20 absolute" />
              </div>

              {/* Sweeping Radar Beam */}
              <div className="absolute inset-0 origin-center animate-spin" style={{ animationDuration: '6s' }}>
                <div className="w-1/2 h-1/2 bg-gradient-to-tr from-emerald-500/30 to-transparent transform -origin-bottom-right" />
              </div>

              {/* Campus Blips */}
              <div className="absolute top-1/4 left-1/3 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[9px] font-mono text-emerald-300 font-bold bg-black/80 px-1 rounded">Admin Kiosk</span>
              </div>
              <div className="absolute bottom-1/3 right-1/4 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" style={{ animationDelay: '1s' }} />
                <span className="text-[9px] font-mono text-teal-300 font-bold bg-black/80 px-1 rounded">Library Desk</span>
              </div>
              <div className="absolute top-1/2 right-1/3 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" style={{ animationDelay: '2s' }} />
                <span className="text-[9px] font-mono text-amber-300 font-bold bg-black/80 px-1 rounded">CSE Block</span>
              </div>

              {/* Center Radar Center */}
              <div className="relative z-10 w-4 h-4 rounded-full bg-emerald-500/60 border border-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.9)] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="text-base sm:text-lg font-black text-emerald-400">94.8%</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Recovery Rate</div>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="text-base sm:text-lg font-black text-teal-300">230+</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Items Returned</div>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="text-base sm:text-lg font-black text-amber-300">&lt; 4 hrs</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Avg Match Time</div>
              </div>
            </div>

          </div>

          {/* Quick QR Handover Verification Station Card */}
          <div className="rounded-2xl border border-white/20 bg-gradient-to-r from-emerald-950/40 via-black/50 to-slate-900/60 p-4 backdrop-blur-xl shadow-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                <QrCode className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Handover Verification Desk
                </h4>
                <p className="text-[11px] text-slate-300">
                  Got a 6-digit claim code from the rightful owner?
                </p>
              </div>
            </div>

            <button
              onClick={onTrack}
              className="px-4 py-2 rounded-xl border border-emerald-400/40 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-bold shrink-0 transition-colors cursor-pointer"
            >
              Verify Code ➔
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
