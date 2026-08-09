'use client';

import React from 'react';
import { ShieldCheck, Lock, Zap, Globe } from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Enterprise Security',
    desc: 'Your data is 100% protected',
  },
  {
    icon: Lock,
    title: 'Privacy First',
    desc: 'We respect your privacy',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    desc: 'Optimized for speed',
  },
  {
    icon: Globe,
    title: 'Always With You',
    desc: 'Access from anywhere',
  },
];

export default function TrustBar() {
  return (
    <div className="w-full border-t border-slate-200/60 bg-white/40 backdrop-blur-md py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {TRUST_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3.5 p-2 rounded-xl"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-[#0F8259] shrink-0 border border-emerald-100/80">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 tracking-tight">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {item.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
