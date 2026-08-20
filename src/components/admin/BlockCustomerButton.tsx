'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const BLOCK_REASONS = ['Fraud Attempt', 'Chargeback Abuse', 'Misbehavior / Harassment', 'Suspicious Activity', 'Other'];

interface BlockCustomerButtonProps {
  bookingId: string;
  customerName: string;
}

export default function BlockCustomerButton({ bookingId, customerName }: BlockCustomerButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('Fraud Attempt');
  const [customReason, setCustomReason] = useState('');
  const [blocking, setBlocking] = useState(false);
  const [error, setError] = useState('');

  const handleBlock = async () => {
    const finalReason = reason === 'Other' ? customReason.trim() : reason;
    if (!finalReason) { setError('Please enter a reason.'); return; }

    setBlocking(true);
    setError('');
    try {
      const res = await fetch('/api/admin/block-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, reason: finalReason }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to block customer.'); }
      else { setShowModal(false); router.refresh(); }
    } catch { setError('Network error.'); }
    finally { setBlocking(false); }
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} style={blockBtnStyle}>
        🚫 Block Customer for Abuse
      </button>

      {showModal && (
        <div style={overlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#EBE9E1', margin: '0 0 4px' }}>
              Block Customer
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(235,233,225,0.5)', margin: '0 0 24px' }}>
              This will block <strong style={{ color: '#f87171' }}>{customerName}</strong> from making future bookings. The block is logged in the audit trail.
            </p>

            <label style={modalLabelStyle}>SELECT REASON</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} style={modalSelectStyle}>
              {BLOCK_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>

            {reason === 'Other' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Describe the reason for blocking..."
                rows={3}
                style={{ ...modalSelectStyle, resize: 'vertical', marginTop: '12px' }}
              />
            )}

            {error && <p style={{ fontSize: '13px', color: '#f87171', margin: '12px 0 0' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setShowModal(false)} style={cancelBtnStyle}>Cancel</button>
              <button onClick={handleBlock} disabled={blocking} style={confirmBtnStyle}>
                {blocking ? 'Blocking...' : 'Confirm Block'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const blockBtnStyle: React.CSSProperties = {
  padding: '10px 20px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)',
  borderRadius: '10px', color: '#f87171', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
  fontFamily: 'inherit', letterSpacing: '0.03em', transition: 'background 0.2s',
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px',
};

const modalStyle: React.CSSProperties = {
  background: '#08140c', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '16px',
  padding: '32px', maxWidth: '480px', width: '100%',
  boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
};

const modalLabelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
  color: 'rgba(235,233,225,0.45)', marginBottom: '8px',
};

const modalSelectStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px', color: '#EBE9E1', padding: '10px 12px', fontSize: '13px',
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const,
};

const cancelBtnStyle: React.CSSProperties = {
  flex: 1, padding: '11px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', color: 'rgba(235,233,225,0.7)', fontSize: '13px', fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
};

const confirmBtnStyle: React.CSSProperties = {
  flex: 1, padding: '11px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
  borderRadius: '10px', color: '#f87171', fontSize: '13px', fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
};
