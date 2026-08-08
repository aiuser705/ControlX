'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import LoginCard from '@/components/dom/LoginCard';

export default function LoginPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);

  // ── Particle Dust & Page Entrance GSAP ────────────────────────────
  useEffect(() => {
    // 1. Background particle dust motes
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      sx: (Math.random() - 0.5) * 0.2,
      sy: (Math.random() - 0.5) * 0.2 - 0.05,
      a: Math.random() * 0.35 + 0.1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.sx;
        p.y += p.sy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.fillStyle = `rgba(15, 130, 89, ${p.a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      animId = requestAnimationFrame(render);
    };
    render();

    // 2. Page Entrance Stagger Timeline
    if (containerRef.current) {
      const ctxGsap = gsap.context(() => {
        gsap.fromTo(
          '.login-nav',
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }
        );
        gsap.fromTo(
          '.login-hero-bg-x',
          { opacity: 0, scale: 0.85 },
          { opacity: 0.12, scale: 1, duration: 1.4, ease: 'power2.out', delay: 0.1 }
        );
        gsap.fromTo(
          '.login-footer',
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', delay: 0.5 }
        );
      }, containerRef);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
        ctxGsap.revert();
      };
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full bg-[#EBE9E1] text-slate-900 flex flex-col justify-between overflow-x-hidden selection:bg-emerald-600 selection:text-white"
    >
      {/* Background Particle Canvas */}
      <canvas ref={bgCanvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Volumetric Radial Glow Backlight */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none z-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(15, 130, 89, 0.16) 0%, rgba(15, 130, 89, 0.03) 55%, transparent 75%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Decorative Translucent Giant 3D 'X' in Background */}
      <div
        className="login-hero-bg-x fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-[42vw] font-black text-emerald-800 pointer-events-none z-0 select-none opacity-10 leading-none"
        style={{ filter: 'blur(2px)' }}
        aria-hidden="true"
      >
        X
      </div>

      {/* ── Top Header Navigation Bar ──────────────────────────────────── */}
      <header className="login-nav relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group text-slate-900">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white font-serif font-black text-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            X
          </div>
          <span className="font-sans text-lg font-bold tracking-tight">CONTROL X</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 hover:bg-white border border-white/80 text-xs font-semibold text-slate-700 hover:text-slate-900 shadow-sm backdrop-blur-md transition-all duration-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* ── Center Login Main Body ──────────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center flex-1">
        <LoginCard />
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="login-footer relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>CONTROL X Executive Portal</span>
        </div>
        <p>© 2026 CONTROL X Inc. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="#privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</Link>
          <Link href="#terms" className="hover:text-slate-800 transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
