import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  glow = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`ios-glass-card rounded-3xl p-6 ${glow ? 'shadow-glass-glow' : ''} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
};
