'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface InlineManageDropdownProps {
  bookingId: string;
  currentContact?: string | null;
  currentBooking?: string | null;
}

const CONTACT_OPTIONS = ['Pending', 'Contacted', 'Callback Required', 'No Response'];
const BOOKING_OPTIONS = ['Completed', 'Cancelled'];

export default function InlineManageDropdown({
  bookingId,
  currentContact,
  currentBooking,
}: InlineManageDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleUpdate = async (params: { contactStatus?: string; bookingStatus?: string }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/update-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          ...params,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to update booking');
      } else {
        setIsOpen(false);
        router.refresh();
      }
    } catch {
      alert('Failed to update booking. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNotePrompt = async () => {
    const note = prompt('Enter internal admin note:');
    if (note === null) return;
    if (!note.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/update-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          adminNotes: note.trim(),
        }),
      });

      if (!res.ok) {
        alert('Failed to save note');
      } else {
        setIsOpen(false);
        router.refresh();
      }
    } catch {
      alert('Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: isOpen ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.12)',
          color: '#10B981',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 700,
          cursor: loading ? 'wait' : 'pointer',
          fontFamily: 'inherit',
          transition: 'all 0.15s ease',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Updating...' : 'Manage ▾'}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            width: '210px',
            background: '#06130b',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255,255,255,0.2)',
            padding: '6px',
            zIndex: 1000,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {/* Section: Contact Status */}
          <div style={sectionLabelStyle}>CONTACT STATUS</div>
          {CONTACT_OPTIONS.map((status) => {
            const isCurrent = currentContact?.toLowerCase() === status.toLowerCase();
            return (
              <button
                key={status}
                onClick={() => handleUpdate({ contactStatus: status })}
                style={{
                  ...menuItemStyle,
                  background: isCurrent ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: isCurrent ? '#10B981' : '#EBE9E1',
                  fontWeight: isCurrent ? 700 : 500,
                }}
              >
                <span style={{ fontSize: '11px', opacity: isCurrent ? 1 : 0.4 }}>
                  {isCurrent ? '●' : '○'}
                </span>
                {status}
              </button>
            );
          })}

          <div style={dividerStyle} />

          {/* Section: Booking Outcome */}
          <div style={sectionLabelStyle}>BOOKING STATUS</div>
          {BOOKING_OPTIONS.map((status) => {
            const isCurrent = currentBooking?.toLowerCase() === status.toLowerCase();
            return (
              <button
                key={status}
                onClick={() => handleUpdate({ bookingStatus: status })}
                style={{
                  ...menuItemStyle,
                  background: isCurrent ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: status === 'Cancelled' ? '#f87171' : isCurrent ? '#34d399' : '#EBE9E1',
                  fontWeight: isCurrent ? 700 : 500,
                }}
              >
                <span style={{ fontSize: '11px', opacity: isCurrent ? 1 : 0.4 }}>
                  {isCurrent ? '●' : '○'}
                </span>
                {status}
              </button>
            );
          })}

          <div style={dividerStyle} />

          {/* Section: Quick Actions */}
          <div style={sectionLabelStyle}>ACTIONS</div>
          <Link
            href={`/admin/bookings/${bookingId}`}
            onClick={() => setIsOpen(false)}
            style={{
              ...menuItemStyle,
              textDecoration: 'none',
              color: '#38bdf8',
            }}
          >
            <span>🔍</span> Full Details →
          </Link>
          <button
            onClick={handleAddNotePrompt}
            style={{
              ...menuItemStyle,
              color: '#fbbf24',
            }}
          >
            <span>📝</span> Add Quick Note
          </button>
          <Link
            href={`/admin/bookings/${bookingId}`}
            onClick={() => setIsOpen(false)}
            style={{
              ...menuItemStyle,
              textDecoration: 'none',
              color: '#f87171',
            }}
          >
            <span>🚫</span> Block Customer
          </Link>
        </div>
      )}
    </div>
  );
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 800,
  letterSpacing: '0.08em',
  color: 'rgba(235, 233, 225, 0.35)',
  padding: '6px 8px 2px',
};

const dividerStyle: React.CSSProperties = {
  height: '1px',
  background: 'rgba(255, 255, 255, 0.06)',
  margin: '4px 0',
};

const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  padding: '8px 10px',
  border: 'none',
  borderRadius: '6px',
  fontSize: '12px',
  textAlign: 'left',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'background 0.12s ease',
  boxSizing: 'border-box',
};
