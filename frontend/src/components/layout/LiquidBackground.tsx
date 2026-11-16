import React from 'react';

export const LiquidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* Subtle College Aerial Photo Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-15 mix-blend-overlay filter blur-[2px] transition-opacity duration-1000"
        style={{ backgroundImage: `url('/images/rymec-campus.png')` }}
      />

      {/* 5 Drifting Colored Glass Blobs (U18) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/30 dark:bg-indigo-600/25 blur-[120px] animate-blob-drift-1" />
      <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-violet-600/30 dark:bg-violet-600/25 blur-[140px] animate-blob-drift-2" />
      <div className="absolute bottom-[-15%] left-[15%] w-[48vw] h-[48vw] rounded-full bg-cyan-500/25 dark:bg-cyan-500/20 blur-[130px] animate-blob-drift-3" />
      <div className="absolute top-[40%] left-[30%] w-[35vw] h-[35vw] rounded-full bg-rose-500/20 dark:bg-rose-500/15 blur-[110px] animate-blob-drift-4" />
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-amber-500/20 dark:bg-amber-500/15 blur-[130px] animate-blob-drift-5" />

      {/* Subtle Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.8) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
};
