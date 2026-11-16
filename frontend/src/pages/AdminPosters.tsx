import React, { useState, useEffect } from 'react';
import { Printer, ArrowLeft, MapPin, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../lib/api';
import { Location } from '../types';

interface AdminPostersProps {
  navigate: (route: string) => void;
}

export const AdminPosters: React.FC<AdminPostersProps> = ({ navigate }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<Location | null>(null);

  useEffect(() => {
    api.getLocations().then((res) => {
      const locs = res.locations || [];
      setLocations(locs);
      if (locs.length > 0) setSelectedLoc(locs[0]);
    }).catch(console.error);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Controls Bar (no-print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <button
            onClick={() => navigate('/admin')}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Core
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Location QR Posters (U9)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Print high-resolution A4 posters for physical noticeboards and campus hubs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedLoc?.id || ''}
            onChange={(e) => {
              const loc = locations.find((l) => l.id === e.target.value);
              if (loc) setSelectedLoc(loc);
            }}
            className="glass-input px-3.5 py-2 text-xs text-slate-800 dark:text-white bg-transparent rounded-xl focus:outline-none"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                {loc.name}
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg flex items-center gap-2 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print A4 Poster</span>
          </button>
        </div>
      </div>

      {/* Printable Poster Canvas */}
      {selectedLoc && (
        <div className="printable-card max-w-2xl mx-auto bg-white text-slate-950 p-10 sm:p-14 rounded-3xl shadow-2xl border-4 border-slate-900 flex flex-col items-center text-center space-y-8">
          {/* Header */}
          <div className="space-y-2 border-b-2 border-slate-900 pb-6 w-full">
            <div className="flex items-center justify-center gap-3">
              <img src="/images/vvs-logo.jpg" alt="RYMEC" className="w-12 h-12 rounded-full border border-slate-400" />
              <div className="text-left">
                <div className="text-xs font-extrabold tracking-wider text-slate-700 uppercase">
                  V.V. Sangha's
                </div>
                <div className="text-base sm:text-lg font-black text-slate-950 leading-tight">
                  Rao Bahadur Y. Mahabaleswarappa Engineering College
                </div>
                <div className="text-[11px] font-semibold text-slate-600">
                  Cantonment, Ballari - 583104 • NAAC Accredited • Affiliated to VTU
                </div>
              </div>
            </div>
          </div>

          {/* Location Badge */}
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 bg-slate-100 rounded-full border border-slate-300">
              Campus Location Point
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 pt-2">
              {selectedLoc.name}
            </h2>
            <div className="text-xs font-semibold text-indigo-700">
              {selectedLoc.parent_zone}
            </div>
          </div>

          {/* QR Code Container (U9) */}
          <div className="p-6 rounded-3xl bg-slate-50 border-4 border-slate-900 inline-block shadow-md">
            <QRCodeSVG
              value={`https://reclaim.rymec.edu.in/near/${selectedLoc.slug}`}
              size={240}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Call to Action */}
          <div className="space-y-3 max-w-md">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Found something here? <br />
              <span className="text-indigo-600 underline">Scan to report.</span>
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Help reunite lost belongings with fellow students. Scan this QR code with your mobile camera to quickly file or browse items found at this spot.
            </p>
          </div>

          {/* Footer note */}
          <div className="w-full pt-6 border-t border-slate-300 text-[10px] text-slate-500 flex items-center justify-between">
            <span>RYMEC ReClaim-iT Security Network</span>
            <span>Security Desk: +91 94480 12345</span>
          </div>
        </div>
      )}
    </div>
  );
};
