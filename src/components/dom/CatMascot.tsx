'use client';

import React from 'react';

export type CatState =
  | 'idle'
  | 'typing'
  | 'password-hidden'
  | 'password-visible'
  | 'error'
  | 'success';

/**
 * 6 clean transparent PNG mascot assets extracted from reference sheet.
 * All 6 files are normalized to a 480x360 canvas with paw baseline at Y=320
 * and zero text labels/artifacts.
 */
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

/**
 * CatMascot renders a fixed 320x240 stage with all 6 PNG assets stacked.
 * Only the active state has opacity: 1, creating a smooth 280ms CSS cross-fade.
 * Single fixed anchor point ensures paws sit precisely on the login card top edge.
 */
export default function CatMascot({ state, showDebugLabel = false }: CatMascotProps) {
  return (
    <div
      aria-label={`Control X mascot — ${state}`}
      className="relative w-[320px] h-[240px] pointer-events-none select-none overflow-visible"
    >
      {(Object.keys(CAT_ASSETS) as CatState[]).map((s) => (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          key={s}
          src={CAT_ASSETS[s]}
          alt={s === state ? `Control X cat mascot — ${s}` : ''}
          aria-hidden={s !== state}
          className={`absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_10px_16px_rgba(15,130,89,0.18)] transition-opacity duration-300 ease-out pointer-events-none ${
            s === state ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            animation: s === 'idle' && state === 'idle'
              ? 'catBreathing 3s ease-in-out infinite'
              : undefined,
          }}
        />
      ))}

      {/* Dev-only state badge */}
      {showDebugLabel && (
        <div className="absolute top-1 left-1 bg-slate-900/90 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-mono shadow border border-emerald-500/30 z-30 pointer-events-none">
          State: {state}
        </div>
      )}

      <style jsx global>{`
        @keyframes catBreathing {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-2.5px); }
        }
      `}</style>
    </div>
  );
}
