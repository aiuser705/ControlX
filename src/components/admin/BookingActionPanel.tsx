'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BookingActionPanelProps {
  bookingId: string;
  currentContact?: string | null;
  currentBooking?: string | null;
  currentNotes?: string | null;
  followUpAt?: string | null;
  // Backward compatibility alias props
  initialContactStatus?: string | null;
  initialNotes?: string | null;
  initialFollowUp?: string | null;
  currentStatus?: string | null;
}

const CONTACT_STATUSES = [
  { id: 'Pending', label: 'Pending', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.18)', border: 'rgba(251, 191, 36, 0.45)' },
  { id: 'Contacted', label: 'Contacted', color: '#10B981', bg: 'rgba(16, 185, 129, 0.18)', border: 'rgba(16, 185, 129, 0.45)' },
  { id: 'Callback Required', label: 'Callback Required', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.18)', border: 'rgba(96, 165, 250, 0.45)' },
  { id: 'No Response', label: 'No Response', color: '#f87171', bg: 'rgba(239, 68, 68, 0.18)', border: 'rgba(239, 68, 68, 0.45)' },
];

const BOOKING_STATUSES = [
  { id: 'Confirmed', label: 'Confirmed', color: '#10B981', bg: 'rgba(16, 185, 129, 0.18)', border: 'rgba(16, 185, 129, 0.45)' },
  { id: 'Completed', label: 'Completed', color: '#34d399', bg: 'rgba(52, 211, 153, 0.18)', border: 'rgba(52, 211, 153, 0.45)' },
  { id: 'Cancelled', label: 'Cancelled', color: '#f87171', bg: 'rgba(239, 68, 68, 0.18)', border: 'rgba(239, 68, 68, 0.45)' },
];

export default function BookingActionPanel({
  bookingId,
  currentContact,
  currentBooking,
  currentNotes,
  followUpAt,
  initialContactStatus,
  initialNotes,
  initialFollowUp,
  currentStatus,
}: BookingActionPanelProps) {
  const router = useRouter();

  // Normalize server props
  const effectiveContact = currentContact || currentStatus || initialContactStatus || 'Pending';
  const effectiveBooking = currentBooking || 'Confirmed';
  const effectiveNotes = currentNotes || initialNotes || '';
  const effectiveFollowUp = followUpAt || initialFollowUp || null;

  const [contactStatus, setContactStatus] = useState<string>(effectiveContact);
  const [bookingStatus, setBookingStatus] = useState<string>(effectiveBooking);
  const [notes, setNotes] = useState<string>(effectiveNotes);
  const [followUp, setFollowUp] = useState<string>(
    effectiveFollowUp ? new Date(effectiveFollowUp).toISOString().slice(0, 16) : ''
  );

  // Sync state whenever server props revalidate
  useEffect(() => {
    setContactStatus(effectiveContact);
    setBookingStatus(effectiveBooking);
    setNotes(effectiveNotes);
    setFollowUp(effectiveFollowUp ? new Date(effectiveFollowUp).toISOString().slice(0, 16) : '');
  }, [effectiveContact, effectiveBooking, effectiveNotes, effectiveFollowUp]);

  const [savingContact, setSavingContact] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [savingReminder, setSavingReminder] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // 1. Update Contact Status
  const handleContactStatusClick = async (statusId: string) => {
    setContactStatus(statusId);
    setSavingContact(true);
    try {
      const res = await fetch('/api/admin/update-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          contactStatus: statusId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        showFeedback('error', data.error || 'Failed to update contact status.');
      } else {
        showFeedback('success', `Contact status updated to ${statusId}`);
        router.refresh();
      }
    } catch {
      showFeedback('error', 'Network error. Please try again.');
    } finally {
      setSavingContact(false);
    }
  };

  // 2. Update Booking Status
  const handleBookingStatusClick = async (statusId: string) => {
    setBookingStatus(statusId);
    setSavingBooking(true);
    try {
      const res = await fetch('/api/admin/update-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          bookingStatus: statusId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        showFeedback('error', data.error || 'Failed to update booking status.');
      } else {
        showFeedback('success', `Booking status updated to ${statusId}`);
        router.refresh();
      }
    } catch {
      showFeedback('error', 'Network error. Please try again.');
    } finally {
      setSavingBooking(false);
    }
  };

  // 3. Save Admin Note
  const handleSaveNote = async () => {
    setSavingNote(true);
    try {
      const res = await fetch('/api/admin/update-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          adminNotes: notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        showFeedback('error', data.error || 'Failed to save note.');
      } else {
        showFeedback('success', 'Admin note saved successfully');
        router.refresh();
      }
    } catch {
      showFeedback('error', 'Network error. Please try again.');
    } finally {
      setSavingNote(false);
    }
  };

  // 4. Set Follow-up Reminder
  const handleSetReminder = async () => {
    setSavingReminder(true);
    try {
      const res = await fetch('/api/admin/update-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          followUpAt: followUp || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        showFeedback('error', data.error || 'Failed to set reminder.');
      } else {
        showFeedback('success', followUp ? 'Follow-up reminder set' : 'Reminder cleared');
        router.refresh();
      }
    } catch {
      showFeedback('error', 'Network error. Please try again.');
    } finally {
      setSavingReminder(false);
    }
  };

  const handleClearReminder = async () => {
    setFollowUp('');
    setSavingReminder(true);
    try {
      const res = await fetch('/api/admin/update-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          followUpAt: null,
        }),
      });

      if (!res.ok) {
        showFeedback('error', 'Failed to clear reminder.');
      } else {
        showFeedback('success', 'Reminder cleared');
        router.refresh();
      }
    } catch {
      showFeedback('error', 'Network error.');
    } finally {
      setSavingReminder(false);
    }
  };

  const isSavingAny = savingContact || savingBooking || savingNote || savingReminder;

  return (
    <div style={panelStyle}>
      <div style={panelHeaderStyle}>
        <div>
          <h3 style={panelTitleStyle}>⚡ Booking Management Action Panel</h3>
          <p style={panelSubtitleStyle}>Manage contact lifecycle, fulfillment status, and notes</p>
        </div>
        <span style={activeBadgeStyle}>CRM ACTIVE</span>
      </div>

      {feedback && (
        <div style={feedback.type === 'success' ? successAlertStyle : errorAlertStyle}>
          {feedback.type === 'success' ? '✓ ' : '⚠️ '}
          {feedback.message}
        </div>
      )}

      {/* 1. Contact Status Buttons */}
      <div style={sectionGroupStyle}>
        <div style={sectionTitleRowStyle}>
          <label style={labelStyle}>CONTACT STATUS</label>
          {savingContact && <span style={savingIndicatorStyle}>Updating...</span>}
        </div>
        <div style={statusButtonGridStyle}>
          {CONTACT_STATUSES.map((s) => {
            const isActive = contactStatus.toLowerCase() === s.id.toLowerCase();
            return (
              <button
                key={s.id}
                onClick={() => handleContactStatusClick(s.id)}
                disabled={isSavingAny}
                style={{
                  ...statusButtonStyle,
                  background: isActive ? s.bg : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? s.color : 'rgba(235, 233, 225, 0.65)',
                  borderColor: isActive ? s.border : 'rgba(255, 255, 255, 0.09)',
                  boxShadow: isActive ? `0 0 16px ${s.bg}` : 'none',
                  fontWeight: isActive ? 800 : 600,
                  transform: isActive ? 'scale(1.02)' : 'none',
                }}
              >
                {isActive && <span style={{ marginRight: '6px' }}>●</span>}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Booking / Fulfillment Status Buttons */}
      <div style={sectionGroupStyle}>
        <div style={sectionTitleRowStyle}>
          <label style={labelStyle}>BOOKING / FULFILLMENT STATUS</label>
          {savingBooking && <span style={savingIndicatorStyle}>Updating...</span>}
        </div>
        <div style={statusButtonGridStyle}>
          {BOOKING_STATUSES.map((s) => {
            const isActive = bookingStatus.toLowerCase() === s.id.toLowerCase();
            return (
              <button
                key={s.id}
                onClick={() => handleBookingStatusClick(s.id)}
                disabled={isSavingAny}
                style={{
                  ...statusButtonStyle,
                  background: isActive ? s.bg : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? s.color : 'rgba(235, 233, 225, 0.65)',
                  borderColor: isActive ? s.border : 'rgba(255, 255, 255, 0.09)',
                  boxShadow: isActive ? `0 0 16px ${s.bg}` : 'none',
                  fontWeight: isActive ? 800 : 600,
                  transform: isActive ? 'scale(1.02)' : 'none',
                }}
              >
                {isActive && <span style={{ marginRight: '6px' }}>●</span>}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Admin Notes */}
      <div style={sectionGroupStyle}>
        <label style={labelStyle}>INTERNAL ADMIN NOTES</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Log client call details, consultation agenda, client requirements..."
          rows={4}
          disabled={isSavingAny}
          style={textareaStyle}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSaveNote}
            disabled={isSavingAny}
            style={savingNote ? { ...actionButtonStyle, opacity: 0.6 } : actionButtonStyle}
          >
            {savingNote ? 'Saving Note...' : '💾 Save Note'}
          </button>
        </div>
      </div>

      {/* 4. Follow-up Reminder */}
      <div style={sectionGroupStyle}>
        <label style={labelStyle}>SET FOLLOW-UP REMINDER</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="datetime-local"
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            disabled={isSavingAny}
            style={inputStyle}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSetReminder}
              disabled={isSavingAny || !followUp}
              style={{
                ...actionButtonStyle,
                flex: 1,
                opacity: isSavingAny || !followUp ? 0.5 : 1,
              }}
            >
              {savingReminder ? 'Setting...' : '⏰ Set Reminder'}
            </button>
            {followUp && (
              <button
                onClick={handleClearReminder}
                disabled={isSavingAny}
                style={clearButtonStyle}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Component Styles ──────────────────────────────────────────────────────── */

const panelStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(16, 185, 129, 0.28)',
  borderRadius: '18px',
  padding: '26px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  boxShadow: '0 16px 48px rgba(0,0,0,0.45)',
};

const panelHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBottom: '16px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
};

const panelTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 800,
  color: '#EBE9E1',
  letterSpacing: '-0.02em',
  margin: '0 0 4px',
};

const panelSubtitleStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'rgba(235, 233, 225, 0.45)',
  margin: 0,
};

const activeBadgeStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 800,
  letterSpacing: '0.08em',
  padding: '4px 10px',
  borderRadius: '6px',
  background: 'rgba(16, 185, 129, 0.18)',
  color: '#10B981',
  border: '1px solid rgba(16, 185, 129, 0.35)',
};

const sectionGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const sectionTitleRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: 'rgba(235, 233, 225, 0.5)',
};

const savingIndicatorStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#fbbf24',
  fontWeight: 600,
};

const statusButtonGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
  gap: '8px',
};

const statusButtonStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid',
  fontSize: '12px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'inherit',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'rgba(0, 0, 0, 0.35)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '10px',
  color: '#EBE9E1',
  padding: '12px',
  fontSize: '13px',
  fontFamily: 'inherit',
  outline: 'none',
  resize: 'vertical',
  lineHeight: 1.6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'rgba(0, 0, 0, 0.35)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '10px',
  color: '#EBE9E1',
  padding: '10px 12px',
  fontSize: '13px',
  fontFamily: 'inherit',
  outline: 'none',
};

const actionButtonStyle: React.CSSProperties = {
  padding: '10px 18px',
  background: 'linear-gradient(135deg, #0F8259 0%, #10B981 100%)',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.03em',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
  fontFamily: 'inherit',
};

const clearButtonStyle: React.CSSProperties = {
  padding: '10px 14px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: 'rgba(235, 233, 225, 0.6)',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const successAlertStyle: React.CSSProperties = {
  padding: '10px 14px',
  background: 'rgba(16, 185, 129, 0.15)',
  border: '1px solid rgba(16, 185, 129, 0.35)',
  borderRadius: '8px',
  color: '#10B981',
  fontSize: '12px',
  fontWeight: 600,
};

const errorAlertStyle: React.CSSProperties = {
  padding: '10px 14px',
  background: 'rgba(239, 68, 68, 0.12)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  borderRadius: '8px',
  color: '#f87171',
  fontSize: '12px',
  fontWeight: 600,
};
