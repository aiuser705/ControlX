'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type CatState =
  | 'idle'
  | 'typing'
  | 'password-hidden'
  | 'password-visible'
  | 'error'
  | 'success';

const CAT_ASSETS: Record<CatState, string> = {
  'idle':             '/assets/cat-idle.png',
  'typing':           '/assets/cat-looking.png',
  'password-hidden':  '/assets/cat-cover-eyes.png',
  'password-visible': '/assets/cat-visible.png',
  'error':            '/assets/cat-error.png',
  'success':          '/assets/cat-success.png',
};

interface CatMascotProps {
  state: CatState;
}

export default function CatMascot({ state }: CatMascotProps) {
  const currentAsset = CAT_ASSETS[state] || CAT_ASSETS['idle'];

  return (
    <div
      aria-label={`Control X mascot — ${state}`}
      className="relative w-[250px] h-[190px] flex items-end justify-center pointer-events-none select-none"
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full flex items-end justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentAsset}
            alt={`Control X cat mascot — ${state}`}
            className="w-full h-full object-contain filter drop-shadow-[0_10px_22px_rgba(15,130,89,0.18)]"
            style={{
              // If idle state, apply gentle subtle breathing pulse
              animation: state === 'idle' ? 'catBreathing 3s ease-in-out infinite' : undefined,
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Success sparkles overlay when state is success */}
      {state === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-4 inset-x-0 flex justify-center gap-4 pointer-events-none"
        >
          <span className="animate-ping w-2 h-2 rounded-full bg-emerald-400 opacity-75" />
          <span className="animate-pulse w-3 h-3 rounded-full bg-emerald-300 opacity-80" />
        </motion.div>
      )}

      <style jsx global>{`
        @keyframes catBreathing {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
