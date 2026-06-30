import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { AuraBg } from './AuraBg';
import type { AiraEmotion } from './AuraBg';
import { ParticleField } from './ParticleField';

interface AiraAvatarProps {
  emotion: AiraEmotion;
  isSpeaking?: boolean;
  isThinking?: boolean;
  hairColor?: string;
  eyeColor?: string;
}

export const AiraAvatar: React.FC<AiraAvatarProps> = ({
  emotion,
  isSpeaking = false,
  isThinking = false,
  hairColor = '#a855f7', // default magenta-purple
  eyeColor = '#06b6d4',  // default bright cyan
}) => {
  const [blink, setBlink] = useState(false);

  // Mouse tracking coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring settings for organic eye movement
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const pupilX = useSpring(mouseX, springConfig);
  const pupilY = useSpring(mouseY, springConfig);

  // Periodic Blink cycle
  useEffect(() => {
    let blinkTimeout: any;
    const blinkCycle = () => {
      setBlink(true);
      blinkTimeout = setTimeout(() => {
        setBlink(false);
        // Next blink in 3-6 seconds
        const nextBlink = 3000 + Math.random() * 3000;
        blinkTimeout = setTimeout(blinkCycle, nextBlink);
      }, 150);
    };

    const initialBlink = setTimeout(blinkCycle, 4000);
    return () => {
      clearTimeout(blinkTimeout);
      clearTimeout(initialBlink);
    };
  }, []);

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Don't track if she is thinking or sleeping (e.g. eyes focus ahead or closed)
      if (isThinking) {
        mouseX.set(0);
        mouseY.set(-2); // look slightly up when thinking
        return;
      }

      const { innerWidth, innerHeight } = window;
      // Get pointer offset from screen center, normalize to range [-3.5, 3.5]
      const dx = ((event.clientX / innerWidth) - 0.5) * 7;
      const dy = ((event.clientY / innerHeight) - 0.5) * 5;
      mouseX.set(dx);
      mouseY.set(dy);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isThinking, mouseX, mouseY]);

  // SVG Drawing Helpers based on Emotion
  const getEyebrowYOffset = () => {
    switch (emotion) {
      case 'surprised': return -4;
      case 'excited': return -2;
      case 'sad': return 1;
      case 'confused': return -1;
      default: return 0;
    }
  };

  const getEyebrowRotation = (side: 'left' | 'right') => {
    const isLeft = side === 'left';
    switch (emotion) {
      case 'sad': return isLeft ? 15 : -15; // inner side raised
      case 'confused': return isLeft ? 12 : -5; // quizzical angle
      case 'thinking': return isLeft ? -10 : 8; // analytical look
      case 'excited': return isLeft ? -5 : 5;
      default: return 0;
    }
  };

  // Render hand gestures
  const renderGesture = () => {
    switch (emotion) {
      case 'happy':
      case 'excited':
        // Peace Sign Hand or waving hand floating on the side
        return (
          <motion.g
            initial={{ y: 80, x: 45, rotate: 15 }}
            animate={{ y: 0, x: 0, rotate: [0, 5, 0] }}
            transition={{ y: { type: 'spring', stiffness: 100 }, rotate: { repeat: Infinity, duration: 2.5 } }}
          >
            {/* Cute hand waving overlay */}
            <circle cx="150" cy="140" r="14" fill="#fed7aa" stroke="#c2410c" strokeWidth="1.5" />
            {/* Peace fingers */}
            <path d="M142,128 C141,120 144,116 146,126" stroke="#c2410c" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M149,126 C149,118 152,114 154,124" stroke="#c2410c" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Curled fingers */}
            <circle cx="148" cy="138" r="3" fill="#fed7aa" stroke="#c2410c" strokeWidth="1.2" />
            <circle cx="154" cy="142" r="3" fill="#fed7aa" stroke="#c2410c" strokeWidth="1.2" />
          </motion.g>
        );
      case 'thinking':
        // Hand to chin gesture
        return (
          <motion.g
            initial={{ y: 70, x: -10 }}
            animate={{ y: 0, x: 0 }}
            transition={{ type: 'spring', stiffness: 90 }}
          >
            {/* Arm sleeve */}
            <path d="M70,190 Q85,150 95,142" stroke="#6366f1" strokeWidth="8" strokeLinecap="round" fill="none" />
            {/* Hand under chin */}
            <path d="M92,143 Q96,134 94,129 C92,126 89,129 90,135" stroke="#c2410c" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="95" cy="138" r="7" fill="#fed7aa" stroke="#c2410c" strokeWidth="1.5" />
          </motion.g>
        );
      case 'surprised':
        // Hands up near cheeks
        return (
          <motion.g
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="origin-bottom"
          >
            {/* Left cheek hand */}
            <circle cx="62" cy="120" r="8" fill="#fed7aa" stroke="#c2410c" strokeWidth="1.5" />
            {/* Right cheek hand */}
            <circle cx="138" cy="120" r="8" fill="#fed7aa" stroke="#c2410c" strokeWidth="1.5" />
          </motion.g>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full aspect-square max-w-[340px] md:max-w-[380px] mx-auto z-10 select-none">
      {/* Background Aura */}
      <AuraBg emotion={emotion} />
      
      {/* Particle Effects */}
      <ParticleField emotion={emotion} />

      {/* Main Vector Avatar */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full relative z-20 drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)] filter"
      >
        <defs>
          {/* Hair Gradient */}
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={hairColor} />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
          {/* Cyber Neck Collar Accent */}
          <linearGradient id="cyberAccent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          {/* Skin Gradient */}
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff8f2" />
            <stop offset="100%" stopColor="#fed7aa" />
          </linearGradient>
        </defs>

        {/* 1. BACK HAIR (Twins / Side Lock flows) */}
        <motion.g
          animate={{
            rotate: emotion === 'excited' ? [-2, 2, -2] : [-0.5, 0.5, -0.5],
            y: emotion === 'sad' ? [0, 2, 0] : [0, -1, 0]
          }}
          transition={{ repeat: Infinity, duration: emotion === 'excited' ? 1.5 : 4, ease: 'easeInOut' }}
          className="origin-top"
        >
          {/* Left Back Hair strand */}
          <path d="M60,60 C25,80 15,130 30,170 C35,180 45,160 45,140 C45,100 55,75 60,60 Z" fill="url(#hairGrad)" />
          {/* Right Back Hair strand */}
          <path d="M140,60 C175,80 185,130 170,170 C165,180 155,160 155,140 C155,100 145,75 140,60 Z" fill="url(#hairGrad)" />
        </motion.g>

        {/* 2. BODY & COLLAR (Breathing Animation) */}
        <motion.g
          animate={{
            scaleY: [1, 1.012, 1],
            y: [0, -0.6, 0]
          }}
          transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
          className="origin-bottom"
        >
          {/* Neck */}
          <path d="M93,115 L93,142 L107,142 L107,115 Z" fill="#fed7aa" stroke="#c2410c" strokeWidth="1" />
          {/* Cyber Neck Collar / Accessories */}
          <path d="M90,132 L110,132 L114,142 L86,142 Z" fill="#1e1b4b" />
          <path d="M92,135 L108,135 L110,140 L90,140 Z" fill="url(#cyberAccent)" />

          {/* Shoulders / Cyber Jacket */}
          <path
            d="M62,142 C45,148 40,170 38,200 L162,200 C160,170 155,148 138,142 L125,150 L75,150 Z"
            fill="#1e1b4b"
            stroke="var(--glass-border)"
            strokeWidth="1"
          />
          {/* Neon Stripe Trim on Jacket */}
          <path d="M78,150 L52,190 M122,150 L148,190" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="100" cy="162" r="3" fill="#ec4899" className="animate-pulse" />
        </motion.g>

        {/* 3. HEAD & FACE BASE (Breathing & Subtle Head tilting) */}
        <motion.g
          animate={{
            y: isSpeaking ? [0, -1, 0, -0.5, 0] : [0, -1.2, 0],
            rotate: isThinking ? [0, 1.5, 0] : emotion === 'confused' ? 3 : 0,
          }}
          transition={{
            y: { repeat: Infinity, duration: isSpeaking ? 0.4 : 4.5, ease: 'easeInOut' },
            rotate: { repeat: Infinity, duration: 6, ease: 'easeInOut' }
          }}
          className="origin-bottom-center"
        >
          {/* Ears */}
          <circle cx="64" cy="98" r="8" fill="#fed7aa" stroke="#c2410c" strokeWidth="0.8" />
          <circle cx="136" cy="98" r="8" fill="#fed7aa" stroke="#c2410c" strokeWidth="0.8" />
          {/* Cyber Ear Node/Headset */}
          <rect x="54" y="93" width="7" height="12" rx="3" fill="#111827" stroke={eyeColor} strokeWidth="1" />
          <rect x="139" y="93" width="7" height="12" rx="3" fill="#111827" stroke={eyeColor} strokeWidth="1" />
          {/* Headset Arc */}
          <path d="M60,93 C60,50 140,50 140,93" fill="none" stroke="#111827" strokeWidth="3" />

          {/* Chin & Cheeks */}
          <path
            d="M66,90 C66,115 80,128 100,128 C120,128 134,115 134,90 C134,75 120,68 100,68 C80,68 66,75 66,90 Z"
            fill="url(#skinGrad)"
            stroke="#c2410c"
            strokeWidth="1.2"
          />

          {/* Blush marks (react to positive emotions) */}
          {['happy', 'excited', 'caring', 'laughing'].includes(emotion) && (
            <g opacity="0.6">
              <ellipse cx="78" cy="107" rx="7" ry="3.5" fill="#f43f5e" />
              <ellipse cx="122" cy="107" rx="7" ry="3.5" fill="#f43f5e" />
              {emotion === 'excited' && (
                <g stroke="#ffffff" strokeWidth="1" strokeLinecap="round">
                  {/* Blushing slash lines */}
                  <line x1="75" y1="105" x2="79" y2="109" />
                  <line x1="79" y1="105" x2="83" y2="109" />
                  <line x1="117" y1="105" x2="121" y2="109" />
                  <line x1="121" y1="105" x2="125" y2="109" />
                </g>
              )}
            </g>
          )}

          {/* Tears / Sad drop marks */}
          {emotion === 'sad' && (
            <motion.path
              d="M78,108 Q77,122 75,124"
              stroke="#60a5fa"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              animate={{ opacity: [0.3, 0.9, 0.3], y: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}

          {/* 4. EYEBROWS */}
          <g>
            {/* Left Eyebrow */}
            <motion.path
              d="M74,83 Q85,81 91,85"
              stroke="#3730a3"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              animate={{
                y: getEyebrowYOffset(),
                rotate: getEyebrowRotation('left')
              }}
              className="origin-center"
              style={{ transformOrigin: '83px 83px' }}
            />
            {/* Right Eyebrow */}
            <motion.path
              d="M109,85 Q115,81 126,83"
              stroke="#3730a3"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              animate={{
                y: getEyebrowYOffset(),
                rotate: getEyebrowRotation('right')
              }}
              className="origin-center"
              style={{ transformOrigin: '117px 83px' }}
            />
          </g>

          {/* 5. EYES & PUPILS */}
          <g>
            {/* Left Eye */}
            <g className="origin-center" style={{ transformOrigin: '83px 97px' }}>
              {blink ? (
                // Closed Eye Lid Path during blink
                <path d="M73,97 Q83,101 93,97" stroke="#3730a3" strokeWidth="3" strokeLinecap="round" fill="none" />
              ) : emotion === 'happy' || emotion === 'laughing' || emotion === 'caring' ? (
                // Laughing / Smiling closed eye arc
                <motion.path
                  d="M74,96 Q83,104 92,96"
                  stroke="#3730a3"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  animate={emotion === 'laughing' ? { scaleY: [0.9, 1.1, 0.9] } : {}}
                  transition={{ repeat: Infinity, duration: 0.3 }}
                />
              ) : (
                // Open Eye
                <>
                  {/* Eye Sclera (White Part) */}
                  <ellipse cx="83" cy="97" rx="10" ry="8" fill="#ffffff" stroke="#3730a3" strokeWidth="1.5" />
                  
                  {/* Movable Pupil */}
                  <g>
                    <motion.ellipse
                      cx="83"
                      cy="97"
                      rx="7.5"
                      ry="6.5"
                      fill={eyeColor}
                      style={{ x: pupilX, y: pupilY }}
                    />
                    {/* Inner Dark Iris Center */}
                    <motion.ellipse
                      cx="83"
                      cy="97"
                      rx="4"
                      ry="3.5"
                      fill="#0f172a"
                      style={{ x: pupilX, y: pupilY }}
                    />
                    {/* Light Highlights */}
                    <motion.circle
                      cx="80.5"
                      cy="94.5"
                      r="2"
                      fill="#ffffff"
                      style={{ x: pupilX, y: pupilY }}
                    />
                    <motion.circle
                      cx="85"
                      cy="99"
                      r="1"
                      fill="#ffffff"
                      style={{ x: pupilX, y: pupilY }}
                    />
                  </g>

                  {/* Eye Outline Eyelash */}
                  <path d="M72,96 Q83,89 94,96" stroke="#3730a3" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M73,93 L70,91" stroke="#3730a3" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}
            </g>

            {/* Right Eye */}
            <g className="origin-center" style={{ transformOrigin: '117px 97px' }}>
              {blink ? (
                // Closed Eye Lid Path
                <path d="M107,97 Q117,101 127,97" stroke="#3730a3" strokeWidth="3" strokeLinecap="round" fill="none" />
              ) : emotion === 'happy' || emotion === 'laughing' || emotion === 'caring' ? (
                // Smiling closed eye arc
                <motion.path
                  d="M108,96 Q117,104 126,96"
                  stroke="#3730a3"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  animate={emotion === 'laughing' ? { scaleY: [0.9, 1.1, 0.9] } : {}}
                  transition={{ repeat: Infinity, duration: 0.3 }}
                />
              ) : (
                // Open Eye
                <>
                  {/* Eye Sclera */}
                  <ellipse cx="117" cy="97" rx="10" ry="8" fill="#ffffff" stroke="#3730a3" strokeWidth="1.5" />
                  
                  {/* Movable Pupil */}
                  <g>
                    <motion.ellipse
                      cx="117"
                      cy="97"
                      rx="7.5"
                      ry="6.5"
                      fill={eyeColor}
                      style={{ x: pupilX, y: pupilY }}
                    />
                    {/* Inner Dark Iris Center */}
                    <motion.ellipse
                      cx="117"
                      cy="97"
                      rx="4"
                      ry="3.5"
                      fill="#0f172a"
                      style={{ x: pupilX, y: pupilY }}
                    />
                    {/* Light Highlights */}
                    <motion.circle
                      cx="114.5"
                      cy="94.5"
                      r="2"
                      fill="#ffffff"
                      style={{ x: pupilX, y: pupilY }}
                    />
                    <motion.circle
                      cx="119"
                      cy="99"
                      r="1"
                      fill="#ffffff"
                      style={{ x: pupilX, y: pupilY }}
                    />
                  </g>

                  {/* Eye Outline Eyelash */}
                  <path d="M106,96 Q117,89 128,96" stroke="#3730a3" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M127,93 L130,91" stroke="#3730a3" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}
            </g>
          </g>

          {/* 6. MOUTH (Changes by emotion, speaking, lip-sync) */}
          <g>
            {isSpeaking ? (
              // Lip-sync speech mouth animation
              <motion.ellipse
                cx="100"
                cy="116"
                rx={emotion === 'happy' || emotion === 'laughing' ? "5" : "3.5"}
                ry="4"
                fill="#b91c1c"
                stroke="#3730a3"
                strokeWidth="1.5"
                animate={{
                  scaleY: [0.2, 1.4, 0.4, 1.2, 0.3],
                  ry: [1.5, 5, 2, 4.5, 1.5]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.35,
                  ease: 'easeInOut'
                }}
              />
            ) : (
              // Static Emotional Mouth Paths
              <g>
                {emotion === 'happy' && (
                  // Nice open semi-circle smile
                  <path d="M94,113 Q100,124 106,113 Z" fill="#b91c1c" stroke="#3730a3" strokeWidth="1.5" />
                )}
                {emotion === 'laughing' && (
                  // Wide open laughing mouth showing tongue
                  <g>
                    <path d="M92,112 Q100,126 108,112 Z" fill="#b91c1c" stroke="#3730a3" strokeWidth="1.5" />
                    <path d="M96,119 Q100,113 104,119 Q100,125 96,119" fill="#f43f5e" />
                  </g>
                )}
                {emotion === 'excited' && (
                  // Open grin
                  <path d="M93,111 Q100,122 107,111 C102,111 98,111 93,111" fill="#b91c1c" stroke="#3730a3" strokeWidth="1.5" />
                )}
                {emotion === 'sad' && (
                  // Downward pouting arc
                  <path d="M95,119 Q100,111 105,119" stroke="#3730a3" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                )}
                {emotion === 'thinking' && (
                  // Flat analytical line
                  <path d="M96,115 L104,115" stroke="#3730a3" strokeWidth="2.5" strokeLinecap="round" />
                )}
                {emotion === 'surprised' && (
                  // Little round open 'O'
                  <ellipse cx="100" cy="116" rx="4.5" ry="5.5" fill="#b91c1c" stroke="#3730a3" strokeWidth="1.5" />
                )}
                {emotion === 'confused' && (
                  // Squiggly line
                  <path d="M95,116 Q97,113 100,116 Q102,119 105,116" stroke="#3730a3" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                )}
                {emotion === 'caring' && (
                  // Sweet small smile
                  <path d="M95,114 Q100,119 105,114" stroke="#3730a3" strokeWidth="2" strokeLinecap="round" fill="none" />
                )}
                {emotion === 'default' && (
                  // Standard gentle smile
                  <path d="M96,114 Q100,118 104,114" stroke="#3730a3" strokeWidth="2" strokeLinecap="round" fill="none" />
                )}
              </g>
            )}
          </g>

          {/* 7. FRONT HAIR / BANGS */}
          <g>
            {/* Hair bangs path covering forehead */}
            <path
              d="M66,74 C70,64 78,55 90,52 C82,60 81,72 80,78 C85,68 95,60 102,63 C96,72 96,80 97,85 C102,74 112,68 120,68 C116,78 116,84 117,90 C122,80 130,76 134,80 C135,76 136,88 134,92 C134,70 120,52 100,52 C80,52 66,70 66,92 Z"
              fill="url(#hairGrad)"
            />
            {/* Floating side hair strands framing cheeks */}
            <path d="M66,90 C63,105 65,120 70,132 C72,136 68,136 67,130 C63,115 62,100 66,90 Z" fill="url(#hairGrad)" />
            <path d="M134,90 C137,105 135,120 130,132 C128,136 132,136 133,130 C137,115 138,100 134,90 Z" fill="url(#hairGrad)" />
          </g>
        </motion.g>

        {/* 8. FOREGROUND GESTURES (Hand triggers overlay) */}
        {renderGesture()}
      </svg>
    </div>
  );
};
