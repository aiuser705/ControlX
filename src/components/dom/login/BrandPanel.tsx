'use client';

import React from 'react';
import Link from 'next/link';
import GlassX from '@/components/dom/GlassX';

export default function BrandPanel() {
  return (
    <div className="relative flex flex-col justify-between w-full h-full min-h-[440px] lg:min-h-[540px] p-8 sm:p-10 lg:p-12 overflow-hidden rounded-[24px] bg-gradient-to-br from-white/40 via-emerald-50/20 to-white/30 backdrop-blur-md border border-white/60">
      {/* Background Soft Atmospheric Ambient Orbs */}
      <div className="absolute top-1/4 -left-12 w-64 h-64 bg-emerald-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-72 h-72 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Branding & Typography */}
      <div className="relative z-10 flex flex-col gap-6">
        {/* CONTROL X Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0F8259] text-white font-serif font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
            X
          </span>
          <span className="font-sans font-bold tracking-wider text-sm text-slate-900">
            CONTROL X
          </span>
        </Link>

        {/* Headline & Subtitle */}
        <div className="flex flex-col gap-2 mt-4">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-slate-900 leading-[1.1]">
            Welcome <br className="hidden sm:inline" />
            back!
          </h1>
          <p className="font-sans text-sm sm:text-base text-slate-600 max-w-md font-normal leading-relaxed">
            Great to see you again. Let&apos;s continue where you left off.
          </p>
        </div>
      </div>

      {/* Bottom Area — Canonical WebGL Glass 3D X Experience */}
      <div className="relative z-10 w-full h-[240px] sm:h-[280px] lg:h-[320px] mt-6 flex items-center justify-center">
        <GlassX className="w-full h-full max-w-[420px]" />
      </div>
    </div>
  );
}
