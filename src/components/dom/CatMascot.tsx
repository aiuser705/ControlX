'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';

export type CatState = 'idle' | 'watching' | 'hidden' | 'visible' | 'error' | 'success';

interface CatMascotProps {
  state: CatState;
  className?: string;
}

const CAT_ASSETS: Record<CatState, string> = {
  idle: '/assets/cat-idle.png',
  watching: '/assets/cat-looking.png',
  hidden: '/assets/cat-cover-eyes.png',
  visible: '/assets/cat-visible.png',
  error: '/assets/cat-error.png',
  success: '/assets/cat-success.png',
};

export default function CatMascot({ state, className = '' }: CatMascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const prevPropsState = useRef<CatState>(state);

  // ── GSAP State Transitions ─────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    const img = imgRef.current;
    if (!el || !img) return;

    const ctx = gsap.context(() => {
      // Kill previous state animations
      gsap.killTweensOf([el, img]);

      if (state === 'idle') {
        gsap.to(el, {
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.4,
          ease: 'power3.out',
        });
        // Idle continuous gentle breathing
        gsap.to(img, {
          y: -4,
          duration: 2.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      } else if (state === 'watching') {
        gsap.to(el, {
          y: -2,
          rotation: -3,
          scale: 1.03,
          duration: 0.35,
          ease: 'power2.out',
        });
        gsap.to(img, {
          y: -2,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else if (state === 'hidden') {
        // Paws covering eyes anticipation
        gsap.to(el, {
          y: 4,
          rotation: 2,
          scale: 0.98,
          duration: 0.4,
          ease: 'power3.out',
        });
        gsap.to(img, {
          scale: 1.04,
          duration: 0.35,
          ease: 'power3.out',
        });
      } else if (state === 'visible') {
        // Uncover eyes curiosity
        gsap.to(el, {
          y: -6,
          rotation: -2,
          scale: 1.05,
          duration: 0.4,
          ease: 'back.out(1.7)',
        });
      } else if (state === 'error') {
        // Confused head tilt & subtle horizontal shake
        const tl = gsap.timeline();
        tl.to(el, {
          rotation: 8,
          scale: 0.97,
          duration: 0.2,
          ease: 'power2.out',
        }).to(el, {
          x: -10,
          duration: 0.08,
          repeat: 5,
          yoyo: true,
          ease: 'sine.inOut',
        }).to(el, {
          x: 0,
          duration: 0.15,
        });
      } else if (state === 'success') {
        // Happy celebratory pop
        const tl = gsap.timeline();
        tl.to(el, {
          y: -14,
          scale: 1.12,
          rotation: -4,
          duration: 0.35,
          ease: 'back.out(2)',
        }).to(el, {
          y: -8,
          scale: 1.08,
          duration: 0.3,
          ease: 'bounce.out',
        });

        // Trigger green particle burst
        triggerSuccessParticles();
      }

      // Smooth opacity crossfade on state image swap
      if (prevPropsState.current !== state) {
        gsap.fromTo(
          img,
          { opacity: 0.5, scale: 0.96 },
          { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' }
        );
        prevPropsState.current = state;
      }
    }, containerRef);

    return () => ctx.revert();
  }, [state]);

  // ── Confetti / Particle Burst on Success ──────────────────────────
  const triggerSuccessParticles = () => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 240;
    canvas.height = 200;

    const motes = Array.from({ length: 28 }, () => ({
      x: 120,
      y: 100,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.7) * 6,
      r: Math.random() * 3 + 1.5,
      alpha: 1,
      color: Math.random() > 0.4 ? '#10B981' : '#A8F0D4',
    }));

    let frameId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      motes.forEach((p) => {
        if (p.alpha <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.alpha -= 0.02;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      if (alive) {
        frameId = requestAnimationFrame(render);
      }
    };
    render();
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex flex-col items-center justify-center pointer-events-none select-none ${className}`}
      style={{ width: '160px', height: '150px' }}
      aria-label={`Control X Cat Mascot - Current State: ${state}`}
    >
      {/* Particle Canvas for Success State */}
      <canvas
        ref={particleCanvasRef}
        className="absolute inset-0 pointer-events-none z-20"
        style={{ width: '240px', height: '200px', left: '-40px', top: '-25px' }}
      />

      {/* Cat Mascot Render */}
      <div className="relative w-full h-full flex items-center justify-center">
        <Image
          ref={imgRef}
          src={CAT_ASSETS[state] || CAT_ASSETS.idle}
          alt={`Control X Cat Mascot (${state})`}
          width={160}
          height={150}
          priority
          className="object-contain filter drop-shadow(0 10px 20px rgba(15, 130, 89, 0.18)) transition-all duration-300"
        />

        {/* Floating Question Mark Badge for Error State */}
        {state === 'error' && (
          <div className="absolute -top-2 right-4 bg-emerald-600/90 text-white font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-bounce z-10">
            ?
          </div>
        )}

        {/* Floating Sparkle Badge for Success State */}
        {state === 'success' && (
          <div className="absolute -top-3 right-3 bg-emerald-500 text-white font-bold text-xs px-2 py-0.5 rounded-full shadow-lg z-10 animate-pulse">
            ✦ SUCCESS!
          </div>
        )}
      </div>
    </div>
  );
}
