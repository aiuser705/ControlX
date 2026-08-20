import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';

function getStatusBadge(status: string) {
  switch (status) {
    case 'confirmed': return { bg: 'rgba(16,185,129,0.15)', color: '#10B981', border: 'rgba(16,185,129,0.35)', label: 'CONFIRMED' };
    case 'pending_payment': return { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.3)', label: 'PENDING' };
    case 'failed': return { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.3)', label: 'FAILED' };
    case 'cancelled': return { bg: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: 'rgba(239,68,68,0.2)', label: 'CANCELLED' };
    case 'draft': return { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: 'rgba(148,163,184,0.2)', label: 'DRAFT' };
    default: return { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: 'rgba(148,163,184,0.2)', label: status.toUpperCase() };
  }
}

function getBookingBadge(bs: string) {
  switch (bs?.toLowerCase()) {
    case 'completed': return { bg: 'rgba(52,211,153,0.15)', color: '#34d399', border: 'rgba(52,211,153,0.35)', label: 'COMPLETED' };
    case 'cancelled': return { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.3)', label: 'CANCELLED' };
    case 'confirmed':
    default: return { bg: 'rgba(16,185,129,0.15)', color: '#10B981', border: 'rgba(16,185,129,0.35)', label: 'CONFIRMED' };
  }
}

function getContactBadge(cs: string) {
  switch (cs?.toLowerCase()) {
    case 'contacted': return { color: '#10B981', label: 'Contacted' };
    case 'callback required': return { color: '#60a5fa', label: 'Callback Required' };
    case 'no response': return { color: '#f87171', label: 'No Response' };
    case 'pending':
    default: return { color: '#fbbf24', label: cs || 'Pending' };
  }
}

export default async function AdminBookingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'admin') redirect('/');

  const adminSupabase = createAdminClient();
  const { data: bookings } = await adminSupabase
    .from('bookings')
    .select('id, customer_name, customer_email, customer_phone, service_name, amount, currency, status, contact_status, booking_status, follow_up_at, email_sent, cashfree_order_id, created_at')
    .order('created_at', { ascending: false });

  const all = bookings || [];
  const now = new Date();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#EBE9E1', letterSpacing: '-0.03em', margin: '0 0 6px' }}>
            Bookings CRM
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(235,233,225,0.5)', margin: 0 }}>
            Manage consultation bookings, contact lifecycle, and follow-ups
          </p>
        </div>
        <span style={{ fontSize: '12px', color: 'rgba(235,233,225,0.5)', background: 'rgba(255,255,255,0.04)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)' }}>
          {all.length} Total Records
        </span>
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.25)' }}>
                {['CUSTOMER', 'SERVICE', 'AMOUNT', 'PAYMENT', 'BOOKING STATUS', 'CONTACT STATUS', 'FOLLOW-UP', 'BOOKED ON', 'ACTIONS'].map((h) => (
                  <th key={h} style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(235,233,225,0.4)', textAlign: 'left', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {all.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: 'rgba(235,233,225,0.35)', fontSize: '14px' }}>
                    No bookings found.
                  </td>
                </tr>
              ) : all.map((b: any) => {
                const payBadge = getStatusBadge(b.status);
                const bookBadge = getBookingBadge(b.booking_status || 'Confirmed');
                const contactStyle = getContactBadge(b.contact_status || 'Pending');
                const followUpDate = b.follow_up_at ? new Date(b.follow_up_at) : null;
                const isOverdue = followUpDate && followUpDate < now;

                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {/* Customer */}
                    <td style={{ padding: '16px 20px' }}>
                      <Link href={`/admin/bookings/${b.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#10B981', marginBottom: '2px' }}>
                          {b.customer_name || 'Unknown'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(235,233,225,0.5)' }}>{b.customer_email}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(235,233,225,0.35)', marginTop: '2px' }}>📞 {b.customer_phone}</div>
                      </Link>
                    </td>

                    {/* Service */}
                    <td style={{ padding: '16px 20px', fontSize: '12px', color: 'rgba(235,233,225,0.75)' }}>{b.service_name}</td>

                    {/* Amount */}
                    <td style={{ padding: '16px 20px', fontSize: '15px', fontWeight: 700, color: '#10B981' }}>
                      ₹{Number(b.amount).toLocaleString('en-IN')}
                    </td>

                    {/* Payment Status */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', background: payBadge.bg, color: payBadge.color, border: `1px solid ${payBadge.border}` }}>
                        {payBadge.label}
                      </span>
                    </td>

                    {/* Booking Status */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', background: bookBadge.bg, color: bookBadge.color, border: `1px solid ${bookBadge.border}` }}>
                        {bookBadge.label}
                      </span>
                    </td>

                    {/* Contact Status */}
                    <td style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: contactStyle.color }}>
                      {contactStyle.label}
                    </td>

                    {/* Follow-up */}
                    <td style={{ padding: '16px 20px', fontSize: '12px', color: isOverdue ? '#f87171' : 'rgba(235,233,225,0.55)', whiteSpace: 'nowrap' }}>
                      {followUpDate ? `${isOverdue ? '⚠️ ' : ''}${followUpDate.toLocaleDateString('en-IN')}` : '—'}
                    </td>

                    {/* Booked on */}
                    <td style={{ padding: '16px 20px', fontSize: '12px', color: 'rgba(235,233,225,0.5)', whiteSpace: 'nowrap' }}>
                      {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 20px' }}>
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-md text-sm hover:bg-emerald-500/30 transition-colors inline-block"
                        style={{
                          textDecoration: 'none',
                          padding: '6px 14px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10B981',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
