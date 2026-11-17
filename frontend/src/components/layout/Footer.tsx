import React from 'react';
import { Shield, MapPin, Phone, Mail, Award, Heart } from 'lucide-react';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="w-full mt-24 border-t border-white/10 glass rounded-t-3xl pt-12 pb-24 md:pb-12 px-6 sm:px-12 text-slate-600 dark:text-slate-400 no-print">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: About */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30 flex items-center justify-center bg-white/10">
              <img src="/images/vvs-logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-base">
              RYMEC <span className="text-indigo-500">ReClaim-iT</span>
            </span>
          </div>
          <p className="text-xs leading-relaxed">
            Official Campus Lost & Found recovery platform for Rao Bahadur Y. Mahabaleswarappa Engineering College, Ballari. Connecting students, verified handovers, and smart campus matching.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>Secure Handover & Anti-Fraud Protected</span>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div className="space-y-2">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
            Quick Navigation
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button onClick={() => navigate('/browse')} className="hover:text-indigo-400 transition-colors">
                Browse Campus Listings
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/report')} className="hover:text-indigo-400 transition-colors">
                Report Lost or Found Item
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/handover')} className="hover:text-indigo-400 transition-colors">
                Scan Handover QR Code
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/dashboard')} className="hover:text-indigo-400 transition-colors">
                My Claims & Watchlist
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Campus Custody & Drop Desks */}
        <div className="space-y-2">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
            Campus Drop Desks
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>Main Security Gate 1 Kiosk</span>
            </li>
            <li className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>Admin Block Reception Desk</span>
            </li>
            <li className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>Central Library Inward Counter</span>
            </li>
            <li className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>Department Lab Security Stations</span>
            </li>
            <li className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5">
              <Award className="w-3 h-3 text-amber-400" />
              <span>Good Samaritan Honor Roll</span>
            </li>
          </ul>
        </div>

        {/* Col 4: RYMEC-iSMART Official Verification Gateway */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
            RYMEC-iSMART Gateway
          </h4>
          <div className="space-y-2 text-xs">
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Institutional verification, cryptographic PIN dispatch, and security handover authentication:
            </p>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                Official Gateway Email
              </span>
              <a 
                href="mailto:rymec.ismart12@gmail.com" 
                className="font-medium text-white hover:text-emerald-300 transition-colors flex items-center gap-1.5 break-all text-xs"
              >
                <Mail className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>rymec.ismart12@gmail.com</span>
              </a>
            </div>
            <p className="text-[11px] text-slate-400">
              Campus Security On-Duty: 24/7 Operations Desk
            </p>
          </div>
        </div>
      </div>

      {/* Project Contributors & Engineering Team Attribution */}
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-white">Engineered by CSE Capstone Team:</span>
          <span className="text-slate-500">RYMEC Ballari</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { name: 'Karthik H', user: 'karthikhkarthik92-art' },
            { name: 'Akash Gouda', user: 'akash-gouda' },
            { name: 'Siddharth P C', user: 'siddharthpc0925' },
            { name: 'Veeresh Mugali', user: 'veereshmugali89-bit' }
          ].map((m, idx) => (
            <a
              key={idx}
              href={`https://github.com/${m.user}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-white/5 hover:bg-white/15 px-2.5 py-1 text-slate-300 hover:text-white border border-white/10 text-[11px] transition-all"
              title={`${m.name} (@${m.user})`}
            >
              <span className="text-sky-400 font-mono text-[10px]">@</span>
              <span>{m.user}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
        <div>
          © {new Date().getFullYear()} Rao Bahadur Y. Mahabaleswarappa Engineering College (RYMEC). All rights reserved.
        </div>
        <div className="flex items-center gap-1 mt-2 sm:mt-0">
          <span>Developed for RYMEC Student Innovation with</span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          <span>Liquid Glass UI</span>
        </div>
      </div>
    </footer>
  );
};
