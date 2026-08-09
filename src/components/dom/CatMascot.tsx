'use client';

import React, { useState, useEffect, useRef } from 'react';

// ── State Type ─────────────────────────────────────────────────────────────
// 6 discrete states. Only one is ever active.
export type CatState =
  | 'idle'          // initial: calm, paws resting, subtle breathing
  | 'typing'        // password field focused / typing: curious/attentive
  | 'password-hidden'  // password masked: covers eyes
  | 'password-visible' // password revealed: peeks / winking
  | 'error'         // wrong credentials: confused/sad
  | 'success';      // login success: happy/celebrating

// ── Asset Map ──────────────────────────────────────────────────────────────
// Maps each state to its extracted transparent PNG (public/assets/)
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

// ── Particle system for success celebration ────────────────────────────────
function SuccessParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width = 320;
    const H = canvas.height = 260;

    const particles = Array.from({ length: 12 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 60,
      y: H / 2,
      vx: (Math.random() - 0.5) * 5,
      vy: -(Math.random() * 4 + 2),
      radius: Math.random() * 3 + 2,
      alpha: 1,
      color: Math.random() > 0.5 ? '#10B981' : '#6EE7B7',
    }));

    let frame: number;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      particles.forEach((p) => {
        if (p.alpha <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.alpha -= 0.018;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      if (alive) frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute pointer-events-none"
      style={{
        width: 320,
        height: 260,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -65%)',
        zIndex: 30,
      }}
    />
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function CatMascot({ state }: CatMascotProps) {
  // Keep two slots: current (fully visible) and outgoing (fading out)
  const [displayed, setDisplayed] = useState<CatState>(state);
  const [outgoing, setOutgoing] = useState<CatState | null>(null);
  const [outgoingOpacity, setOutgoingOpacity] = useState(1);

  // Idle breathing: tiny translateY oscillation
  const [breathY, setBreathY] = useState(0);
  const breathRef = useRef<number | null>(null);

  // ── Cross-fade on state change ─────────────────────────────────────
  useEffect(() => {
    if (state === displayed) return;

    // Start outgoing fade
    setOutgoing(displayed);
    setOutgoingOpacity(1);

    // After a single frame, begin fade-out of outgoing
    const fadeId = requestAnimationFrame(() => {
      setOutgoingOpacity(0);
    });

    // Swap to new state
    setDisplayed(state);

    // Clear outgoing after transition
    const clearId = setTimeout(() => setOutgoing(null), 400);

    return () => {
      cancelAnimationFrame(fadeId);
      clearTimeout(clearId);
    };
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Idle breathing animation ───────────────────────────────────────
  useEffect(() => {
    if (state !== 'idle') {
      setBreathY(0);
      return;
    }

    let t = 0;
    const step = () => {
      t += 0.02;
      // sine wave: -3px to 0px
      setBreathY(Math.sin(t) * -2);
      breathRef.current = requestAnimationFrame(step);
    };
    breathRef.current = requestAnimationFrame(step);

    return () => {
      if (breathRef.current) cancelAnimationFrame(breathRef.current);
    };
  }, [state]);

  const imgStyle: React.CSSProperties = {
    transform: `translateY(${breathY}px)`,
    transition: state !== 'idle' ? 'transform 0.3s ease' : undefined,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  };

  return (
    <div
      aria-label={`Cat mascot — ${state}`}
      style={{
        position: 'relative',
        width: 200,
        height: 170,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      {/* Outgoing image (fades out) */}
      {outgoing && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`out-${outgoing}`}
          src={CAT_ASSETS[outgoing]}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: outgoingOpacity,
            transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      {/* Active/incoming image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={`in-${displayed}`}
        src={CAT_ASSETS[displayed]}
        alt={`Control X mascot — ${displayed}`}
        style={{
          ...imgStyle,
          position: 'absolute',
          inset: 0,
          opacity: outgoing ? 0 : 1,
          // Fade in + slight scale up
          animation: outgoing
            ? 'catFadeIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards'
            : undefined,
          pointerEvents: 'none',
          zIndex: 2,
          filter: 'drop-shadow(0 8px 20px rgba(15, 130, 89, 0.15))',
        }}
      />

      {/* Success particles rendered on top */}
      {state === 'success' && <SuccessParticles />}

      {/* Keyframe injection */}
      <style>{`
        @keyframes catFadeIn {
          from { opacity: 0; transform: translateY(4px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0px)   scale(1);    }
        }
      `}</style>
    </div>
  );
}
