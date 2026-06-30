import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type AiraEmotion = 'default' | 'happy' | 'excited' | 'thinking' | 'surprised' | 'laughing' | 'caring' | 'confused' | 'sad';

interface AuraBgProps {
  emotion: AiraEmotion;
}

export const AuraBg: React.FC<AuraBgProps> = ({ emotion }) => {
  const getGlowStyles = () => {
    switch (emotion) {
      case 'happy':
      case 'laughing':
        return {
          gradient: 'from-amber-400/30 via-pink-500/25 to-purple-600/10',
          borderColor: 'border-pink-400/20',
          glowColor: 'rgba(244, 63, 94, 0.4)',
        };
      case 'excited':
        return {
          gradient: 'from-cyan-400/30 via-pink-400/30 to-purple-500/20',
          borderColor: 'border-cyan-400/30',
          glowColor: 'rgba(34, 211, 238, 0.5)',
        };
      case 'thinking':
        return {
          gradient: 'from-indigo-500/20 via-purple-600/20 to-cyan-500/10',
          borderColor: 'border-purple-500/20',
          glowColor: 'rgba(168, 85, 247, 0.3)',
        };
      case 'surprised':
        return {
          gradient: 'from-yellow-400/25 via-cyan-400/20 to-blue-500/10',
          borderColor: 'border-yellow-400/30',
          glowColor: 'rgba(250, 204, 21, 0.4)',
        };
      case 'caring':
        return {
          gradient: 'from-rose-400/30 via-pink-500/20 to-red-400/10',
          borderColor: 'border-rose-400/30',
          glowColor: 'rgba(251, 113, 133, 0.45)',
        };
      case 'confused':
        return {
          gradient: 'from-indigo-600/20 via-blue-500/10 to-teal-400/10',
          borderColor: 'border-blue-400/20',
          glowColor: 'rgba(59, 130, 246, 0.25)',
        };
      case 'sad':
        return {
          gradient: 'from-blue-900/30 via-indigo-950/20 to-slate-900/10',
          borderColor: 'border-blue-800/30',
          glowColor: 'rgba(29, 78, 216, 0.35)',
        };
      default:
        return {
          gradient: 'from-indigo-500/20 via-purple-500/15 to-cyan-500/10',
          borderColor: 'border-white/10',
          glowColor: 'rgba(99, 102, 241, 0.25)',
        };
    }
  };

  const style = getGlowStyles();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
      {/* Dynamic Background Radial/Linear Accent Glow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={emotion}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className={`absolute inset-0 bg-gradient-to-tr ${style.gradient} filter blur-xl opacity-60 mix-blend-screen`}
        />
      </AnimatePresence>

      {/* Cybernetic HUD/Aura rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className={`w-[85%] h-[85%] rounded-full border border-dashed ${style.borderColor} opacity-40`}
          style={{ boxShadow: `inset 0 0 10px ${style.glowColor}` }}
        />
        {/* Inner Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className={`absolute w-[70%] h-[70%] rounded-full border border-double ${style.borderColor} opacity-20`}
        />
      </div>

      {/* Grid Pattern Layer */}
      <div 
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(var(--accent-color) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
};
