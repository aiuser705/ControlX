'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const supabase = createClient();

    // Always request a reset — regardless of whether the email exists
    // in the DB. The identical success message below prevents account
    // enumeration (we never reveal whether an address is registered).
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    // Always show the same message — do NOT branch on success/error here
    setSent(true);
    setIsSubmitting(false);
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        {/* Brand mark */}
        <div style={brandStyle}>
          <span style={brandXStyle}>X</span>
          <span style={brandTextStyle}>CONTROL</span>
        </div>

        <h1 style={titleStyle}>Reset your password</h1>

        {sent ? (
          /* ── Success state ─────────────────────────────────────────── */
          <div style={successBoxStyle}>
            <div style={checkCircleStyle}>✓</div>
            <p style={successMsgStyle}>
              If an account exists for this email, a password reset link has been sent.
            </p>
            <p style={hintStyle}>
              Check your inbox (and spam folder). The link expires in 60 minutes.
            </p>
            <Link href="/login" style={backLinkStyle}>
              ← Back to Login
            </Link>
          </div>
        ) : (
          /* ── Request form ──────────────────────────────────────────── */
          <form onSubmit={handleSubmit} noValidate style={formStyle}>
            <p style={subtitleStyle}>
              Enter the email address associated with your account and we&apos;ll
              send you a reset link.
            </p>

            <div style={fieldStyle}>
              <label htmlFor="fp-email" style={labelStyle}>
                Email address
              </label>
              <input
                id="fp-email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || email.trim() === ''}
              style={btnStyle(isSubmitting)}
            >
              {isSubmitting ? 'Sending…' : 'Send Reset Link'}
            </button>

            <Link href="/login" style={backLinkStyle}>
              ← Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── Inline styles (glass dark theme matching the app aesthetic) ─────────── */

const wrapperStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'radial-gradient(ellipse at 30% 50%, #0d2818 0%, #050f08 60%, #020705 100%)',
  padding: '24px',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '420px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(16, 185, 129, 0.18)',
  borderRadius: '20px',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  padding: '48px 40px 40px',
  boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
};

const brandStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '32px',
};

const brandXStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 800,
  color: '#10B981',
  letterSpacing: '-0.02em',
};

const brandTextStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  letterSpacing: '0.18em',
  color: 'rgba(235,233,225,0.85)',
  textTransform: 'uppercase',
};

const titleStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 700,
  color: '#EBE9E1',
  margin: '0 0 4px',
  letterSpacing: '-0.02em',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '13.5px',
  color: 'rgba(235,233,225,0.55)',
  lineHeight: 1.6,
  margin: '0 0 28px',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  marginTop: '16px',
};

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'rgba(235,233,225,0.6)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '10px',
  color: '#EBE9E1',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const btnStyle = (loading: boolean): React.CSSProperties => ({
  padding: '13px 20px',
  background: loading
    ? 'rgba(15, 130, 89, 0.4)'
    : 'linear-gradient(135deg, #0F8259 0%, #10B981 100%)',
  border: 'none',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '0.04em',
  cursor: loading ? 'not-allowed' : 'pointer',
  transition: 'opacity 0.2s',
  opacity: loading ? 0.7 : 1,
});

const successBoxStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  marginTop: '24px',
  textAlign: 'center',
};

const checkCircleStyle: React.CSSProperties = {
  width: '52px',
  height: '52px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #0F8259 0%, #10B981 100%)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '22px',
  fontWeight: 700,
  boxShadow: '0 0 32px rgba(16,185,129,0.35)',
};

const successMsgStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#EBE9E1',
  lineHeight: 1.6,
  margin: 0,
  fontWeight: 500,
};

const hintStyle: React.CSSProperties = {
  fontSize: '12.5px',
  color: 'rgba(235,233,225,0.45)',
  margin: 0,
};

const backLinkStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#10B981',
  textDecoration: 'none',
  fontWeight: 600,
  letterSpacing: '0.02em',
  marginTop: '4px',
};
