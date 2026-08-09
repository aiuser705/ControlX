'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';

export type CatState = 'idle' | 'watching' | 'hidden' | 'visible' | 'error' | 'success';

interface CatMascotProps {
  state: CatState;
  className?: string;
}

const EXACT_CAT_ASSETS: Record<CatState, string> = {
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
          duration: 0.35,
          ease: 'power3.out',
        });
        // Gentle breathing motion
        gsap.to(img, {
          y: -3,
          duration: 2.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      } else if (state === 'watching') {
        gsap.to(el, {
          y: 1,
          rotation: -2,
          scale: 1.02,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else if (state === 'hidden') {
        gsap.to(el, {
          y: 3,
          rotation: 1,
          scale: 0.98,
          duration: 0.35,
          ease: 'power3.out',
        });
      } else if (state === 'visible') {
        gsap.to(el, {
          y: -4,
          rotation: -1,
          scale: 1.04,
          duration: 0.35,
          ease: 'back.out(1.6)',
        });
      } else if (state === 'error') {
        // Confused head tilt & card shake reaction
        gsap.to(el, {
          rotation: 6,
          scale: 0.97,
          duration: 0.2,
          ease: 'power2.out',
        });
        gsap.to(el, {
          x: -8,
          duration: 0.08,
          repeat: 5,
          yoyo: true,
          ease: 'sine.inOut',
          onComplete: () => {
            gsap.set(el, { x: 0 });
          },
        });
      } else if (state === 'success') {
        // Happy celebration pop
        gsap.to(el, {
          y: -10,
          scale: 1.1,
          rotation: -3,
          duration: 0.35,
          ease: 'back.out(2)',
        });
        triggerSuccessParticles();
      }

      // Smooth opacity & scale cross-fade transition between state assets
      if (prevPropsState.current !== state) {
        gsap.fromTo(
          img,
          { opacity: 0.4, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.32, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' }
        );
        prevPropsState.current = state;
      }
    }, containerRef);

    return () => ctx.revert();
  }, [state]);

  // ── Confetti Burst on Success ─────────────────────────────────────
  const triggerSuccessParticles = () => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 280;
    canvas.height = 220;

    const motes = Array.from({ length: 32 }, () => ({
      x: 140,
      y: 110,
      vx: (Math.random() - 0.5) * 7,
      vy: (Math.random() - 0.7) * 7,
      r: Math.random() * 3.5 + 1.5,
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
        p.vy += 0.16; // gravity
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
      className={`relative inline-flex flex-col items-center justify-center pointer-events-none select-none z-10 ${className}`}
      style={{ width: '220px', height: '180px' }}
      aria-label={`Control X Cat Mascot (${state})`}
    >
      {/* Particle Canvas for Success State */}
      <canvas
        ref={particleCanvasRef}
        className="absolute inset-0 pointer-events-none z-30"
        style={{ width: '280px', height: '220px', left: '-30px', top: '-20px' }}
      />

      {/* Cat Mascot Image Asset */}
      <div className="relative w-full h-full flex items-center justify-center">
        <Image
          ref={imgRef}
          src={EXACT_CAT_ASSETS[state] || EXACT_CAT_ASSETS.idle}
          alt={`Control X Cat Mascot (${state})`}
          width={220}
          height={180}
          priority
          className="object-contain filter drop-shadow(0 12px 24px rgba(15, 130, 89, 0.16))"
        />

        {/* Confused Question Mark Badge for Error State */}
        {state === 'error' && (
          <div className="absolute top-2 right-4 bg-emerald-600/90 text-white font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-bounce z-30">
            ?
          </div>
        )}
      </div>
    </div>
  );
}
