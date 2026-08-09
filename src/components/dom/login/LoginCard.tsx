'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check, AlertCircle, CheckCircle2 } from 'lucide-react';
import CatMascot, { CatState } from '@/components/dom/CatMascot';

export default function LoginCard() {
  const router = useRouter();

  // ── Form State ──────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Cat State Machine ───────────────────────────────────────────────────
  const [catState, setCatState] = useState<CatState>('idle');
  // Track what state the cat should return to after a transient (error) state
  const returnStateRef = useRef<CatState>('idle');

  // ── Refs ────────────────────────────────────────────────────────────────
  const wrapperRef = useRef<HTMLDivElement>(null); // card+cat wrapper — shakes on error
  const cardRef = useRef<HTMLDivElement>(null);    // glass card
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // ── GSAP Card Entrance ──────────────────────────────────────────────────
  useEffect(() => {
    if (!wrapperRef.current) return;
    gsap.fromTo(
      wrapperRef.current,
      { opacity: 0, y: 36, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'expo.out', delay: 0.15 }
    );
  }, []);

  // ── Helper: shake wrapper on error ──────────────────────────────────────
  const shakeCard = useCallback(() => {
    if (!wrapperRef.current) return;
    gsap.to(wrapperRef.current, {
      keyframes: [
        { x: -7, duration: 0.07 },
        { x:  7, duration: 0.07 },
        { x: -5, duration: 0.07 },
        { x:  5, duration: 0.07 },
        { x: -3, duration: 0.07 },
        { x:  0, duration: 0.07 },
      ],
      ease: 'none',
    });
  }, []);

  // ── Handler: Email field focus ──────────────────────────────────────────
  const onEmailFocus = () => {
    if (catState === 'success') return; // success stays
    setCatState('idle');
    returnStateRef.current = 'idle';
    setErrorMsg(null);
  };

  // ── Handler: Password field focus ──────────────────────────────────────
  const onPasswordFocus = () => {
    if (catState === 'success') return;
    const next: CatState = showPassword ? 'password-visible' : 'password-hidden';
    setCatState(next);
    returnStateRef.current = next;
    setErrorMsg(null);
  };

  // ── Handler: Password field typing ─────────────────────────────────────
  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (catState === 'success') return;
    // While typing, show 'typing' state regardless of visibility toggle
    setCatState('typing');
    returnStateRef.current = showPassword ? 'password-visible' : 'password-hidden';
  };

  // ── Handler: Password field blur ────────────────────────────────────────
  const onBlur = () => {
    if (catState === 'error' || catState === 'success') return;
    setCatState('idle');
    returnStateRef.current = 'idle';
  };

  // ── Handler: Eye toggle ─────────────────────────────────────────────────
  const onToggleVisibility = () => {
    const next = !showPassword;
    setShowPassword(next);
    const nextCat: CatState = next ? 'password-visible' : 'password-hidden';
    setCatState(nextCat);
    returnStateRef.current = nextCat;
  };

  // ── Handler: Form Submit ────────────────────────────────────────────────
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      setCatState('error');
      shakeCard();
      setTimeout(() => setCatState(returnStateRef.current), 2000);
      return;
    }
    if (!password || password.length < 1) {
      setErrorMsg('Password is required.');
      setCatState('error');
      shakeCard();
      setTimeout(() => setCatState(returnStateRef.current), 2000);
      return;
    }

    setIsSubmitting(true);
    setCatState('typing');

    // Simulate auth — 'wrong' triggers error, anything else = success
    setTimeout(() => {
      setIsSubmitting(false);

      if (password === 'wrong' || password === 'error123') {
        setErrorMsg('Incorrect email or password. Please try again.');
        setCatState('error');
        shakeCard();
        // Return to appropriate password state after error
        setTimeout(() => {
          setCatState(showPassword ? 'password-visible' : 'password-hidden');
          returnStateRef.current = showPassword ? 'password-visible' : 'password-hidden';
        }, 2200);
      } else {
        setSuccessMsg('Login successful! Welcome back.');
        setCatState('success');
        // Subtle card glow on success
        if (cardRef.current) {
          gsap.to(cardRef.current, {
            boxShadow: '0 0 0 2px rgba(16,185,129,0.4), 0 24px 60px rgba(16,185,129,0.15)',
            duration: 0.6,
            ease: 'power2.out',
          });
        }
        setTimeout(() => router.push('/'), 1800);
      }
    }, 900);
  };

  const emailValid = email.includes('@') && email.includes('.');
  const passwordBorderClass = catState === 'error'
    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
    : 'border-slate-200/80 focus:border-emerald-600 focus:ring-emerald-600/10';

  return (
    /**
     * WRAPPER — positions the cat absolutely above the card.
     * The card itself is at normal flow; cat is abs-positioned at top.
     */
    <div
      ref={wrapperRef}
      style={{ position: 'relative', width: '100%', maxWidth: 480 }}
    >
      {/* ── CAT MASCOT — anchored to top-center of card ───────────────
          Positioned so paws hang over the card's top edge.
          z-index higher than card so paws overlap the card border.  */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -120,          // pulls cat up so paws sit on card top edge
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          pointerEvents: 'none',
        }}
      >
        <CatMascot state={catState} />
      </div>

      {/* ── FROSTED GLASS LOGIN CARD ──────────────────────────────── */}
      <div
        ref={cardRef}
        className="login-card-master relative w-full rounded-[28px] p-8 md:p-10 overflow-hidden"
        style={{ paddingTop: 80 }} // extra top-padding gives space for cat paws
      >
        {/* Specular glass reflection */}
        <div className="bs-glass-reflection" />

        {/* Card Header */}
        <div className="text-center mb-7">
          <h2 className="font-serif text-[26px] font-semibold text-slate-900 tracking-tight mb-1.5">
            Login to your account
          </h2>
          <p className="font-sans text-[13px] text-slate-500">
            Enter your details below to continue
          </p>
        </div>

        {/* ── Error / Success Alerts ─────────────────────────────── */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs font-medium" style={{ animation: 'catFadeIn 0.3s ease forwards' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs font-medium" style={{ animation: 'catFadeIn 0.3s ease forwards' }}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── Form ──────────────────────────────────────────────── */}
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="lp-email" className="text-xs font-medium text-slate-700">
              Email address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="lp-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={onEmailFocus}
                onBlur={onBlur}
                placeholder="name@company.com"
                className={`w-full pl-10 pr-10 py-3 rounded-xl bg-white/70 border focus:bg-white focus:outline-none focus:ring-4 text-slate-900 text-sm placeholder-slate-400 transition-all duration-200 border-slate-200/80 focus:border-emerald-600 focus:ring-emerald-600/10`}
              />
              {emailValid && (
                <Check className="absolute right-3.5 w-4 h-4 text-emerald-600 pointer-events-none" />
              )}
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="lp-password" className="text-xs font-medium text-slate-700">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                ref={passwordInputRef}
                id="lp-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={onPasswordChange}
                onFocus={onPasswordFocus}
                onBlur={onBlur}
                placeholder="••••••••••••"
                className={`w-full pl-10 pr-11 py-3 rounded-xl bg-white/70 border focus:bg-white focus:outline-none focus:ring-4 text-slate-900 text-sm placeholder-slate-400 transition-all duration-200 ${passwordBorderClass}`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={onToggleVisibility}
                className="absolute right-3 p-1 text-slate-400 hover:text-emerald-700 transition-colors rounded-lg"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember / Forgot */}
          <div className="flex items-center justify-between text-xs">
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

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || catState === 'success'}
            className="w-full py-3.5 rounded-xl bg-[#0F8259] hover:bg-[#0c6b49] text-white text-sm font-semibold tracking-wide shadow-md shadow-emerald-700/20 hover:shadow-emerald-700/35 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {catState === 'success' ? (
              <>
                <Check className="w-4 h-4" />
                <span>Welcome back!</span>
              </>
            ) : isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center">
          <div className="flex-1 border-t border-slate-200/80" />
          <span className="px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">
            or continue with
          </span>
          <div className="flex-1 border-t border-slate-200/80" />
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button type="button" className="flex items-center justify-center py-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 shadow-sm transition-all cursor-pointer" aria-label="Google">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          </button>
          <button type="button" className="flex items-center justify-center py-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 shadow-sm transition-all cursor-pointer" aria-label="GitHub">
            <svg className="w-4 h-4 fill-slate-900" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </button>
          <button type="button" className="flex items-center justify-center py-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 shadow-sm transition-all cursor-pointer" aria-label="Slack">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#E01E5A" d="M6 15a2.5 2.5 0 1 0 2.5 2.5V15H6zm0-2.5a2.5 2.5 0 0 0-2.5-2.5H1v2.5h5z"/>
              <path fill="#36C5F0" d="M9 6a2.5 2.5 0 1 0-2.5-2.5V6H9zm2.5 0a2.5 2.5 0 0 0 2.5-2.5V1h-2.5v5z"/>
              <path fill="#2EB67D" d="M18 9a2.5 2.5 0 1 0-2.5-2.5V9H18zm0 2.5a2.5 2.5 0 0 0 2.5 2.5H23v-2.5h-5z"/>
              <path fill="#ECB22E" d="M15 18a2.5 2.5 0 1 0 2.5 2.5V18H15zm-2.5 0a2.5 2.5 0 0 0-2.5 2.5V23h2.5v-5z"/>
            </svg>
          </button>
        </div>

        {/* Sign Up Link */}
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
