'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { gsap } from 'gsap';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import CatMascot, { CatState } from './CatMascot';

export default function LoginCard() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [catState, setCatState] = useState<CatState>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Page Entrance GSAP Timeline ──────────────────────────────────
  useEffect(() => {
    if (!cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 40, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'expo.out', delay: 0.2 }
      );
    }, cardRef);

    return () => ctx.revert();
  }, []);

  // ── Input Focus & Interaction Handlers ───────────────────────────
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

  // ── Form Submission Handler ──────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Basic Validation
    if (!email || !email.includes('@')) {
      triggerError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      triggerError('Password must be at least 6 characters.');
      return;
    }

    // Submit animation
    setIsSubmitting(true);
    setCatState('watching');

    setTimeout(() => {
      // Demo authentication logic
      if (password === 'wrong' || password === 'error123') {
        setIsSubmitting(false);
        triggerError('Invalid email or password. Please try again.');
      } else {
        setIsSubmitting(false);
        setSuccessMsg('Authentication successful! Welcome to CONTROL X.');
        setCatState('success');

        // Card celebration scale
        if (cardRef.current) {
          gsap.to(cardRef.current, {
            y: -8,
            boxShadow: '0 30px 60px rgba(15, 130, 89, 0.25)',
            duration: 0.5,
            ease: 'back.out(1.5)',
          });
        }

        // Redirect after 1.6s
        setTimeout(() => {
          router.push('/');
        }, 1600);
      }
    }, 1000);
  };

  // Trigger error shake & cat confusion
  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setCatState('error');

    if (cardRef.current) {
      gsap.to(cardRef.current, {
        x: -10,
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
    <div className="relative w-full max-w-[460px] mx-auto flex flex-col items-center">
      {/* ── Interactive Cat Mascot Layer (Positioned Above Card Top Boundary) ── */}
      <div className="z-20 -mb-6 pointer-events-none">
        <CatMascot state={catState} />
      </div>

      {/* ── Main Frosted Glass Login Card ───────────────────────────────── */}
      <div
        ref={cardRef}
        className="login-glass-card relative w-full p-8 md:p-10 rounded-[32px] z-10 overflow-hidden"
      >
        {/* Diagonal specular light reflection overlay */}
        <div className="bs-glass-reflection" />

        {/* Card Header & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/10 border border-emerald-600/20 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Portal</span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="font-sans text-sm text-slate-600">
            Sign in to access your CONTROL X dashboard & brand assets.
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-700 text-xs font-medium animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-800 text-xs font-medium animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── Login Form ──────────────────────────────────────────────── */}
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email Input Field */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="login-email" className="font-sans text-xs font-bold text-slate-700 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={handleEmailFocus}
                onBlur={handleBlur}
                placeholder="name@company.com"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/60 border border-white/80 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-600/15 text-slate-900 text-sm placeholder-slate-400 transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="font-sans text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <Link href="#forgot" className="text-xs font-semibold text-emerald-700 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={handlePasswordFocus}
                onBlur={handleBlur}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-white/60 border border-white/80 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-600/15 text-slate-900 text-sm placeholder-slate-400 transition-all duration-200 shadow-sm"
              />

              {/* Password Visibility Eye Toggle Button */}
              <button
                type="button"
                onClick={handleTogglePassword}
                onFocus={handlePasswordFocus}
                className="absolute right-3.5 p-1.5 text-slate-400 hover:text-emerald-700 transition-colors rounded-xl hover:bg-slate-100/50"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center gap-2.5 my-1 text-left">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="remember-me" className="text-xs text-slate-600 cursor-pointer select-none">
              Remember this device for 30 days
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-sans text-sm font-bold tracking-wide shadow-lg shadow-emerald-700/25 hover:shadow-emerald-700/40 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Control X</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Card Footer Options */}
        <div className="mt-8 pt-6 border-t border-slate-900/5 text-center text-xs text-slate-500 flex flex-col gap-2">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="#request-access" className="font-semibold text-emerald-700 hover:underline">
              Request Enterprise Access
            </Link>
          </p>
          <p className="text-[11px] text-slate-400">
            Protected by end-to-end encryption &amp; CONTROL X Guard.
          </p>
        </div>
      </div>
    </div>
  );
}
