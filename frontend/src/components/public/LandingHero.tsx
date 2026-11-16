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
  Trophy
} from 'lucide-react';
import { GlassCard } from '../3d/GlassCard';

interface LandingHeroProps {
  onReport: () => void;
  onTrack: () => void;
  onBrowse: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onReport,
  onTrack,
  onBrowse
}) => {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden">

      {/* ── Background RYMEC Campus Photograph ── */}
      <div className="absolute inset-0 -z-30">
        <img
          src="/images/rymec-campus.png"
          alt="Rao Bahadur Y. Mahabaleswarappa Engineering College Campus"
          className="w-full h-full object-cover object-center scale-[1.02]"
          draggable={false}
        />
      </div>

      {/* ── Apple Liquid Glass Ambient Veil ── */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-navy-950/25 via-navy-950/45 to-navy-950/92" />

      {/* ── Central Hero Section ── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center max-w-4xl mx-auto">

        {/* iOS Frosted Dynamic Status Capsule */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs text-white backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.35)] mb-6">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="font-medium tracking-wide">NAAC A+ Accredited · VTU Affiliated · Estd. 1980</span>
        </div>

        {/* Institution Identity */}
        <div className="space-y-3 mb-6">
          <p className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent drop-shadow-sm">
            Veerasaiva Vidyavardhaka Sangha, Ballari
          </p>

          <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-slate-100 leading-snug drop-shadow-sm">
            Rao Bahadur Y. Mahabaleswarappa Engineering College
          </h2>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mt-1 bg-gradient-to-b from-white via-slate-50 to-sky-200 bg-clip-text text-transparent drop-shadow-[0_4px_30px_rgba(255,255,255,0.22)]">
            RYMEC ReClaim-iT
          </h1>
        </div>

        {/* Campus Location Pin */}
        <div className="flex items-center justify-center gap-1.5 mb-6 text-sky-200/90 text-xs font-medium">
          <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0" />
          <span>V.V. Sangha Campus, Cantonment, Ballari — 583 104, Karnataka</span>
        </div>

        {/* Institutional Purpose Statement */}
        <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed font-normal max-w-2xl mx-auto mb-8">
          The official institutional Lost & Found recovery portal for students, faculty, and administration —
          providing structured reporting, explainable algorithmic matching, private ID protection, and secure QR handover verification.
        </p>

        {/* Apple iOS Liquid Glass Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <button
            onClick={onReport}
            className="ios-glass-btn-primary rounded-2xl px-7 py-3.5 text-sm font-semibold text-white flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-transform"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Report Lost / Found</span>
          </button>

          <button
            onClick={onTrack}
            className="ios-glass-btn-secondary rounded-2xl px-6 py-3.5 text-sm font-semibold text-white flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-transform"
          >
            <QrCode className="h-4 w-4 text-sky-400" />
            <span>Verify Handover QR</span>
          </button>

          <button
            onClick={onBrowse}
            className="rounded-2xl border border-white/20 bg-white/10 hover:bg-white/15 px-6 py-3.5 text-sm font-semibold text-white flex items-center gap-2 cursor-pointer backdrop-blur-xl shadow-md active:scale-95 transition-all"
          >
            <Search className="h-4 w-4 text-silver-300" />
            <span>Browse Directory</span>
          </button>
        </div>

      </div>

    </div>
  );
};
