'use client';

import React from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isVisible: boolean;
  onToggleVisible: () => void;
  error?: boolean;
}

export default function PasswordInput({
  value,
  onChange,
  onFocus,
  onBlur,
  isVisible,
  onToggleVisible,
  error = false,
}: PasswordInputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor="login-password"
        className="text-xs font-semibold uppercase tracking-wider text-slate-600 select-none"
      >
        Password
      </label>
      <div className="relative flex items-center w-full">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none transition-colors">
          <Lock size={18} strokeWidth={1.8} />
        </div>
        <input
          id="login-password"
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="••••••••••••"
          autoComplete="current-password"
          className={`
            w-full pl-10 pr-11 py-3 text-sm font-medium text-slate-900 bg-white/80 
            border rounded-xl outline-none transition-all duration-200
            placeholder:text-slate-400 placeholder:font-normal tracking-wide
            ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                : 'border-slate-200/80 focus:border-[#0F8259] focus:bg-white focus:ring-4 focus:ring-[#0F8259]/10'
            }
          `}
        />
        <button
          type="button"
          onClick={onToggleVisible}
          tabIndex={0}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-700 transition-colors rounded-lg focus:outline-none focus:bg-slate-100"
        >
          {isVisible ? (
            <EyeOff size={18} strokeWidth={1.8} />
          ) : (
            <Eye size={18} strokeWidth={1.8} />
          )}
        </button>
      </div>
    </div>
  );
}
