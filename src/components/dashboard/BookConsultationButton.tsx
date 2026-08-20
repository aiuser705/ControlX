'use client';

import React, { useState } from 'react';

declare global {
  interface Window {
    Cashfree?: (config: { mode: string }) => {
      checkout: (options: { paymentSessionId: string; redirectTarget?: string }) => Promise<{ error?: { message?: string }; paymentDetails?: unknown }>;
    };
  }
}

const CONSULTATION_DISPLAY_PRICE = '₹5,000';
const CF_SDK_MODE = 'sandbox' as const;

/**
 * Dynamically loads the Cashfree JS SDK from their CDN on demand.
 */
async function loadCashfreeSDK() {
  if (window.Cashfree) {
    return window.Cashfree({ mode: CF_SDK_MODE });
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Cashfree SDK from CDN'));
    document.head.appendChild(script);
  });

  return window.Cashfree!({ mode: CF_SDK_MODE });
}

export default function BookConsultationButton() {
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOpenForm = () => {
    setError('');
    setShowModal(true);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!customerName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please provide a valid 10-digit contact number.');
      return;
    }

    // Immediately disable to prevent double clicks
    setIsLoading(true);

    try {
      // 1. Create order server-side
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: cleanPhone.slice(-10),
        }),
      });

      const data = await res.json();

      if (res.status === 409 || data.already_booked) {
        setError('You have already booked this consultation. Our executive team will reach out directly.');
        setIsLoading(false);
        return;
      }

      if (!res.ok || !data.success) {
        const debugInfo = data.debug
          ? `\n\nDebug: ${JSON.stringify(data.debug, null, 2)}`
          : '';
        setError((data.error ?? 'Failed to initiate payment.') + debugInfo);
        setIsLoading(false);
        return;
      }

      // 2. Load SDK and open checkout drop-in modal
      const cashfree = await loadCashfreeSDK();

      cashfree.checkout({
        paymentSessionId: data.session_id,
        redirectTarget: '_self', // full-page redirect to return_url on completion
      });
    } catch (err: any) {
      console.error('[BookConsultation] Checkout error:', err);
      setError('Something went wrong during checkout initialization. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        {/* Icon & Title */}
        <div style={headerRowStyle}>
          <div style={iconBadgeStyle}>🗓</div>
          <div>
            <h3 style={titleStyle}>1-Hour Executive Consultation</h3>
            <p style={descStyle}>
              Private strategy session with Control X leadership. Brand architecture & digital systems roadmap.
            </p>
          </div>
        </div>

        {/* Pricing */}
        <div style={priceRowStyle}>
          <span style={priceStyle}>{CONSULTATION_DISPLAY_PRICE}</span>
          <span style={priceLabelStyle}>/ session · Guaranteed 1-on-1</span>
        </div>

        {/* Trigger Button or Expanded Form */}
        {!showModal ? (
          <button
            onClick={handleOpenForm}
            style={btnPrimaryStyle}
            id="openBookingFormBtn"
          >
            Book Consultation — {CONSULTATION_DISPLAY_PRICE}
          </button>
        ) : (
          <form onSubmit={handlePay} style={formStyle}>
            <div style={formHeaderStyle}>
              <span style={formTitleStyle}>Confirm Booking Details</span>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={closeBtnStyle}
                disabled={isLoading}
              >
                ✕
              </button>
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle} htmlFor="b-name">Your Full Name</label>
              <input
                id="b-name"
                type="text"
                required
                placeholder="e.g. Alex Morgan"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={isLoading}
                style={inputStyle}
              />
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle} htmlFor="b-email">Email Address</label>
              <input
                id="b-email"
                type="email"
                required
                placeholder="executive@company.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                disabled={isLoading}
                style={inputStyle}
              />
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle} htmlFor="b-phone">Phone Number (10 Digits)</label>
              <input
                id="b-phone"
                type="tel"
                required
                placeholder="9876543210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                disabled={isLoading}
                style={inputStyle}
              />
            </div>

            {error && <p style={errStyle}>{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              style={btnSubmitStyle(isLoading)}
              id="payConsultationBtn"
            >
              {isLoading ? (
                <>
                  <span style={spinnerStyle} /> Securing Checkout...
                </>
              ) : (
                `Proceed to Pay — ${CONSULTATION_DISPLAY_PRICE}`
              )}
            </button>
          </form>
        )}

        <p style={noteStyle}>
          🔒 Secure 256-bit encrypted checkout via Cashfree &nbsp;·&nbsp; Sandbox mode active
        </p>
      </div>
    </div>
  );
}

/* ── Inline Styles ─────────────────────────────────────────────────────────── */

const wrapperStyle: React.CSSProperties = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  width: '100%',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(16, 185, 129, 0.22)',
  borderRadius: '20px',
  padding: '32px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
};

const headerRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
};

const iconBadgeStyle: React.CSSProperties = {
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  background: 'rgba(16, 185, 129, 0.15)',
  border: '1px solid rgba(16, 185, 129, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '22px',
  flexShrink: 0,
};

const titleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#EBE9E1',
  margin: '0 0 6px',
  letterSpacing: '-0.02em',
};

const descStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'rgba(235, 233, 225, 0.55)',
  lineHeight: 1.6,
  margin: 0,
};

const priceRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '8px',
  paddingBottom: '4px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
};

const priceStyle: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 800,
  color: '#10B981',
  letterSpacing: '-0.03em',
};

const priceLabelStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'rgba(235, 233, 225, 0.45)',
  fontWeight: 500,
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  background: 'rgba(0, 0, 0, 0.25)',
  padding: '20px',
  borderRadius: '14px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
};

const formHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '4px',
};

const formTitleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#EBE9E1',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'rgba(235, 233, 225, 0.5)',
  cursor: 'pointer',
  fontSize: '16px',
  padding: '4px 8px',
};

const fieldGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11.5px',
  fontWeight: 600,
  color: 'rgba(235, 233, 225, 0.65)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '8px',
  color: '#EBE9E1',
  fontSize: '13.5px',
  outline: 'none',
  boxSizing: 'border-box',
};

const btnPrimaryStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '14px 24px',
  background: 'linear-gradient(135deg, #0F8259 0%, #10B981 100%)',
  border: 'none',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '0.03em',
  cursor: 'pointer',
  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
  transition: 'opacity 0.2s',
  width: '100%',
};

const btnSubmitStyle = (loading: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '12px 20px',
  background: loading
    ? 'rgba(15, 130, 89, 0.4)'
    : 'linear-gradient(135deg, #0F8259 0%, #10B981 100%)',
  border: 'none',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '13.5px',
  fontWeight: 700,
  letterSpacing: '0.03em',
  cursor: loading ? 'not-allowed' : 'pointer',
  opacity: loading ? 0.7 : 1,
  marginTop: '4px',
});

const spinnerStyle: React.CSSProperties = {
  display: 'inline-block',
  width: '14px',
  height: '14px',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderTopColor: '#fff',
  borderRadius: '50%',
  animation: 'spin 0.7s linear infinite',
};

const errStyle: React.CSSProperties = {
  fontSize: '12.5px',
  color: '#f87171',
  margin: 0,
  lineHeight: 1.4,
};

const noteStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'rgba(235, 233, 225, 0.35)',
  textAlign: 'center',
  margin: 0,
};
