'use client';

import React from 'react';
import Image from 'next/image';
import { CatState } from '../CatMascot';

interface InteractiveStatesProps {
  activeState: CatState;
  onSelectState: (state: CatState) => void;
}

const STATE_CARDS: {
  id: CatState;
  num: string;
  title: string;
  sub: string;
  asset: string;
  previewInputType: string;
  previewVal: string;
  isErrorInput?: boolean;
  isSuccessInput?: boolean;
}[] = [
  {
    id: 'idle',
    num: '1',
    title: 'Idle State',
    sub: 'Ready and relaxed',
    asset: '/assets/cat-idle.png',
    previewInputType: 'password',
    previewVal: '••••••••',
  },
  {
    id: 'watching',
    num: '2',
    title: 'Typing Password',
    sub: 'Curious and watching',
    asset: '/assets/cat-looking.png',
    previewInputType: 'password',
    previewVal: '•••••',
  },
  {
    id: 'hidden',
    num: '3',
    title: 'Password Hidden',
    sub: 'Respecting your privacy',
    asset: '/assets/cat-cover-eyes.png',
    previewInputType: 'password',
    previewVal: '••••••••',
  },
  {
    id: 'visible',
    num: '4',
    title: 'Password Visible',
    sub: 'Taking a peek',
    asset: '/assets/cat-visible.png',
    previewInputType: 'text',
    previewVal: '••••••••',
  },
  {
    id: 'error',
    num: '5',
    title: 'Wrong Password',
    sub: 'Oops! Try again',
    asset: '/assets/cat-error.png',
    previewInputType: 'text',
    previewVal: '••••••',
    isErrorInput: true,
  },
  {
    id: 'success',
    num: '6',
    title: 'Login Successful',
    sub: "Yay! Let's go",
    asset: '/assets/cat-success.png',
    previewInputType: 'text',
    previewVal: 'Welcome back!',
    isSuccessInput: true,
  },
];

export default function InteractiveStates({ activeState, onSelectState }: InteractiveStatesProps) {
  return (
    <div className="w-full max-w-[1180px] mx-auto mt-16 mb-12">
      {/* Centered Section Header */}
      <div className="flex items-center justify-center gap-3 mb-8 text-center">
        <div className="h-[1px] w-12 bg-slate-300" />
        <span className="font-sans text-xs font-bold tracking-wider text-slate-500 uppercase flex items-center gap-2">
          <span>🐾</span> Interactive States
        </span>
        <div className="h-[1px] w-12 bg-slate-300" />
      </div>

      {/* 6 Horizontal Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {STATE_CARDS.map((card) => {
          const isActive = activeState === card.id;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onSelectState(card.id)}
              className={`group relative flex flex-col items-center p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border transition-all duration-300 text-left cursor-pointer overflow-hidden ${
                isActive
                  ? 'border-emerald-600 shadow-lg shadow-emerald-600/15 ring-2 ring-emerald-600/20 translate-y-[-4px]'
                  : 'border-white/80 hover:border-emerald-500/40 hover:shadow-md hover:translate-y-[-2px]'
              }`}
            >
              {/* Card Label */}
              <div className="w-full text-center mb-2">
                <span className="block font-sans text-xs font-bold text-slate-900">
                  {card.num}. {card.title}
                </span>
                <span className="block font-sans text-[10.5px] text-slate-500">
                  {card.sub}
                </span>
              </div>

              {/* Mini Cat & Input Preview Container */}
              <div className="relative w-full h-36 flex flex-col items-center justify-end rounded-xl bg-slate-50/80 border border-slate-200/60 p-2 overflow-hidden">
                {/* Cat Image */}
                <div className="relative w-28 h-24 -mb-2 z-10">
                  <Image
                    src={card.asset}
                    alt={card.title}
                    fill
                    className="object-contain filter drop-shadow(0 4px 8px rgba(0,0,0,0.06)) transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Mini Input Box Mockup */}
                <div
                  className={`w-full py-1.5 px-3 rounded-lg border text-[11px] font-mono flex items-center justify-between z-20 ${
                    card.isErrorInput
                      ? 'bg-rose-50 border-rose-300 text-rose-600'
                      : card.isSuccessInput
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="truncate">{card.previewVal}</span>
                  <span className="text-[10px] opacity-60">
                    {card.isErrorInput ? '🚫' : card.isSuccessInput ? '✓' : '👁'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
