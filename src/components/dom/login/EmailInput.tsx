'use client';

import React from 'react';
import { Mail, Check } from 'lucide-react';

interface EmailInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  error?: boolean;
}

export default function EmailInput({
  value,
  onChange,
  onFocus,
  onBlur,
  error = false,
}: EmailInputProps) {
  const isValid = /\S+@\S+\.\S+/.test(value.trim());

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor="login-email"
        className="text-xs font-semibold uppercase tracking-wider text-slate-600 select-none"
      >
        Email address
      </label>
      <div className="relative flex items-center w-full">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none transition-colors group-focus-within:text-[#0F8259]">
          <Mail size={18} strokeWidth={1.8} />
        </div>
        <input
          id="login-email"
          type="email"
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="name@company.com"
          autoComplete="email"
          className={`
            w-full pl-10 pr-10 py-3 text-sm font-medium text-slate-900 bg-white/80 
            border rounded-xl outline-none transition-all duration-200
            placeholder:text-slate-400 placeholder:font-normal
            ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                : 'border-slate-200/80 focus:border-[#0F8259] focus:bg-white focus:ring-4 focus:ring-[#0F8259]/10'
            }
          `}
        />
        {isValid && (
          <div className="absolute right-3.5 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-[#0F8259] animate-in fade-in zoom-in duration-200">
            <Check size={12} strokeWidth={3} />
          </div>
        )}
      </div>
    </div>
  );
}
