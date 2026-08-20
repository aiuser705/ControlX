'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [sessionError, setSessionError] = useState(false);

  // Verify the user arrived here with a valid session (set by /auth/callback).
  // We use getUser() — never getSession() — for server-authoritative validation.
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        setSessionError(true);
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Client-side validation
    if (newPassword.length < 8) {
      setValidationError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setIsSubmitting(false);

    if (error) {
      setValidationError(error.message || 'Failed to update password. Please request a new link.');
      return;
    }

    // Password updated — show success, then redirect to login after 2 seconds
    setSuccess(true);
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  /* ── Invalid / expired session state ─────────────────────────────────────── */
  if (sessionError) {
    return (
      <div style={wrapperStyle}>
        <div style={cardStyle}>
          <div style={brandStyle}>
            <span style={brandXStyle}>X</span>
            <span style={brandTextStyle}>CONTROL</span>
          </div>
          <div style={errorBoxStyle}>
            <div style={errorIconStyle}>!</div>
            <h2 style={{ ...titleStyle, textAlign: 'center' }}>Link Expired</h2>
            <p style={subtitleStyle}>
              This password reset link is invalid or has expired. Reset links
              are valid for 60 minutes and can only be used once.
            </p>
            <Link href="/forgot-password" style={btnLinkStyle}>
              Request a New Link
            </Link>
            <Link href="/login" style={backLinkStyle}>
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Success state ────────────────────────────────────────────────────────── */
  if (success) {
    return (
      <div style={wrapperStyle}>
        <div style={cardStyle}>
          <div style={brandStyle}>
            <span style={brandXStyle}>X</span>
            <span style={brandTextStyle}>CONTROL</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '24px', textAlign: 'center' }}>
            <div style={checkCircleStyle}>✓</div>
            <h2 style={titleStyle}>Password Updated</h2>
            <p style={subtitleStyle}>
              Your password has been changed successfully. Redirecting to
              login…
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Reset form ───────────────────────────────────────────────────────────── */
  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        {/* Brand mark */}
        <div style={brandStyle}>
          <span style={brandXStyle}>X</span>
          <span style={brandTextStyle}>CONTROL</span>
        </div>

        <h1 style={titleStyle}>Choose a new password</h1>
        <p style={subtitleStyle}>
          Your new password must be at least 8 characters long.
        </p>

        <form onSubmit={handleSubmit} noValidate style={formStyle}>
          {/* New Password */}
          <div style={fieldStyle}>
            <label htmlFor="rp-new" style={labelStyle}>
              New Password
            </label>
            <input
              id="rp-new"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setValidationError('');
              }}
              disabled={isSubmitting}
              style={inputStyle}
            />
          </div>

          {/* Confirm Password */}
          <div style={fieldStyle}>
            <label htmlFor="rp-confirm" style={labelStyle}>
              Confirm Password
            </label>
            <input
              id="rp-confirm"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setValidationError('');
              }}
              disabled={isSubmitting}
              style={inputStyle}
            />
          </div>

          {/* Password strength hint */}
          {newPassword.length > 0 && newPassword.length < 8 && (
            <p style={hintStyle}>
              {8 - newPassword.length} more character{8 - newPassword.length !== 1 ? 's' : ''} needed
            </p>
          )}

          {/* Validation error */}
          {validationError && (
            <p style={errMsgStyle}>{validationError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || newPassword === '' || confirmPassword === ''}
            style={btnStyle(isSubmitting)}
          >
            {isSubmitting ? 'Updating…' : 'Set New Password'}
          </button>

          <Link href="/login" style={backLinkStyle}>
            ← Back to Login
          </Link>
        </form>
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
  margin: '4px 0 24px',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
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
  opacity: loading ? 0.7 : 1,
  transition: 'opacity 0.2s',
});

const btnLinkStyle: React.CSSProperties = {
  display: 'block',
  padding: '13px 20px',
  background: 'linear-gradient(135deg, #0F8259 0%, #10B981 100%)',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textDecoration: 'none',
  textAlign: 'center',
};

const backLinkStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#10B981',
  textDecoration: 'none',
  fontWeight: 600,
  letterSpacing: '0.02em',
  textAlign: 'center',
};

const hintStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'rgba(235,233,225,0.4)',
  margin: '-8px 0 0',
};

const errMsgStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#f87171',
  margin: '-8px 0 0',
  lineHeight: 1.5,
};

const errorBoxStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  textAlign: 'center',
};

const errorIconStyle: React.CSSProperties = {
  width: '52px',
  height: '52px',
  borderRadius: '50%',
  background: 'rgba(239,68,68,0.15)',
  border: '2px solid rgba(239,68,68,0.4)',
  color: '#f87171',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
  fontWeight: 800,
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
