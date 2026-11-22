import React from 'react';

export const LiquidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#090d14]" aria-hidden="true">
      {/* Restrained campus aerial overlay with calm dark gradient mask */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.06] filter grayscale"
        style={{ backgroundImage: `url('/images/rymec-campus.png')` }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 60%), linear-gradient(180deg, rgba(9, 13, 20, 0.8) 0%, #090d14 100%)'
        }}
      />
      {/* Quiet micro-grid */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(240, 246, 252, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(240, 246, 252, 0.5) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
};
