import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import BookingActionPanel from '@/components/admin/BookingActionPanel';
import BlockCustomerButton from '@/components/admin/BlockCustomerButton';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; border: string; label: string }> = {
    confirmed: { bg: 'rgba(16,185,129,0.15)', color: '#10B981', border: 'rgba(16,185,129,0.35)', label: 'CONFIRMED' },
    pending_payment: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.3)', label: 'PENDING' },
    failed: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.3)', label: 'FAILED' },
    cancelled: { bg: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: 'rgba(239,68,68,0.2)', label: 'CANCELLED' },
    draft: { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: 'rgba(148,163,184,0.2)', label: 'DRAFT' },
  };
  const b = map[status] || map['draft'];
  return (
    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', background: b.bg, color: b.color, border: `1px solid ${b.border}` }}>
      {b.label}
    </span>
  );
}

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'admin') redirect('/');

  const adminSupabase = createAdminClient();

  const { data: booking } = await adminSupabase
    .from('bookings')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!booking) notFound();

  const { data: history } = await adminSupabase
    .from('booking_history')
    .select('*')
    .eq('booking_id', params.id)
    .order('created_at', { ascending: false });

  const auditTrail = history || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(235,233,225,0.45)' }}>
        <Link href="/admin/bookings" style={{ color: '#10B981', textDecoration: 'none' }}>Bookings</Link>
        <span>/</span>
        <span style={{ color: 'rgba(235,233,225,0.7)' }}>{booking.customer_name}</span>
      </div>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#EBE9E1', letterSpacing: '-0.03em', margin: '0 0 8px' }}>
            {booking.customer_name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <StatusBadge status={booking.status} />
            <span style={{ fontSize: '12px', color: 'rgba(235,233,225,0.45)' }}>
              Booked {new Date(booking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
        <BlockCustomerButton bookingId={booking.id} customerName={booking.customer_name} />
      </div>

      {/* 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,380px)', gap: '28px', alignItems: 'start' }}>
        {/* Left Column: Details & Audit Trail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Customer Info */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Customer Information</h2>
            <InfoRow label="Name" value={booking.customer_name} />
            <InfoRow label="Email" value={booking.customer_email} />
            <InfoRow label="Phone" value={booking.customer_phone} />
            <InfoRow label="User ID" value={booking.user_id} mono />
          </section>

          {/* Payment & Operational Status */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Payment & Fulfillment</h2>
            <InfoRow label="Service" value={booking.service_name} />
            <InfoRow label="Amount" value={`₹${Number(booking.amount).toLocaleString('en-IN')} ${booking.currency}`} />
            <InfoRow label="Payment Gateway" value={booking.status.toUpperCase()} />
            <InfoRow label="Booking Status" value={(booking.booking_status || 'Confirmed').toUpperCase()} />
            <InfoRow label="Contact Status" value={booking.contact_status || 'Pending'} />
            <InfoRow label="Email Sent" value={booking.email_sent ? 'Yes ✓' : 'No —'} />
            <InfoRow label="Cashfree Order" value={booking.cashfree_order_id || '—'} mono />
            <InfoRow label="Idempotency Key" value={booking.idempotency_key} mono />
          </section>

          {/* Audit Trail */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Audit Trail & History</h2>
            {auditTrail.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'rgba(235,233,225,0.35)', margin: '8px 0 0' }}>No audit events recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {auditTrail.map((event: any, idx: number) => (
                  <div key={event.id} style={{ display: 'flex', gap: '16px', paddingBottom: idx === auditTrail.length - 1 ? '0' : '16px', borderBottom: idx === auditTrail.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', flexShrink: 0, marginTop: '5px', boxShadow: '0 0 6px #10B981' }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#EBE9E1', marginBottom: '2px' }}>{event.action}</div>
                      {event.note && <div style={{ fontSize: '12px', color: 'rgba(235,233,225,0.55)', marginBottom: '2px' }}>{event.note}</div>}
                      {(event.old_status || event.new_status) && (
                        <div style={{ fontSize: '11px', color: 'rgba(235,233,225,0.4)' }}>
                          {event.old_status && `${event.old_status} → `}{event.new_status}
                        </div>
                      )}
                      <div style={{ fontSize: '11px', color: 'rgba(235,233,225,0.3)', marginTop: '4px' }}>
                        {new Date(event.created_at).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Server Forensics (Admin Only — never shown to customer) */}
          {(booking.ip_address || booking.user_agent) && (
            <section style={{ ...sectionStyle, borderColor: 'rgba(251,191,36,0.2)' }}>
              <h2 style={sectionTitleStyle}>🔍 Forensic Data <span style={{ fontSize: '11px', color: 'rgba(235,233,225,0.35)', fontWeight: 500 }}>(Admin-Only)</span></h2>
              {booking.ip_address && <InfoRow label="IP Address" value={booking.ip_address} mono />}
              {booking.user_agent && <InfoRow label="User Agent" value={booking.user_agent} mono />}
            </section>
          )}

          {/* Danger Zone: Block Customer */}
          <section style={{ ...sectionStyle, borderColor: 'rgba(239, 68, 68, 0.25)', background: 'rgba(239, 68, 68, 0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ ...sectionTitleStyle, color: '#f87171', border: 'none', margin: '0 0 4px', padding: 0 }}>
                  🚨 Danger Zone: Abuse Prevention
                </h2>
                <p style={{ fontSize: '12px', color: 'rgba(235,233,225,0.45)', margin: 0 }}>
                  Prevent this user account, email ({booking.customer_email}), and phone from placing future bookings.
                </p>
              </div>
              <BlockCustomerButton bookingId={booking.id} customerName={booking.customer_name} />
            </div>
          </section>
        </div>

        {/* Right Column: Sticky CRM Action Panel */}
        <div className="mt-0" style={{ position: 'sticky', top: '100px' }}>
          <BookingActionPanel
            bookingId={booking.id}
            currentContact={booking.contact_status || 'Pending'}
            currentBooking={booking.booking_status || 'Confirmed'}
            currentNotes={booking.admin_notes || ''}
            followUpAt={booking.follow_up_at || null}
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: '12px', color: 'rgba(235,233,225,0.45)', fontWeight: 600, letterSpacing: '0.04em', whiteSpace: 'nowrap', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: mono ? '11px' : '13px', color: '#EBE9E1', fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit', textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

const sectionStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '14px',
  padding: '24px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: 'rgba(235,233,225,0.7)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  margin: '0 0 16px',
  paddingBottom: '12px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};
