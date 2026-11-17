import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Search, 
  Clock, 
  Lock, 
  Mail,
  MapPin, 
  FileCheck, 
  ChevronRight, 
  QrCode, 
  PlusCircle, 
  CheckCircle2, 
  Sparkles, 
  Trophy,
  Radar,
  KeyRound,
  Award,
  Layers,
  HelpCircle,
  Laptop,
  CreditCard,
  Key,
  BookOpen
} from 'lucide-react';

interface LandingHeroProps {
  onReportLost: () => void;
  onReportFound: () => void;
  onTrack: () => void;
  onBrowse: () => void;
  onSelectCategory?: (category: string) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onReportLost,
  onReportFound,
  onTrack,
  onBrowse,
  onSelectCategory
}) => {
  return (
    <div className="relative overflow-hidden pt-6 pb-8">
      {/* ── Background Subtle Tech Mesh & Campus Atmosphere ── */}
      <div className="absolute inset-0 -z-30 opacity-40">
        <img
          src="/images/rymec-campus.png"
          alt="RYMEC Campus"
          className="w-full h-full object-cover object-center filter blur-sm scale-105"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-950/95 to-navy-950" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* ── Top Institutional Telemetry Bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl border border-emerald-500/25 bg-navy-950/70 backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_#10B981]"></span>
            </span>
            <div className="text-left">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Campus Recovery Radar Online
              </span>
              <span className="hidden sm:inline text-xs text-slate-400 mx-2">|</span>
              <span className="hidden sm:inline text-xs text-slate-300 font-medium">
                V.V. Sangha’s Rao Bahadur Y. Mahabaleswarappa Engineering College
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-400/15 border border-amber-300/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
              NAAC A+ Accredited
            </span>
            <span className="rounded-full bg-emerald-400/15 border border-emerald-300/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
              14 Monitored Zones
            </span>
          </div>
        </div>

        {/* ── Headline & Purpose Statement ── */}
        <div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 text-xs font-semibold">
            <Radar className="w-3.5 h-3.5 animate-spin-slow text-emerald-400" />
            <span>Smart Algorithmic Matching · Zero False Claims</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white">
            Campus Lost &amp; Found{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              Command Radar
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            The official institutional property recovery engine for RYMEC students and faculty.
            Report misplaced gear, turn in found items, and verify ownership with cryptographically secured 6-digit handover PINs.
          </p>
        </div>

        {/* ── Dual-Wing Operations Launchpad ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          
          {/* Wing A: "I Lost Something on Campus" */}
          <div className="relative rounded-3xl p-6 sm:p-8 border border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-navy-950/60 to-navy-950/90 backdrop-blur-2xl shadow-xl flex flex-col justify-between group hover:border-rose-400/50 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  Urgent Recovery Action
                </span>
                <span className="text-[11px] text-slate-400 font-mono">STEP 01</span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white group-hover:text-rose-200 transition-colors">
                  I Misplaced Property on Campus
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Lost an ID card, laptop, scientific calculator, keys, or lab record? File a report now. Our explainable match engine will continuously scan all campus drop desks 24/7.
                </p>
              </div>

              {/* Quick Category Chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  Quick Select Category:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'College ID Card', icon: CreditCard },
                    { label: 'Laptop / Charger', icon: Laptop },
                    { label: 'Lab Records / Books', icon: BookOpen },
                    { label: 'Keys & Lanyards', icon: Key }
                  ].map((cat, idx) => {
                    const CatIcon = cat.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => onSelectCategory && onSelectCategory(cat.label)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        <CatIcon className="w-3 h-3 text-rose-400" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={onReportLost}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>File Lost Item Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-slate-400 text-center sm:text-right">
                Encrypted &amp; private student details
              </span>
            </div>
          </div>

          {/* Wing B: "I Found Unattended Property" */}
          <div className="relative rounded-3xl p-6 sm:p-8 border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-navy-950/60 to-navy-950/90 backdrop-blur-2xl shadow-xl flex flex-col justify-between group hover:border-emerald-400/50 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Good Samaritan Honor Action
                </span>
                <span className="text-[11px] text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-300/20">
                  +50 Karma Points
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white group-hover:text-emerald-200 transition-colors">
                  I Found Unattended Property
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Turned in a peer's belongings at a campus desk? Log it here. Claimants must answer your hidden verification questions before generating an anti-theft handover PIN.
                </p>
              </div>

              {/* Good Samaritan Citations Highlight */}
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Institutional Good Samaritan Scheme</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Successful handovers earn verified Karma Points and an official downloadable VTU-recognized Citation Certificate.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={onReportFound}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Log Found Property (+50 Pts)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onTrack}
                className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 hover:underline flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Verify Handover PIN</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
