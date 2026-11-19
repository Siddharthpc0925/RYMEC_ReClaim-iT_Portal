import React from 'react';
import { Shield, MapPin, Mail } from 'lucide-react';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const contributors = [
    { name: 'Karthik H', user: 'karthikhkarthik92-art' },
    { name: 'Akash Gouda', user: 'akash-gouda' },
    { name: 'Siddharth P C', user: 'siddharthpc0925' },
    { name: 'Veeresh Mugali', user: 'veereshmugali89-bit' }
  ];

  return (
    <footer className="app-footer" style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>
          <span className="footer-signal" />
          <strong>RYMEC ReClaim-iT · Campus Lost &amp; Found Portal</strong>
        </span>
        <span style={{ color: 'var(--muted)', fontSize: '11px' }}>
          Rao Bahadur Y. Mahabaleswarappa Engineering College, Ballari — NAAC A+ Accredited · VTU Affiliated · Estd. 1980
        </span>
        <span style={{ color: 'var(--muted)', fontSize: '10px' }}>
          Campus Custody &amp; Recovery Gateway: <a href="mailto:rymec.ismart12@gmail.com" className="text-emerald-400 hover:underline">rymec.ismart12@gmail.com</a>
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--muted)', fontSize: '11px' }}>Engineered by CSE Capstone Team:</span>
          {contributors.map((m) => (
            <a
              key={m.user}
              href={`https://github.com/${m.user}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-white/5 hover:bg-white/10 px-2 py-0.5 text-[10px] text-slate-300 hover:text-white border border-white/10"
              title={`${m.name} (@${m.user})`}
            >
              <span className="text-emerald-400">@</span>
              <span>{m.user}</span>
            </a>
          ))}
        </div>
        <span style={{ color: 'var(--muted-2)', fontSize: '10px' }}>
          © {new Date().getFullYear()} RYMEC Ballari. All rights reserved.
        </span>
      </div>
    </footer>
  );
};
