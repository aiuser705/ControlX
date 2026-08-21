'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type StateMachineStatus = 'loading' | 'confirmed' | 'failed' | 'cancelled' | 'pending_payment';

interface BookingInfo {
  id?: string;
  service_name?: string;
  amount?: number;
  currency?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  cashfree_order_id?: string;
}

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || searchParams.get('orderId');

  const [status, setStatus] = useState<StateMachineStatus>('loading');
  const [booking, setBooking] = useState<BookingInfo>({});
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!orderId) {
      setStatus('failed');
      setErrorMessage('No order reference provided in redirect parameters.');
      return;
    }

    let isMounted = true;

    async function verifyOrder() {
      try {
        const res = await fetch('/api/payments/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });

        const data = await res.json();

        if (!isMounted) return;

        if (res.ok && data.success) {
          const rawStatus = (data.status || '').toLowerCase();
          if (rawStatus === 'confirmed' || rawStatus === 'success') {
            setStatus('confirmed');
          } else if (rawStatus === 'cancelled' || rawStatus === 'user_dropped') {
            setStatus('cancelled');
          } else if (rawStatus === 'pending_payment' || rawStatus === 'pending') {
            setStatus('pending_payment');
          } else {
            setStatus('failed');
          }

          if (data.booking) {
            setBooking(data.booking);
          }
        } else {
          setStatus('failed');
          setErrorMessage(data.error || 'Unable to confirm payment status.');
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('[PaymentStatus] Verification error:', err);
        setStatus('failed');
        setErrorMessage('Network error during payment verification.');
      }
    }

    verifyOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        {/* Brand Header */}
        <div style={brandStyle}>
          <span style={brandXStyle}>X</span>
          <span style={brandTextStyle}>CONTROL</span>
        </div>

        {/* ── 1. LOADING ───────────────────────────────────────────────── */}
        {status === 'loading' && (
          <div style={contentBoxStyle}>
            <div style={spinnerContainerStyle}>
              <div style={spinnerRingStyle} />
            </div>
            <h1 style={titleStyle}>Verifying Payment Status</h1>
            <p style={subtitleStyle}>
              Securing transaction confirmation with Cashfree and finalizing your consultation booking...
            </p>
            {orderId && (
              <div style={orderRefStyle}>
                <span style={orderLabelStyle}>Order Reference:</span>
                <code style={orderCodeStyle}>{orderId}</code>
              </div>
            )}
          </div>
        )}

        {/* ── 2. CONFIRMED ─────────────────────────────────────────────── */}
        {status === 'confirmed' && (
          <div style={contentBoxStyle}>
            <div style={successIconStyle}>✓</div>
            <h1 style={titleStyle}>Booking Confirmed</h1>
            <p style={subtitleStyle}>
              We have received your payment of{' '}
              <strong style={{ color: '#10B981' }}>
                ₹{Number(booking.amount || 5000).toLocaleString('en-IN')}
              </strong>
              . We will contact you shortly at{' '}
              <strong style={{ color: '#EBE9E1' }}>
                {booking.customer_email || 'your registered email'}
              </strong>
              .
            </p>

            <div style={receiptBoxStyle}>
              <div style={receiptRowStyle}>
                <span style={receiptLabelStyle}>Service</span>
                <span style={receiptValueStyle}>{booking.service_name || '1-Hour Executive Consultation'}</span>
              </div>
              {booking.id && (
                <div style={receiptRowStyle}>
                  <span style={receiptLabelStyle}>Reference ID</span>
                  <code style={orderCodeStyle}>{booking.id}</code>
                </div>
              )}
              {booking.customer_name && (
                <div style={receiptRowStyle}>
                  <span style={receiptLabelStyle}>Client</span>
                  <span style={receiptValueStyle}>{booking.customer_name}</span>
                </div>
              )}
              <div style={receiptRowStyle}>
                <span style={receiptLabelStyle}>Status</span>
                <span style={badgeSuccessStyle}>Confirmed · Paid</span>
              </div>
            </div>

            <Link href="/account" style={btnPrimaryStyle}>
              Return to Executive Dashboard &rarr;
            </Link>
          </div>
        )}

        {/* ── 3. FAILED ────────────────────────────────────────────────── */}
        {status === 'failed' && (
          <div style={contentBoxStyle}>
            <div style={failedIconStyle}>✕</div>
            <h1 style={titleStyle}>Payment Failed</h1>
            <p style={subtitleStyle}>
              {errorMessage || 'Payment Failed. No money was deducted. Please try again.'}
            </p>

            {orderId && (
              <div style={orderRefStyle}>
                <span style={orderLabelStyle}>Order Reference:</span>
                <code style={orderCodeStyle}>{orderId}</code>
              </div>
            )}

            <div style={actionRowStyle}>
              <Link href="/account" style={btnPrimaryStyle}>
                Back to Dashboard
              </Link>
              <Link href="/#contact" style={btnSecondaryStyle}>
                Contact Support
              </Link>
            </div>
          </div>
        )}

        {/* ── 4. CANCELLED ─────────────────────────────────────────────── */}
        {status === 'cancelled' && (
          <div style={contentBoxStyle}>
            <div style={cancelledIconStyle}>—</div>
            <h1 style={titleStyle}>Payment Cancelled</h1>
            <p style={subtitleStyle}>
              Payment Cancelled. You were not charged.
            </p>

            {orderId && (
              <div style={orderRefStyle}>
                <span style={orderLabelStyle}>Order Reference:</span>
                <code style={orderCodeStyle}>{orderId}</code>
              </div>
            )}

            <Link href="/account" style={btnPrimaryStyle}>
              Back to Dashboard
            </Link>
          </div>
        )}

        {/* ── 5. PENDING PAYMENT ───────────────────────────────────────── */}
        {status === 'pending_payment' && (
          <div style={contentBoxStyle}>
            <div style={pendingIconStyle}>◷</div>
            <h1 style={titleStyle}>Payment Pending</h1>
            <p style={subtitleStyle}>
              Payment is still pending. We will notify you once it is confirmed.
            </p>

            {orderId && (
              <div style={orderRefStyle}>
                <span style={orderLabelStyle}>Order Reference:</span>
                <code style={orderCodeStyle}>{orderId}</code>
              </div>
            )}

            <div style={actionRowStyle}>
              <button
                onClick={() => window.location.reload()}
                style={btnPrimaryStyle}
              >
                Refresh Status
              </button>
              <Link href="/account" style={btnSecondaryStyle}>
                Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div style={wrapperStyle}>
          <div style={cardStyle}>
            <div style={contentBoxStyle}>
              <div style={spinnerContainerStyle}>
                <div style={spinnerRingStyle} />
              </div>
              <h1 style={titleStyle}>Loading Status...</h1>
            </div>
          </div>
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}

/* ── Inline Luxury Dark Theme Styles ───────────────────────────────────────── */

const wrapperStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'radial-gradient(ellipse at 30% 30%, #0d2818 0%, #050f08 60%, #020705 100%)',
  padding: '24px',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '480px',
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(16, 185, 129, 0.22)',
  borderRadius: '24px',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  padding: '48px 36px',
  boxShadow: '0 32px 90px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
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
  color: 'rgba(235, 233, 225, 0.85)',
  textTransform: 'uppercase',
};

const contentBoxStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
};

const titleStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#EBE9E1',
  margin: '0 0 10px',
  letterSpacing: '-0.02em',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'rgba(235, 233, 225, 0.65)',
  lineHeight: 1.6,
  margin: '0 0 24px',
  maxWidth: '390px',
};

const spinnerContainerStyle: React.CSSProperties = {
  width: '64px',
  height: '64px',
  marginBottom: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const spinnerRingStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  border: '3px solid rgba(16, 185, 129, 0.2)',
  borderTopColor: '#10B981',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};

const successIconStyle: React.CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #0F8259 0%, #10B981 100%)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '28px',
  fontWeight: 800,
  boxShadow: '0 0 36px rgba(16, 185, 129, 0.45)',
  marginBottom: '24px',
};

const failedIconStyle: React.CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: 'rgba(239, 68, 68, 0.15)',
  border: '2px solid rgba(239, 68, 68, 0.45)',
  color: '#f87171',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '28px',
  fontWeight: 800,
  boxShadow: '0 0 36px rgba(239, 68, 68, 0.3)',
  marginBottom: '24px',
};

const cancelledIconStyle: React.CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: 'rgba(148, 163, 184, 0.15)',
  border: '2px solid rgba(148, 163, 184, 0.35)',
  color: '#cbd5e1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '28px',
  fontWeight: 800,
  marginBottom: '24px',
};

const pendingIconStyle: React.CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: 'rgba(245, 158, 11, 0.15)',
  border: '2px solid rgba(245, 158, 11, 0.4)',
  color: '#fbbf24',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '28px',
  fontWeight: 800,
  boxShadow: '0 0 36px rgba(245, 158, 11, 0.25)',
  marginBottom: '24px',
};

const orderRefStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '10px',
  marginBottom: '24px',
};

const orderLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'rgba(235, 233, 225, 0.45)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const orderCodeStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#10B981',
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
};

const receiptBoxStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.07)',
  borderRadius: '14px',
  padding: '16px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginBottom: '28px',
};

const receiptRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: '13px',
};

const receiptLabelStyle: React.CSSProperties = {
  color: 'rgba(235, 233, 225, 0.5)',
};

const receiptValueStyle: React.CSSProperties = {
  color: '#EBE9E1',
  fontWeight: 600,
};

const badgeSuccessStyle: React.CSSProperties = {
  background: 'rgba(16, 185, 129, 0.15)',
  color: '#10B981',
  padding: '3px 8px',
  borderRadius: '6px',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.04em',
  border: '1px solid rgba(16, 185, 129, 0.3)',
};

const actionRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  width: '100%',
  justifyContent: 'center',
};

const btnPrimaryStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '14px 24px',
  background: 'linear-gradient(135deg, #0F8259 0%, #10B981 100%)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '0.03em',
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
};

const btnSecondaryStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '14px 20px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '12px',
  color: '#EBE9E1',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
  cursor: 'pointer',
};
