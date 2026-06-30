import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AiraEmotion } from './AuraBg';

interface Particle {
  id: number;
  char: string;
  x: number;
  size: number;
  duration: number;
  color: string;
}

interface ParticleFieldProps {
  emotion: AiraEmotion;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({ emotion }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Determine particle characters & colors based on emotion
    const getParticleConfig = (): { chars: string[]; colors: string[] } => {
      switch (emotion) {
        case 'happy':
        case 'laughing':
          return { chars: ['✨', '🌸', '⭐'], colors: ['text-yellow-400', 'text-pink-400', 'text-amber-300'] };
        case 'excited':
          return { chars: ['⚡', '✨', '🔥', '★'], colors: ['text-cyan-400', 'text-pink-400', 'text-yellow-300'] };
        case 'caring':
          return { chars: ['💖', '💕', '💗', '💌'], colors: ['text-rose-400', 'text-pink-400', 'text-red-400'] };
        case 'thinking':
          return { chars: ['⚙️', '💡', '💭'], colors: ['text-purple-400', 'text-cyan-400', 'text-indigo-400'] };
        case 'surprised':
          return { chars: ['❗', '❓', '⚡'], colors: ['text-amber-400', 'text-cyan-400', 'text-pink-400'] };
        case 'confused':
          return { chars: ['❓', '💭', '💬'], colors: ['text-blue-400', 'text-indigo-400', 'text-purple-400'] };
        case 'sad':
          return { chars: ['💧', '🌧️', '❄️'], colors: ['text-blue-400', 'text-sky-300', 'text-indigo-300'] };
        default:
          return { chars: ['✨', '🎵', '🌸'], colors: ['text-purple-400/50', 'text-pink-400/50', 'text-indigo-400/50'] };
      }
    };

    const config = getParticleConfig();
    const spawnParticle = () => {
      const newParticle: Particle = {
        id: Math.random() + Date.now(),
        char: config.chars[Math.floor(Math.random() * config.chars.length)],
        x: 10 + Math.random() * 80, // percentage from left
        size: 12 + Math.random() * 16, // px
        duration: 3 + Math.random() * 4, // seconds
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
      };

      setParticles((prev) => [...prev.slice(-15), newParticle]); // Cap active particles at 15
    };

    // Spawn rate differs by emotion
    const intervalTime = ['excited', 'laughing'].includes(emotion) ? 600 : 1200;
    const interval = setInterval(spawnParticle, intervalTime);

    // Initial spawn
    for (let i = 0; i < 4; i++) {
      setTimeout(spawnParticle, i * 300);
    }

    return () => clearInterval(interval);
  }, [emotion]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl z-10">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: '110%', x: `${p.x}%`, opacity: 0, scale: 0.5, rotate: 0 }}
            animate={{
              y: '-10%',
              x: `${p.x + (Math.sin(p.id) * 12)}%`, // sway side-to-side
              opacity: [0, 0.9, 0.9, 0],
              scale: [0.5, 1, 1.2, 0.8],
              rotate: Math.random() > 0.5 ? 360 : -360,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: p.duration, ease: 'easeOut' }}
            className={`absolute pointer-events-none ${p.color} filter drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]`}
            style={{ fontSize: `${p.size}px` }}
          >
            {p.char}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
