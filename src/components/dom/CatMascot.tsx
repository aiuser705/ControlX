'use client';

import React from 'react';

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
  showDebugLabel?: boolean;
}

export default function CatMascot({ state, showDebugLabel = false }: CatMascotProps) {
  const currentAsset = CAT_ASSETS[state] || CAT_ASSETS['idle'];

  return (
    <div
      aria-label={`Control X mascot — ${state}`}
      className="relative w-[320px] h-[240px] flex items-end justify-center pointer-events-none select-none overflow-visible"
    >
      {/*
        EXACTLY ONE IMAGE ELEMENT AT ALL TIMES.
        Zero AnimatePresence / zero dual mounting to guarantee NO double cat, NO ghost paws, NO extra layers.
        All 6 PNG assets share the exact same normalized 480x360 canvas & paw baseline (Y=320),
        so swapping src updates expression in the exact same physical slot.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={state}
        src={currentAsset}
        alt={`Control X cat mascot — ${state}`}
        className="w-full h-full object-contain filter drop-shadow-[0_8px_20px_rgba(15,130,89,0.15)]"
        style={{
          animation: state === 'idle'
            ? 'catBreathing 3s ease-in-out infinite'
            : 'catStateSwap 0.22s ease-out forwards',
        }}
      />

      {/* Temporary Debug Indicator */}
      {showDebugLabel && (
        <div className="absolute top-1 left-1 bg-slate-900/90 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-mono shadow border border-emerald-500/30 z-30 pointer-events-none">
          State: {state}
        </div>
      )}

      <style jsx global>{`
        @keyframes catStateSwap {
          0% {
            opacity: 0.88;
            transform: translateY(2px);
          }
          100% {
            opacity: 1;
            transform: translateY(0px);
          }
        }
        @keyframes catBreathing {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-2.5px);
          }
        }
      `}</style>
    </div>
  );
}
