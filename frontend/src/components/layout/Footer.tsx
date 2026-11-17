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
              RYMEC <span className="text-brand-accent">ReClaim-iT</span>
            </span>
          </div>
          <p className="text-xs leading-relaxed">
            Official Campus Lost & Found recovery platform for Rao Bahadur Y. Mahabaleswarappa Engineering College, Ballari. Connecting students, verified handovers, and smart campus matching.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
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
              <button onClick={() => navigate('/browse')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                Browse Campus Listings
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/report')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                Report Lost or Found Item
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/handover')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                Scan Handover QR Code
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/dashboard')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                My Claims & Watchlist
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Institutional Redressal & Cells */}
        <div className="space-y-2">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
            Institutional Redressal
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li className="hover:text-emerald-400 transition-colors cursor-pointer">
              Campus Security & Custody Desk
            </li>
            <li className="hover:text-emerald-400 transition-colors cursor-pointer">
              Student Grievance Redressal Cell (SGRC)
            </li>
            <li className="hover:text-emerald-400 transition-colors cursor-pointer">
              Internal Quality Assurance Cell (IQAC)
            </li>
            <li className="hover:text-emerald-400 transition-colors cursor-pointer">
              Good Samaritan Citation Scheme
            </li>
            <li className="hover:text-emerald-400 transition-colors cursor-pointer">
              Anti-Ragging & Campus Safety Desk
            </li>
          </ul>
        </div>

        {/* Col 4: Official Grievance & Report Helpdesk */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
            Grievance & Report Helpdesk
          </h4>
          <div className="space-y-2 text-xs">
            <p className="text-slate-300 leading-relaxed text-[11px]">
              For direct complaint filing, status inquiries, or urgent committee escalation:
            </p>
            <div className="rounded-xl border border-white/15 bg-white/5 p-3 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                Direct Grievance Email
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
              Operating Hours: Mon–Sat 9:00 AM – 5:00 PM IST
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
              <span className="text-emerald-400 font-mono text-[10px]">@</span>
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
