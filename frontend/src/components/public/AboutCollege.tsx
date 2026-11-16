import React from 'react';
import { 
  Building2, 
  Award, 
  ShieldCheck, 
  BookOpen, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  GraduationCap 
} from 'lucide-react';
import { GlassCard } from '../3d/GlassCard';

export const AboutCollege: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* College Heritage Banner */}
      <GlassCard className="p-6 sm:p-8" glow>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-glass-glow text-white">
            <Building2 className="h-10 w-10" />
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">
              VEERASAIVA VIDYAVARDHAKA SANGHA, BALLARI
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Rao Bahadur Y. Mahabaleswarappa Engineering College
            </h1>
            <p className="text-xs sm:text-sm text-silver-300">
              Affiliated to Visvesvaraya Technological University (VTU), Belagavi • Approved by AICTE, New Delhi • Accredited with NAAC A+ Grade
            </p>
          </div>
        </div>
      </GlassCard>

      {/* History and Institutional Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <GlassCard className="md:col-span-2 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-cyan-400" />
            <span>Legacy of Technical Excellence (Estd. 1980)</span>
          </h2>
          <p className="text-xs text-silver-300 leading-relaxed">
            Rao Bahadur Y. Mahabaleswarappa Engineering College (formerly Vijayanagara Engineering College), was established in the year 1980 by the Veerasaiva Vidyavardhaka Sangha, Ballari. Over the past four decades, RYMEC has evolved into a premier engineering destination in the Kalyana-Karnataka region, nurturing thousands of visionary technocrats and researchers.
          </p>
          <p className="text-xs text-silver-300 leading-relaxed">
            The institution boasts a sprawling lush green campus in Cantonment, Ballari, featuring the state-of-the-art Dr. A.P.J. Abdul Kalam Administrative Block, Aryabhata Academic Block, New Age Innovation Network (NAIN) center for startups, high-performance computing centers, central library, and hygienic residential hostels.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <span className="font-mono text-xl font-bold text-cyan-400">1980</span>
              <span className="text-[10px] text-silver-400 block">Established</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <span className="font-mono text-xl font-bold text-emerald-400">NAAC A+</span>
              <span className="text-[10px] text-silver-400 block">Accreditation</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <span className="font-mono text-xl font-bold text-indigo-400">NBA</span>
              <span className="text-[10px] text-silver-400 block">Accredited Depts</span>
            </div>
          </div>
        </GlassCard>

        {/* Contact Coordinates */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Campus Information</h3>
          <div className="space-y-3 text-xs text-silver-300">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Cantonment, Ballari - 583104, Karnataka, India</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>+91 8392 244809 / 244810</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>principal@rymec.edu.in</span>
            </div>
            <div className="mt-2 rounded-xl border border-blue-400/20 bg-blue-500/10 p-2.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-300 block">
                Official ReClaim-iT Desk
              </span>
              <a 
                href="mailto:reclaim@rymec.edu.in" 
                className="font-medium text-white hover:text-blue-200 transition-colors flex items-center gap-1.5 break-all text-xs"
              >
                <Mail className="h-3.5 w-3.5 text-blue-300 shrink-0" />
                <span>reclaim@rymec.edu.in</span>
              </a>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};
