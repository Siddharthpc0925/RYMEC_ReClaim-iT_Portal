import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const FloatingParticles: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return null;

  const particles = [
    { size: 300, x: '5%', y: '10%', color: 'rgba(37, 99, 235, 0.18)', duration: 24 },
    { size: 360, x: '80%', y: '8%', color: 'rgba(14, 165, 233, 0.15)', duration: 28 },
    { size: 280, x: '70%', y: '75%', color: 'rgba(99, 102, 241, 0.16)', duration: 26 },
    { size: 240, x: '20%', y: '80%', color: 'rgba(168, 85, 247, 0.14)', duration: 22 },
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
