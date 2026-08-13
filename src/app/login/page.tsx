'use client';

import React, { useState, useRef, useEffect } from 'react';
import LoginCatStage, { CatState } from '@/components/dom/LoginCatStage';
import styles from './login.module.css';

export interface LoginFormProps {
  onLogin?: (email: string, pass: string) => Promise<boolean> | boolean;
}

function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMasked, setIsMasked] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  const [catState, setCatState] = useState<CatState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const errorResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (errorResetTimerRef.current) clearTimeout(errorResetTimerRef.current);
    };
  }, []);

  /* --- Interaction Handlers --- */
  const handleEmailFocus = () => {
    setCatState('email');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errorMsg) setErrorMsg('');
    setCatState('email');
  };

  const handleEmailBlur = () => {
    if (password.length === 0) {
      setCatState('idle');
    } else {
      setCatState(isMasked ? 'hidden' : 'visible');
    }
  };

  const handlePasswordFocus = () => {
    if (password.length > 0) {
      setCatState('typing');
      scheduleTypingPause();
    } else {
      setCatState('typing');
    }
  };

  const scheduleTypingPause = () => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      if (password.length > 0) {
        setCatState(isMasked ? 'hidden' : 'visible');
      }
    }, 500);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (errorMsg) setErrorMsg('');

    if (val.length === 0) {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      setCatState('idle');
      return;
    }

    setCatState('typing');
    scheduleTypingPause();
  };

  const handlePasswordBlur = () => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (password.length === 0) {
      setCatState('idle');
    } else {
      setCatState(isMasked ? 'hidden' : 'visible');
    }
  };

  const toggleEyeMask = () => {
    const nextMasked = !isMasked;
    setIsMasked(nextMasked);

    if (password.length > 0) {
      setCatState(nextMasked ? 'hidden' : 'visible');
    }

    if (passwordRef.current) {
      passwordRef.current.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length === 0) {
      setErrorMsg('Please enter your password.');
      setCatState('error');
      if (errorResetTimerRef.current) clearTimeout(errorResetTimerRef.current);
      errorResetTimerRef.current = setTimeout(() => {
        setCatState('idle');
      }, 1500);
      return;
    }

    setIsLoading(true);

    // 500ms auth simulation / hook
    setTimeout(async () => {
      setIsLoading(false);
      let success = false;

      if (onLogin) {
        success = await onLogin(email, password);
      } else {
        // Default placeholder auth check
        const DEMO_PASSWORD = 'controlx123';
        success = password === DEMO_PASSWORD;
      }

      if (!success) {
        setErrorMsg('Incorrect password. Please try again.');
        setCatState('error');
        if (errorResetTimerRef.current) clearTimeout(errorResetTimerRef.current);
        errorResetTimerRef.current = setTimeout(() => {
          setCatState(isMasked ? 'hidden' : 'visible');
        }, 1500);
      } else {
        setErrorMsg('');
        setIsSuccess(true);
        setCatState('success');
      }
    }, 500);
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.shell}>
        {/* LEFT PANEL */}
        <div className={styles.left}>
          <div>
            <div className={styles.brand}>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M3 3L21 21M21 3L3 21" stroke="#2f6b47" strokeWidth="4" strokeLinecap="round" />
              </svg>
              CONTROL X
            </div>
            <div className={styles.headline}>
              <h1>
                Welcome
                <br />
                back!
              </h1>
              <div className={styles.rule}></div>
              <p>Great to see you again.</p>
              <p>Let&apos;s continue where you left off.</p>
            </div>
          </div>

          <svg className={styles.glassX} viewBox="0 0 200 220">
            <defs>
              <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#eaf5ee" stopOpacity="0.9" />
                <stop offset="1" stopColor="#9cc2ab" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            <path
              d="M20 20 L90 100 L20 200 M50 20 L120 100 M180 20 L110 100 L180 200 M150 20 L80 100"
              stroke="url(#glassGrad)"
              strokeWidth="16"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />
            <path
              d="M20 20 L180 200 M180 20 L20 200"
              stroke="url(#glassGrad)"
              strokeWidth="20"
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          <div className={styles.trust}>
            Trusted by creative teams worldwide
            <div className={styles.trustLogos}>
              <span>stripe</span>
              <span>◆ Notion</span>
              <span>◐ Linear</span>
              <span>▲ Vercel</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={styles.right}>
          <div className={styles.lang}>🌐 English ▾</div>

          <div className={styles.formCard}>
            <div className={styles.cardBox}>
              {/* ===== CAT STAGE COMPONENT ===== */}
              <LoginCatStage state={catState} />

              <h2 className={styles.title}>
                {isSuccess ? 'Welcome Aboard!' : 'Log in'}
              </h2>
              <div className={styles.subtitle}>
                {isSuccess
                  ? 'Redirecting to your executive dashboard...'
                  : 'Enter your credentials to access Control X'}
              </div>

              {isSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--green-deep)',
                      color: '#fff',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      fontSize: '20px',
                    }}
                  >
                    ✓
                  </div>
                  <p style={{ fontFamily: '-apple-system, sans-serif', fontSize: '14px', color: 'var(--ink)', fontWeight: 600 }}>
                    Authentication Successful
                  </p>
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setPassword('');
                      setErrorMsg('');
                      setCatState('idle');
                    }}
                    style={{
                      marginTop: '20px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--green)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontFamily: '-apple-system, sans-serif',
                      textDecoration: 'underline',
                    }}
                  >
                    Log in with another account
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {/* Email Field */}
                  <div className={styles.field}>
                    <label htmlFor="email" className={styles.label}>Email address</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        onFocus={handleEmailFocus}
                        onBlur={handleEmailBlur}
                        placeholder="name@company.com"
                      />
                      <div className={styles.iconLeft}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className={`${styles.field} ${errorMsg ? 'error' : ''}`}>
                    <label htmlFor="password" className={styles.label}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        ref={passwordRef}
                        id="password"
                        type={isMasked ? 'password' : 'text'}
                        value={password}
                        onChange={handlePasswordChange}
                        onFocus={handlePasswordFocus}
                        onBlur={handlePasswordBlur}
                        placeholder="••••••••"
                      />
                      <div className={styles.iconLeft}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <div
                        className={styles.iconRight}
                        onClick={toggleEyeMask}
                        id="toggleEye"
                        aria-label={isMasked ? 'Show password' : 'Hide password'}
                      >
                        {isMasked ? '👁' : '🙈'}
                      </div>
                    </div>
                  </div>

                  {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

                  <div className={styles.rowBetween}>
                    <label className={styles.remember}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      Remember me
                    </label>
                    <a className={styles.forgot} href="#forgot">
                      Forgot password?
                    </a>
                  </div>

                  <button type="submit" className={styles.loginBtn} id="loginBtn" disabled={isLoading}>
                    {isLoading ? 'Checking...' : isSuccess ? 'Welcome back! ✓' : 'Sign In'}
                    {!isLoading && !isSuccess && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    )}
                  </button>

                  <div className={styles.divider}>or continue with</div>

                  <div className={styles.socials}>
                    <div title="Sign in with Google">
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </div>
                    <div title="Sign in with Apple">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#1b2b23">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.35c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.64 1.35-.57.66-1.07 1.73-.94 2.76 1.01.08 2.04-.51 2.66-1.26z" />
                      </svg>
                    </div>
                    <div title="Sign in with GitHub">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#1b2b23">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    </div>
                  </div>

                  <div className={styles.signup}>
                    Don&apos;t have an account?{' '}
                    <a href="#signup">Sign up now</a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}

