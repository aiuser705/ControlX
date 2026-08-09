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

interface CharacterStageProps {
  state: CatState;
}

const CAT_ASSETS: Record<CatState, { src: string; alt: string }> = {
  idle: {
    src: '/assets/cat-idle.png',
    alt: 'CONTROL X Cat - Relaxed Idle',
  },
  typing: {
    src: '/assets/cat-looking.png',
    alt: 'CONTROL X Cat - Watching Password Input',
  },
  'password-hidden': {
    src: '/assets/cat-cover-eyes.png',
    alt: 'CONTROL X Cat - Covering Eyes',
  },
  'password-visible': {
    src: '/assets/cat-visible.png',
    alt: 'CONTROL X Cat - Peeking at Visible Password',
  },
  error: {
    src: '/assets/cat-error.png',
    alt: 'CONTROL X Cat - Disappointed Error State',
  },
  success: {
    src: '/assets/cat-success.png',
    alt: 'CONTROL X Cat - Celebrating Success',
  },
};

export default function CharacterStage({ state }: CharacterStageProps) {
  const currentAsset = CAT_ASSETS[state] || CAT_ASSETS.idle;

  // Variants for state transitions
  const catVariants = {
    idle: {
      y: [0, -4, 0],
      scale: 1,
      rotate: 0,
      transition: {
        y: {
          duration: 4,
          repeat: Infinity,
          repeatType: 'mirror' as const,
          ease: 'easeInOut',
        },
        duration: 0.35,
        ease: 'easeOut',
      },
    },
    typing: {
      y: -2,
      scale: 1.02,
      rotate: -1.5,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    'password-hidden': {
      y: -1,
      scale: 1.01,
      rotate: 0,
      transition: { duration: 0.35, ease: 'easeOut' },
    },
    'password-visible': {
      y: -3,
      scale: 1.03,
      rotate: 1.5,
      transition: { duration: 0.35, ease: 'easeOut' },
    },
    error: {
      x: [0, -8, 8, -6, 6, -3, 3, 0],
      y: 2,
      scale: 0.98,
      rotate: 0,
      transition: {
        x: { duration: 0.45, ease: 'easeInOut' },
        duration: 0.3,
      },
    },
    success: {
      y: [0, -10, -2],
      scale: [1, 1.06, 1.04],
      rotate: [0, -2, 0],
      transition: {
        y: { duration: 0.6, ease: 'easeOut' },
        scale: { duration: 0.4 },
        duration: 0.4,
      },
    },
  };

  return (
    <div className="relative flex flex-col items-center justify-end w-full h-32 sm:h-36 -mb-6 z-20 pointer-events-none select-none overflow-visible">
      {/* Background Soft Emerald Glow for Success State */}
      <AnimatePresence>
        {state === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none -z-10"
          />
        )}
      </AnimatePresence>

      {/* Floating Confetti Particles for Success */}
      {state === 'success' && (
        <div className="absolute -top-6 inset-x-0 flex justify-center gap-6 pointer-events-none z-30">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0, scale: 0.5, rotate: 0 }}
              animate={{
                y: [-10, -40 - i * 8],
                x: [(i - 2.5) * 15, (i - 2.5) * 25],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.8],
                rotate: [0, i % 2 === 0 ? 180 : -180],
              }}
              transition={{ duration: 1.2, delay: i * 0.08, ease: 'easeOut' }}
              className={`w-2.5 h-2.5 rounded-sm ${
                i % 3 === 0
                  ? 'bg-[#0F8259]'
                  : i % 3 === 1
                  ? 'bg-amber-400'
                  : 'bg-emerald-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* Character Image Container */}
      <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-end justify-center">
        <AnimatePresence mode="wait">
          <motion.img
            key={state}
            src={currentAsset.src}
            alt={currentAsset.alt}
            variants={catVariants}
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={state}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-contain filter drop-shadow-md"
            style={{
              maxHeight: '100%',
              transformOrigin: 'bottom center',
            }}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
