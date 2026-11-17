import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const FloatingParticles: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return null;

  const particles = [
    { size: 320, x: '5%', y: '10%', color: 'rgba(5, 150, 105, 0.22)', duration: 24 },
    { size: 380, x: '80%', y: '8%', color: 'rgba(16, 185, 129, 0.18)', duration: 28 },
    { size: 300, x: '70%', y: '75%', color: 'rgba(20, 184, 166, 0.18)', duration: 26 },
    { size: 260, x: '20%', y: '80%', color: 'rgba(245, 158, 11, 0.12)', duration: 22 },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {particles.map((p, idx) => (
        <motion.div
          key={idx}
          className="absolute rounded-full blur-3xl filter"
          style={{
            width: p.size,
            height: p.size,
            left: p.x,
            top: p.y,
            backgroundColor: p.color,
          }}
          animate={{
            y: [0, -25, 0],
            x: [0, 18, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};
