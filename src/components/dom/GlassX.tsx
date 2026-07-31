'use client';

import { useEffect, useRef } from 'react';

/**
 * GlassX — the 3D emerald glass "X" letterform that sits at the
 * centre of the hero. Built with pure CSS + SVG so it renders
 * pixel-perfectly at any DPR without a Three.js canvas.
 *
 * Slow continuous rotation on Y-axis with a subtle bob on Y.
 * Parallax responds to the mouse via a CSS custom property
 * set by the HeroSection parent.
 */
export default function GlassX() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf: number;
    let t = 0;

    const tick = () => {
      t += 0.008;
      const rotY  = t * 18;          // degrees — slow Y rotation
      const rotX  = Math.sin(t) * 4; // gentle X tilt
      const bob   = Math.sin(t * 0.7) * 6; // px vertical bob
      el.style.transform =
        `translateY(${bob}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="glass-x-scene" aria-hidden="true">
      <div ref={ref} className="glass-x-wrapper">
        <svg
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="glass-x-svg"
          aria-hidden="true"
        >
          <defs>
            {/* Emerald green glass gradient — lit from upper-left */}
            <linearGradient id="gx-face-main" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#5DD9A4" stopOpacity="0.95"/>
              <stop offset="40%"  stopColor="#0F8259" stopOpacity="0.90"/>
              <stop offset="100%" stopColor="#064D33" stopOpacity="1"/>
            </linearGradient>
            <linearGradient id="gx-bevel-light" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"  stopColor="#A8F0D4" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#0F8259" stopOpacity="0.3"/>
            </linearGradient>
            <linearGradient id="gx-bevel-dark" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"  stopColor="#042E1E" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#0F8259" stopOpacity="0.2"/>
            </linearGradient>
            <linearGradient id="gx-specular" x1="20%" y1="5%" x2="60%" y2="50%">
              <stop offset="0%"  stopColor="#FFFFFF" stopOpacity="0.55"/>
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
            </linearGradient>
            <filter id="gx-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0F8259" floodOpacity="0.35"/>
            </filter>
            <filter id="gx-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Drop shadow beneath the X */}
          <ellipse cx="120" cy="228" rx="58" ry="8" fill="#0F8259" opacity="0.18"/>

          {/* ── Main X body — two crossing bevelled bars ── */}
          {/* Left-to-right diagonal bar */}
          <g filter="url(#gx-shadow)">
            <polygon
              points="30,20 80,20 210,210 160,210"
              fill="url(#gx-face-main)"
            />
            {/* Left bevel */}
            <polygon
              points="30,20 50,40 180,230 160,210"
              fill="url(#gx-bevel-dark)"
              opacity="0.6"
            />
            {/* Top bevel */}
            <polygon
              points="30,20 80,20 96,36 46,36"
              fill="url(#gx-bevel-light)"
              opacity="0.7"
            />
          </g>

          {/* Right-to-left diagonal bar */}
          <g filter="url(#gx-shadow)">
            <polygon
              points="160,20 210,20 80,210 30,210"
              fill="url(#gx-face-main)"
            />
            {/* Right bevel */}
            <polygon
              points="210,20 190,40 60,230 80,210"
              fill="url(#gx-bevel-dark)"
              opacity="0.6"
            />
            {/* Top bevel */}
            <polygon
              points="160,20 210,20 194,36 144,36"
              fill="url(#gx-bevel-light)"
              opacity="0.7"
            />
          </g>

          {/* Specular highlight — catches the key light */}
          <polygon
            points="40,20 80,20 130,80 100,80"
            fill="url(#gx-specular)"
          />
          <polygon
            points="160,20 200,20 155,75 125,75"
            fill="url(#gx-specular)"
            opacity="0.7"
          />

          {/* Inner intersection recess — darker centre */}
          <polygon
            points="100,100 120,80 140,100 120,120"
            fill="#042E1E"
            opacity="0.55"
          />

          {/* Rim light on bottom edges */}
          <polygon
            points="50,210 80,210 120,165 90,165"
            fill="#5DD9A4"
            opacity="0.25"
          />
          <polygon
            points="160,210 190,210 152,167 122,167"
            fill="#5DD9A4"
            opacity="0.25"
          />
        </svg>

        {/* Ground reflection */}
        <div className="glass-x-reflection" aria-hidden="true"/>
      </div>
    </div>
  );
}
