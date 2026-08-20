'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  admin_notes?: string | null;
  created_at: string;
}

interface MessageInboxTableProps {
  initialMessages: ContactMessageItem[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  new: { label: 'NEW', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)' },
  read: { label: 'READ', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.25)' },
  replied: { label: 'REPLIED', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.35)' },
  resolved: { label: 'RESOLVED', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.35)' },
  archived: { label: 'ARCHIVED', color: 'rgba(235, 233, 225, 0.35)', bg: 'rgba(255, 255, 255, 0.04)', border: 'rgba(255, 255, 255, 0.08)' },
};

export default function MessageInboxTable({ initialMessages }: MessageInboxTableProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessageItem[]>(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null);
  const [status, setStatus] = useState<string>('new');
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const openModal = (msg: ContactMessageItem) => {
    setSelectedMessage(msg);
    setStatus(msg.status?.toLowerCase() || 'new');
    setNotes(msg.admin_notes || '');
    setFeedback(null);
    setShowDeleteConfirm(false);

    // Auto-mark as 'read' if it's currently 'new'
    if (msg.status?.toLowerCase() === 'new') {
      updateMessageStatus(msg.id, 'read');
    }
  };

  const closeModal = () => {
    setSelectedMessage(null);
    setFeedback(null);
    setShowDeleteConfirm(false);
  };

  const updateMessageStatus = async (messageId: string, newStatus: string) => {
    try {
      await fetch('/api/admin/update-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          status: newStatus,
        }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, status: newStatus } : m))
      );
      router.refresh();
    } catch (e) {
      console.error('Failed to auto-update message status:', e);
    }
  };

  const handleSave = async () => {
    if (!selectedMessage) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/update-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: selectedMessage.id,
          status,
          adminNotes: notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setFeedback({ type: 'error', message: data.error || 'Failed to update message.' });
      } else {
        setFeedback({ type: 'success', message: 'Message updated successfully!' });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === selectedMessage.id ? { ...m, status, admin_notes: notes } : m
          )
        );
        router.refresh();
        setTimeout(() => {
          closeModal();
        }, 1200);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;
    setIsDeleting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/delete-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: selectedMessage.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Failed to delete message.' });
        setIsDeleting(false);
      } else {
        // Remove immediately from the local message list
        const deletedId = selectedMessage.id;
        setMessages((prev) => prev.filter((m) => m.id !== deletedId));
        closeModal();
        router.refresh();
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error while attempting to delete.' });
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.25)' }}>
                {['NAME', 'EMAIL', 'MESSAGE PREVIEW', 'STATUS', 'DATE', 'ACTION'].map((h) => (
                  <th key={h} style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(235,233,225,0.4)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '56px 20px', textAlign: 'center', color: 'rgba(235,233,225,0.35)', fontSize: '14px' }}>
                    No messages found in your inbox.
                  </td>
                </tr>
              ) : (
                messages.map((msg) => {
                  const sc = STATUS_CONFIG[msg.status?.toLowerCase()] || STATUS_CONFIG['read'];
                  const isUnread = msg.status?.toLowerCase() === 'new';

                  return (
                    <tr
                      key={msg.id}
                      onClick={() => openModal(msg)}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        cursor: 'pointer',
                        background: isUnread ? 'rgba(16, 185, 129, 0.04)' : 'transparent',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isUnread ? 'rgba(16, 185, 129, 0.04)' : 'transparent';
                      }}
                    >
                      {/* Name */}
                      <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: isUnread ? 700 : 600, color: '#EBE9E1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isUnread && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />}
                          {msg.name}
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#10B981' }}>
                        {msg.email}
                      </td>

                      {/* Message Preview */}
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: 'rgba(235,233,225,0.7)', maxWidth: '380px' }}>
                        <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                          {msg.message}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            background: sc.bg,
                            color: sc.color,
                            border: `1px solid ${sc.border}`,
                          }}
                        >
                          {sc.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '16px 20px', fontSize: '12px', color: 'rgba(235,233,225,0.5)', whiteSpace: 'nowrap' }}>
                        {new Date(msg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Action Button */}
                      <td style={{ padding: '16px 20px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(msg);
                          }}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '6px',
                            color: '#EBE9E1',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          View ↗
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal View */}
      {selectedMessage && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#07160d',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '18px',
              maxWidth: '560px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#EBE9E1', margin: '0 0 4px' }}>
                  {selectedMessage.name}
                </h2>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  style={{ fontSize: '13px', color: '#10B981', textDecoration: 'none' }}
                >
                  ✉️ {selectedMessage.email}
                </a>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(235,233,225,0.5)',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Date */}
            <div style={{ fontSize: '12px', color: 'rgba(235,233,225,0.4)' }}>
              Received on {new Date(selectedMessage.created_at).toLocaleString('en-IN')}
            </div>

            {/* Message Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(235,233,225,0.45)' }}>
                FULL MESSAGE
              </label>
              <div
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '16px',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: '#EBE9E1',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {selectedMessage.message}
              </div>
            </div>

            {/* Status Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(235,233,225,0.45)' }}>
                UPDATE STATUS
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  color: '#EBE9E1',
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              >
                <option value="new">New (Unread)</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="resolved">Resolved</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Admin Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(235,233,225,0.45)' }}>
                ADMIN INTERNAL NOTES
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log internal follow-ups, reply timestamps, customer details..."
                rows={3}
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  color: '#EBE9E1',
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {feedback && (
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: feedback.type === 'success' ? '#10B981' : '#f87171',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                }}
              >
                {feedback.message}
              </div>
            )}

            {/* Delete Confirmation Box */}
            {showDeleteConfirm ? (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>⚠️</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f87171' }}>
                    Permanently delete this inquiry from {selectedMessage.name}?
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(235,233,225,0.6)', margin: 0, lineHeight: 1.5 }}>
                  This will permanently remove the record from the database. This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      color: '#EBE9E1',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: isDeleting
                        ? 'rgba(239, 68, 68, 0.5)'
                        : 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: isDeleting ? 'wait' : 'pointer',
                      fontFamily: 'inherit',
                      boxShadow: isDeleting ? 'none' : '0 4px 14px rgba(239, 68, 68, 0.35)',
                    }}
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
                  </button>
                </div>
              </div>
            ) : null}

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', alignItems: 'center' }}>
              {/* Delete Trigger Button */}
              {!showDeleteConfirm && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '10px',
                    color: '#f87171',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              )}

              <button
                onClick={closeModal}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: 'rgba(235,233,225,0.7)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Close
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving || showDeleteConfirm}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #0F8259 0%, #10B981 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: isSaving ? 'wait' : 'pointer',
                  fontFamily: 'inherit',
                  opacity: isSaving || showDeleteConfirm ? 0.6 : 1,
                }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
