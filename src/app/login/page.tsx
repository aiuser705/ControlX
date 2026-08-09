'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Globe, ChevronDown, ShieldCheck, Eye, Zap, Smartphone } from 'lucide-react';
import { gsap } from 'gsap';
import LoginCard from '@/components/dom/login/LoginCard';

// ── Trust Bar items ────────────────────────────────────────────────────────
const TRUST_ITEMS = [
  { Icon: ShieldCheck, title: 'Enterprise Security', desc: 'Your data is 100% protected' },
  { Icon: Eye,         title: 'Privacy First',       desc: 'We respect your privacy'    },
  { Icon: Zap,         title: 'Lightning Fast',      desc: 'Optimized for speed'         },
  { Icon: Smartphone,  title: 'Always With You',     desc: 'Access from anywhere'        },
];

export default function LoginPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Subtle ambient particle background ────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const motes = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18 - 0.04,
      a: Math.random() * 0.28 + 0.08,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      motes.forEach((p) => {
        p.x = (p.x + p.vx + canvas.width)  % canvas.width;
        p.y = (p.y + p.vy + canvas.height) % canvas.height;
        ctx.globalAlpha = p.a;
        ctx.fillStyle = '#0F8259';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // ── Page entrance GSAP stagger ─────────────────────────────────────────
  useEffect(() => {
    if (!pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.lp-main-container',
        { opacity: 0, y: 36, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'expo.out' }
      );
      gsap.fromTo(
        '.lp-welcome-title',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', delay: 0.25 }
      );
      gsap.fromTo(
        '.lp-trust-bar',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', delay: 0.45 }
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen w-full bg-[#EBE9E1] flex flex-col items-center justify-center gap-6 py-10 px-4 overflow-x-hidden selection:bg-emerald-600 selection:text-white"
    >
      {/* Ambient particle canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" aria-hidden="true" />

      {/* Soft emerald centre glow */}
      <div
        aria-hidden="true"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[760px] pointer-events-none z-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(15,130,89,0.13) 0%, rgba(15,130,89,0.02) 55%, transparent 72%)',
          filter: 'blur(48px)',
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
          MAIN TWO-COLUMN AUTHENTICATION CONTAINER
          Matches: login ref — large rounded glass card, two columns
      ═══════════════════════════════════════════════════════════════ */}
      <div
        className="lp-main-container relative z-10 w-full max-w-[1180px] rounded-[32px] overflow-hidden"
        style={{
          background: 'rgba(250,249,245,0.82)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.92)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.06), 0 4px 18px rgba(15,130,89,0.07)',
        }}
      >
        {/* Specular glass sheen overlay */}
        <div className="bs-glass-reflection" aria-hidden="true" />

        {/* ── Top Header row (inside container) ────────────────────── */}
        <div className="flex items-center justify-between px-8 md:px-12 pt-8 md:pt-10">
          {/* CONTROL X Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="Control X home">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-serif font-black text-lg flex items-center justify-center shadow group-hover:scale-105 transition-transform">
              X
            </div>
            <span className="font-sans text-[15px] font-bold tracking-tight text-slate-900">
              CONTROL X
            </span>
          </Link>

          {/* Language Selector */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-white border border-slate-200/70 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>English</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* ── Two-column body ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-8 md:px-12 py-8 md:py-10">

          {/* ── LEFT: Welcome section + Glass X visual (5/12 cols) ── */}
          <div className="lg:col-span-5 flex flex-col justify-between min-h-[580px] py-2">

            {/* Welcome heading */}
            <div>
              <h1 className="lp-welcome-title font-serif text-[58px] md:text-[68px] font-normal leading-[0.97] tracking-tight text-slate-900 mb-5">
                Welcome<br />
                <span className="relative inline-block">
                  back!
                  {/* Emerald brush-stroke underline */}
                  <svg
                    aria-hidden="true"
                    className="absolute left-0 w-full overflow-visible"
                    style={{ bottom: '-6px', height: '14px' }}
                    viewBox="0 0 120 14"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M4 10 Q30 3 60 8 Q90 12 116 6"
                      fill="none"
                      stroke="#0F8259"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </h1>
              <p className="font-sans text-[14px] text-slate-500 leading-relaxed max-w-[300px]">
                Great to see you again.<br />
                Let&apos;s continue where you left off.
              </p>
            </div>

            {/* Glass X sculpture */}
            <div className="relative flex items-center justify-start my-6 h-[220px] md:h-[260px]">
              {/* Soft glow behind X */}
              <div
                aria-hidden="true"
                className="absolute w-56 h-56 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(15,130,89,0.18) 0%, transparent 70%)',
                  filter: 'blur(28px)',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%,-50%)',
                }}
              />
              <div
                aria-hidden="true"
                className="relative select-none font-serif font-black leading-none"
                style={{
                  fontSize: 200,
                  background: 'linear-gradient(135deg, rgba(15,130,89,0.75) 0%, rgba(16,185,129,0.55) 40%, rgba(15,130,89,0.3) 70%, rgba(6,95,70,0.6) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 18px 36px rgba(15,130,89,0.28)) drop-shadow(0 2px 4px rgba(255,255,255,0.6))',
                  letterSpacing: '-0.02em',
                }}
              >
                X
              </div>
            </div>

            {/* Trusted by logos */}
            <div className="pt-5 border-t border-slate-900/[0.06]">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-3">
                Trusted by creative teams worldwide
              </p>
              <div className="flex items-center gap-5 grayscale opacity-50 hover:opacity-70 hover:grayscale-0 transition-all font-sans text-[12px] font-bold text-slate-700">
                <span className="tracking-tight">stripe</span>
                <span>N Notion</span>
                <span>Linear</span>
                <span>▲ Vercel</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Cat + Login Card (7/12 cols) ─────────────────
              LoginCard internally manages:
              - catState machine
              - CatMascot positioned above card
          ──────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 flex items-center justify-center lg:justify-end">
            <LoginCard />
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          TRUST BAR — below main container
      ═══════════════════════════════════════════════════════════════ */}
      <div
        className="lp-trust-bar relative z-10 w-full max-w-[1180px] p-6 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.62)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.82)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {TRUST_ITEMS.map(({ Icon, title, desc }, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-900">{title}</p>
                <p className="text-[11px] text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
