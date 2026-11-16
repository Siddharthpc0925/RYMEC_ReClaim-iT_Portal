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
  GraduationCap,
  ExternalLink,
  Globe
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

      {/* Live Production Portal & Cloud Deployment Card */}
      <GlassCard className="p-6 sm:p-8 border border-cyan-400/30 bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900/60 shadow-glass-glow" glow>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                Official Live Cloud Deployment
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                Hosted 24/7 on Netlify
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              RYMEC ReClaim-iT Portal Online
            </h2>
            <p className="text-xs sm:text-sm text-silver-300 max-w-2xl leading-relaxed">
              The institutional campus lost &amp; found recovery portal is actively deployed and accessible to all RYMEC students, faculty, and security personnel.
            </p>
            <div className="pt-1">
              <a
                href="https://rymec-reclaim-it.netlify.app"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-cyan-300 hover:text-cyan-200 text-xs sm:text-sm font-bold underline underline-offset-4 flex items-center gap-1.5"
              >
                <Globe className="h-4 w-4" />
                <span>https://rymec-reclaim-it.netlify.app</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <a
              href="https://rymec-reclaim-it.netlify.app"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Visit Live Website</span>
              <ExternalLink className="h-4 w-4" />
            </a>

            <a
              href="https://github.com/nagavakkalagadda/RYMEC_ReClaim-iT_Portal"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/15 transition-all flex items-center justify-center gap-2"
            >
              <span>GitHub Repo</span>
            </a>
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
            <div className="mt-2 rounded-xl border border-blue-400/20 bg-blue-500/10 p-2.5 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-blue-300 block">
                Official ReClaim-iT Helpdesk
              </span>
              <a 
                href="mailto:rymec.ismart12@gmail.com" 
                className="font-medium text-white hover:text-blue-200 transition-colors flex items-center gap-1.5 break-all text-xs"
              >
                <Mail className="h-3.5 w-3.5 text-blue-300 shrink-0" />
                <span>rymec.ismart12@gmail.com</span>
              </a>
              <div className="pt-1.5 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-silver-400">Live Website:</span>
                <a
                  href="https://rymec-reclaim-it.netlify.app"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-mono font-bold text-cyan-300 hover:underline flex items-center gap-1"
                >
                  <span>rymec-reclaim-it.netlify.app</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </GlassCard>

      </div>

      {/* Project Contributors & Engineering Team */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Project Contributors &amp; Engineering Team</h2>
          </div>
          <span className="text-[11px] font-semibold text-silver-300 bg-white/10 border border-white/15 px-3 py-1 rounded-full w-fit">
            Department of CSE • Capstone Project Team
          </span>
        </div>

        <p className="text-xs text-silver-300 mb-6 leading-relaxed">
          Architected and engineered by Computer Science &amp; Engineering students at Rao Bahadur Y. Mahabaleswarappa Engineering College (RYMEC), Ballari.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              username: 'karthikhkarthik92-art',
              displayName: 'Karthik H',
              role: 'Core Contributor — Algorithmic Match Engine & Custody Architecture',
              avatar: 'https://github.com/karthikhkarthik92-art.png',
              github: 'https://github.com/karthikhkarthik92-art',
              badge: 'Contributor'
            },
            {
              username: 'akash-gouda',
              displayName: 'Akash Gouda',
              role: 'Core Contributor — Full-Stack Integration & Database Services',
              avatar: 'https://github.com/akash-gouda.png',
              github: 'https://github.com/akash-gouda',
              badge: 'Contributor'
            },
            {
              username: 'siddharthpc0925',
              displayName: 'Siddharth P C',
              role: 'Core Contributor — UI/UX Design & Liquid Glass Components',
              avatar: 'https://github.com/siddharthpc0925.png',
              github: 'https://github.com/siddharthpc0925',
              badge: 'Contributor'
            },
            {
              username: 'veereshmugali89-bit',
              displayName: 'Veeresh Mugali',
              role: 'Core Contributor — Verification, QA & Security Desk Portal',
              avatar: 'https://github.com/veereshmugali89-bit.png',
              github: 'https://github.com/veereshmugali89-bit',
              badge: 'Contributor'
            }
          ].map((contributor, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col items-center text-center hover:bg-white/10 hover:border-cyan-500/40 transition-all duration-300 group"
            >
              <div className="relative mb-3">
                <img 
                  src={contributor.avatar} 
                  alt={contributor.username}
                  className="h-16 w-16 rounded-full object-cover border-2 border-white/20 shadow-md group-hover:border-cyan-400 group-hover:scale-105 transition-all duration-300 bg-slate-800"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    (e.target as HTMLElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden h-16 w-16 rounded-full bg-slate-800 border-2 border-white/20 flex items-center justify-center text-cyan-400 font-bold text-lg">
                  {contributor.username.substring(0, 2).toUpperCase()}
                </div>
                <span className="absolute -bottom-1 -right-1 bg-cyan-500/90 text-navy-950 font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  {contributor.badge}
                </span>
              </div>

              <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                {contributor.displayName}
              </h3>
              <p className="text-[11px] text-cyan-400 font-mono mb-1">
                @{contributor.username}
              </p>
              <p className="text-[10px] text-silver-400 mb-3 flex-1 leading-relaxed">
                {contributor.role}
              </p>

              <a 
                href={contributor.github} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-cyan-600/40 px-3 py-1 rounded-full transition-all border border-white/10 w-full justify-center"
              >
                <span>View GitHub</span>
                <span className="text-cyan-400">→</span>
              </a>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
