'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Globe, ChevronDown, ShieldCheck, Eye, Zap, Smartphone, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import LoginCard from '@/components/dom/login/LoginCard';
import InteractiveStates from '@/components/dom/login/InteractiveStates';
import { CatState } from '@/components/dom/CatMascot';

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Enterprise Security',
    desc: 'Your data is 100% protected',
  },
  {
    icon: Eye,
    title: 'Privacy First',
    desc: 'We respect your privacy',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    desc: 'Optimized for speed',
  },
  {
    icon: Smartphone,
    title: 'Always With You',
    desc: 'Access from anywhere',
  },
];

export default function LoginPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [catState, setCatState] = useState<CatState>('idle');

  // ── Background Particle Canvas & GSAP Entrance ───────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
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

    const motes = Array.from({ length: 35 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      sx: (Math.random() - 0.5) * 0.2,
      sy: (Math.random() - 0.5) * 0.2 - 0.05,
      a: Math.random() * 0.35 + 0.1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      motes.forEach((p) => {
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

    // GSAP Entrance Timeline
    if (containerRef.current) {
      const ctxGsap = gsap.context(() => {
        gsap.fromTo(
          '.login-master-container',
          { opacity: 0, y: 40, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' }
        );
        gsap.fromTo(
          '.login-welcome-title',
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', delay: 0.2 }
        );
        gsap.fromTo(
          '.login-states-section',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', delay: 0.4 }
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
      className="relative min-h-screen w-full bg-[#EBE9E1] text-slate-900 flex flex-col items-center justify-between py-10 px-4 overflow-x-hidden selection:bg-emerald-600 selection:text-white"
    >
      {/* Background Particle Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Volumetric Emerald Backlight */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none z-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(15, 130, 89, 0.14) 0%, rgba(15, 130, 89, 0.03) 55%, transparent 75%)',
          filter: 'blur(50px)',
        }}
      />

      {/* ── 1. MAIN AUTHENTICATION CONTAINER (MATCHES REFERENCE 1:1) ────────── */}
      <div className="login-master-container relative z-10 w-full max-w-[1180px] min-h-[820px] rounded-[32px] bg-[#FAF9F5]/80 backdrop-blur-[32px] border border-white/90 shadow-[0_24px_60px_rgba(0,0,0,0.06),0_4px_16px_rgba(15,130,89,0.08)] p-8 md:p-12 flex flex-col justify-between overflow-hidden">
        {/* Specular glass reflection sheen */}
        <div className="bs-glass-reflection" />

        {/* Top Header Bar inside Container */}
        <div className="flex items-center justify-between z-20 mb-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-serif font-black text-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              X
            </div>
            <span className="font-sans text-base font-bold tracking-tight text-slate-900">
              CONTROL X
            </span>
          </Link>

          {/* Language Selector Pill */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>English</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* 2-Column Main Authentication Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-20 flex-1 my-4">
          
          {/* ── LEFT COLUMN: WELCOME & GLASS X VISUAL (45%) ─────────────── */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full py-4 text-left">
            <div>
              {/* Heading with green brush underline */}
              <div className="relative inline-block mb-4">
                <h1 className="login-welcome-title font-serif text-5xl md:text-6xl font-normal text-slate-900 leading-[0.98] tracking-tight">
                  Welcome <br />
                  <span className="relative inline-block">
                    back!
                    <svg
                      className="absolute left-0 -bottom-2 w-full h-3 text-emerald-600 overflow-visible"
                      viewBox="0 0 100 20"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M 5 15 Q 50 2, 95 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>
              </div>

              {/* Subtitle */}
              <p className="font-sans text-sm text-slate-600 leading-relaxed max-w-sm mt-3">
                Great to see you again. <br />
                Let&apos;s continue where you left off.
              </p>
            </div>

            {/* Glass X 3D Sculpture Visual */}
            <div className="relative w-full h-64 md:h-72 my-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-3xl" />

              {/* Refractive 3D Glass X Sculpture */}
              <div className="relative font-serif text-[180px] md:text-[210px] font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-800 drop-shadow-[0_20px_40px_rgba(15,130,89,0.35)] select-none">
                X
              </div>
            </div>

            {/* Trusted By Logos Footer */}
            <div className="pt-4 border-t border-slate-900/5">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-3">
                Trusted by creative teams worldwide
              </p>
              <div className="flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all font-sans text-xs font-bold text-slate-700">
                <span className="font-bold tracking-tight">stripe</span>
                <span className="font-semibold">N Notion</span>
                <span className="font-bold">Linear</span>
                <span className="font-bold">▲ Vercel</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: CAT MASCOT & LOGIN CARD (55%) ─────────────── */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end">
            <LoginCard catState={catState} setCatState={setCatState} />
          </div>

        </div>
      </div>

      {/* ── 2. INTERACTIVE STATES SECTION (BELOW MAIN CONTAINER) ───────────── */}
      <div className="login-states-section w-full z-10">
        <InteractiveStates activeState={catState} onSelectState={(st) => setCatState(st)} />
      </div>

      {/* ── 3. TRUST BAR (BELOW INTERACTIVE STATES) ────────────────────────── */}
      <div className="w-full max-w-[1180px] mx-auto z-10 mb-8 p-6 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {TRUST_ITEMS.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div key={idx} className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center flex-shrink-0">
                  <IconComp className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold text-slate-900">{item.title}</h4>
                  <p className="font-sans text-[11px] text-slate-500">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
