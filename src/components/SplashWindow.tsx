import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo.tsx';

interface SplashProps {
  onComplete: () => void;
}

export default function SplashWindow({ onComplete }: SplashProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 0: Show Logo (0s - 1.8s)
    // Stage 1: Fade logo, show "Ready" (1.8s - 2.5s)
    // Stage 2: Exit completely (2.5s)
    const t1 = setTimeout(() => setStage(1), 1600);
    const t2 = setTimeout(() => onComplete(), 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div
            key="logo-stage"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-4"
          >
            <Logo size="lg" showTagline={true} />
            <div className="pt-4 flex items-center justify-center gap-4 text-[10px] font-mono text-neutral-500 tracking-[0.2em]">
              <span>SCBD.JKT</span>
              <span>•</span>
              <span>EST. 2026</span>
              <span>•</span>
              <span>SYS ONLINE</span>
            </div>
          </motion.div>
        )}

        {stage === 1 && (
          <motion.div
            key="tagline-stage"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <span className="text-xs font-mono tracking-[0.8em] text-white uppercase block">
              ENTER ATELIER
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative futuristic laser line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neutral-400 to-transparent origin-center"
      ></motion.div>
    </div>
  );
}
