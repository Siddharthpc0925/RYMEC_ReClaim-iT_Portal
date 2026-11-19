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

export const AboutCollege: React.FC = () => {
  const contributors = [
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
      role: 'Core Contributor — UI/UX Design & Frontend Engineering',
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
  ];

  return (
    <div className="page-wrap space-y-6">
      
      {/* ── College Heritage Banner ── */}
      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 shadow-md">
            <Building2 className="h-10 w-10" />
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              VEERASAIVA VIDYAVARDHAKA SANGHA, BALLARI
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Rao Bahadur Y. Mahabaleswarappa Engineering College
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Affiliated to Visvesvaraya Technological University (VTU), Belagavi • Approved by AICTE, New Delhi • Accredited with NAAC A+ Grade
            </p>
          </div>
        </div>
      </section>

      {/* ── Institutional History & Campus Overview ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <section className="surface-card md:col-span-2 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-400" />
            <span>Legacy of Technical Excellence (Estd. 1980)</span>
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Rao Bahadur Y. Mahabaleswarappa Engineering College (formerly Vijayanagara Engineering College), was established in the year 1980 by the Veerasaiva Vidyavardhaka Sangha, Ballari. Over the past four decades, RYMEC has evolved into a premier engineering destination in the Kalyana-Karnataka region, nurturing thousands of visionary technocrats and researchers.
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            The institution boasts a sprawling lush green campus in Cantonment, Ballari, featuring the state-of-the-art Dr. A.P.J. Abdul Kalam Administrative Block, Aryabhata Academic Block, New Age Innovation Network (NAIN) center for startups, high-performance computing centers, central library, and hygienic residential hostels.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <span className="font-mono text-xl font-bold text-emerald-400">1980</span>
              <span className="text-[10px] text-slate-400 block">Established</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <span className="font-mono text-xl font-bold text-emerald-400">NAAC A+</span>
              <span className="text-[10px] text-slate-400 block">Accreditation</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <span className="font-mono text-xl font-bold text-amber-300">NBA</span>
              <span className="text-[10px] text-slate-400 block">Accredited Depts</span>
            </div>
          </div>
        </section>

        {/* ── Campus Information ── */}
        <section className="surface-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Campus Information</h3>
          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Cantonment, Ballari - 583104, Karnataka, India</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>+91 8392 244809 / 244810</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>principal@rymec.edu.in</span>
            </div>
            
            <div className="mt-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block tracking-wider">
                Official ReClaim-iT Custody Gateway
              </span>
              <a 
                href="mailto:rymec.ismart12@gmail.com" 
                className="font-medium text-white hover:text-emerald-300 transition-colors flex items-center gap-1.5 break-all text-xs"
              >
                <Mail className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>rymec.ismart12@gmail.com</span>
              </a>
              <p className="text-[10px] text-slate-400 pt-1">
                Mon–Sat 9:00 AM – 5:00 PM IST
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* ── Project Contributors & Engineering Team ── */}
      <section className="surface-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Project Contributors &amp; Engineering Team</h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full w-fit">
            Department of CSE • Capstone Project Team
          </span>
        </div>

        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          Architected and engineered by Computer Science &amp; Engineering students at Rao Bahadur Y. Mahabaleswarappa Engineering College (RYMEC), Ballari.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contributors.map((contributor, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col items-center text-center hover:bg-white/10 hover:border-emerald-500/40 transition-all duration-300 group"
            >
              <div className="relative mb-3">
                <img 
                  src={contributor.avatar} 
                  alt={contributor.username}
                  className="h-16 w-16 rounded-full object-cover border-2 border-white/20 shadow-md group-hover:border-emerald-400 group-hover:scale-105 transition-all duration-300 bg-slate-800"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    (e.target as HTMLElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden h-16 w-16 rounded-full bg-slate-800 border-2 border-white/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
                  {contributor.username.substring(0, 2).toUpperCase()}
                </div>
                <span className="absolute -bottom-1 -right-1 bg-emerald-500/90 text-navy-950 font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  {contributor.badge}
                </span>
              </div>

              <h3 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                {contributor.displayName}
              </h3>
              <p className="text-[11px] text-emerald-400 font-mono mb-1">
                @{contributor.username}
              </p>
              <p className="text-[10px] text-slate-400 mb-3 flex-1 leading-relaxed">
                {contributor.role}
              </p>

              <a 
                href={contributor.github} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-emerald-600/40 px-3 py-1 rounded-full transition-all border border-white/10 w-full justify-center"
              >
                <span>View GitHub</span>
                <span className="text-emerald-400">→</span>
              </a>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
