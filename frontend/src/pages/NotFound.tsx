import React from 'react';
import { Compass, ArrowLeft } from 'lucide-react';

interface NotFoundProps {
  navigate: (route: string) => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ navigate }) => {
  return (
    <div className="max-w-md mx-auto py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
        <Compass className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">404</h1>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Campus Page Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          The requested lost & found section or record may have been relocated or archived.
        </p>
      </div>

      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to RYMEC Portal Home
      </button>
    </div>
  );
};
