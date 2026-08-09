'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { gsap } from 'gsap';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check, AlertCircle, CheckCircle2 } from 'lucide-react';
import CatMascot, { CatState } from '../CatMascot';

interface LoginCardProps {
  catState: CatState;
  setCatState: (state: CatState) => void;
}

export default function LoginCard({ catState, setCatState }: LoginCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState('hello@controlx.agency');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isEmailValid = email.includes('@') && email.includes('.');

  // ── Entrance Animation ───────────────────────────────────────────
  useEffect(() => {
    if (!cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'cubic-bezier(0.16, 1, 0.3, 1)', delay: 0.2 }
      );
    }, cardRef);
    return () => ctx.revert();
  }, []);

  // ── Input Focus Handlers ─────────────────────────────────────────
  const handleEmailFocus = () => {
    setErrorMsg(null);
    setCatState('watching');
  };

  const handlePasswordFocus = () => {
    setErrorMsg(null);
    setCatState(showPassword ? 'visible' : 'hidden');
  };

  const handleBlur = () => {
    if (!isSubmitting && catState !== 'error' && catState !== 'success') {
      setCatState('idle');
    }
  };

  const handleTogglePassword = () => {
    const nextShow = !showPassword;
    setShowPassword(nextShow);
    setCatState(nextShow ? 'visible' : 'hidden');
  };

  // ── Form Submit Handler ──────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !email.includes('@')) {
      triggerError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 4) {
      triggerError('Password must be at least 4 characters.');
      return;
    }

    setIsSubmitting(true);
    setCatState('watching');

    setTimeout(() => {
      if (password === 'wrong' || password === 'error') {
        setIsSubmitting(false);
        triggerError('Invalid password. Please try again.');
      } else {
        setIsSubmitting(false);
        setSuccessMsg('Authentication successful! Welcome back.');
        setCatState('success');

        if (cardRef.current) {
          gsap.to(cardRef.current, {
            y: -6,
            boxShadow: '0 30px 70px rgba(15, 130, 89, 0.2)',
            duration: 0.45,
            ease: 'back.out(1.5)',
          });
        }

        setTimeout(() => {
          router.push('/');
        }, 1600);
      }
    }, 900);
  };

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setCatState('error');

    if (cardRef.current) {
      gsap.to(cardRef.current, {
        x: -8,
        duration: 0.08,
        repeat: 5,
        yoyo: true,
        ease: 'sine.inOut',
        onComplete: () => {
          gsap.set(cardRef.current, { x: 0 });
        },
      });
    }
  };

  return (
    <div className="relative w-full max-w-[480px] flex flex-col items-center">
      {/* ── Cat Mascot Layer (Positioned Above Top Edge of Card) ─────── */}
      <div className="z-20 -mb-10 pointer-events-none">
        <CatMascot state={catState} />
      </div>

      {/* ── Frosted Glass Login Card ─────────────────────────────────── */}
      <div
        ref={cardRef}
        className="login-card-master relative w-full p-8 md:p-10 rounded-[28px] z-10 overflow-hidden"
      >
        {/* Glass reflection sheen */}
        <div className="bs-glass-reflection" />

        {/* Header */}
        <div className="text-center mb-7">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight mb-1.5">
            Login to your account
          </h2>
          <p className="font-sans text-xs md:text-sm text-slate-500">
            Enter your details below to continue
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs font-medium animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs font-medium animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── Form Inputs ─────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Address */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="card-email" className="font-sans text-xs font-medium text-slate-700">
              Email address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="card-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={handleEmailFocus}
                onBlur={handleBlur}
                placeholder="name@company.com"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/70 border border-slate-200/80 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-600/10 text-slate-900 text-sm placeholder-slate-400 transition-all duration-200"
              />
              {isEmailValid && (
                <Check className="absolute right-3.5 w-4 h-4 text-emerald-600 pointer-events-none" />
              )}
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="card-password" className="font-sans text-xs font-medium text-slate-700">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="card-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={handlePasswordFocus}
                onBlur={handleBlur}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/70 border border-slate-200/80 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-600/10 text-slate-900 text-sm placeholder-slate-400 transition-all duration-200"
              />
              <button
                type="button"
                onClick={handleTogglePassword}
                onFocus={handlePasswordFocus}
                className="absolute right-3 p-1 text-slate-400 hover:text-emerald-700 transition-colors rounded-lg"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember / Forgot */}
          <div className="flex items-center justify-between my-1 text-xs">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <Link href="#forgot" className="text-emerald-700 hover:underline font-medium">
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-[#0F8259] hover:bg-[#0c6b49] text-white font-sans text-sm font-semibold tracking-wide shadow-md shadow-emerald-700/20 hover:shadow-emerald-700/35 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Social Login Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/80" />
          </div>
          <span className="relative px-3 bg-white/80 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            or continue with
          </span>
        </div>

        {/* 3 Compact Social Buttons */}
        <div className="grid grid-cols-3 gap-3">
          {/* Google */}
          <button
            type="button"
            className="flex items-center justify-center py-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 shadow-sm transition-all text-slate-700 cursor-pointer"
            aria-label="Continue with Google"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </button>

          {/* GitHub */}
          <button
            type="button"
            className="flex items-center justify-center py-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 shadow-sm transition-all text-slate-700 cursor-pointer"
            aria-label="Continue with GitHub"
          >
            <svg className="w-4 h-4 fill-slate-900" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </button>

          {/* Slack */}
          <button
            type="button"
            className="flex items-center justify-center py-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 shadow-sm transition-all text-slate-700 cursor-pointer"
            aria-label="Continue with Slack"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#E01E5A" d="M6 15a2.5 2.5 0 1 0 2.5 2.5V15H6zm0-2.5a2.5 2.5 0 0 0-2.5-2.5H1v2.5h5z" />
              <path fill="#36C5F0" d="M9 6a2.5 2.5 0 1 0-2.5-2.5V6H9zm2.5 0a2.5 2.5 0 0 0 2.5-2.5V1h-2.5v5z" />
              <path fill="#2EB67D" d="M18 9a2.5 2.5 0 1 0-2.5-2.5V9H18zm0 2.5a2.5 2.5 0 0 0 2.5 2.5H23v-2.5h-5z" />
              <path fill="#ECB22E" d="M15 18a2.5 2.5 0 1 0 2.5 2.5V18H15zm-2.5 0a2.5 2.5 0 0 0-2.5 2.5V23h2.5v-5z" />
            </svg>
          </button>
        </div>

        {/* Footer Link */}
        <p className="mt-7 text-center text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="#signup" className="font-semibold text-emerald-700 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
