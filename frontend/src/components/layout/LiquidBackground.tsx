import React from 'react';

export const LiquidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#0a0e17]" aria-hidden="true">
      {/* Soft atmospheric ambient light for authentic iOS glass refraction */}
      <div 
        className="absolute top-[-15%] left-[20%] w-[55vw] h-[45vw] rounded-full blur-[140px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.09) 0%, rgba(5, 150, 105, 0.03) 60%, transparent 100%)' }}
      />
      <div 
        className="absolute bottom-[-10%] right-[10%] w-[50vw] h-[45vw] rounded-full blur-[140px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(14, 165, 233, 0.06) 0%, rgba(2, 132, 199, 0.02) 60%, transparent 100%)' }}
      />

      {/* RYMEC campus aerial texture under glass */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.07] mix-blend-luminosity filter blur-[0.5px]"
        style={{ backgroundImage: `url('/images/rymec-campus.png')` }}
      />
      
      {/* Dark scrim gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(10, 14, 23, 0.75) 0%, rgba(10, 14, 23, 0.92) 50%, #0a0e17 100%)'
        }}
      />

      {/* Fine architectural hairline grid */}
      <div 
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(rgba(240, 246, 252, 0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(240, 246, 252, 0.6) 1px, transparent 1px)',
          backgroundSize: '36px 36px'
        }}
      />
    </div>
  );
};
