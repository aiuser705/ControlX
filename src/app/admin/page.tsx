import { createAdminClient } from '@/lib/supabase/server';
import InlineManageDropdown from '@/components/admin/InlineManageDropdown';

interface BookingRecord {
  id: string;
  user_id: string;
  idempotency_key: string;
  cashfree_order_id: string | null;
  service_name: string;
  amount: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: 'draft' | 'pending_payment' | 'confirmed' | 'failed' | 'cancelled' | 'refunded';
  contact_status?: string | null;
  booking_status?: string | null;
  email_sent: boolean;
  created_at: string;
  updated_at: string;
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  // Fetch all bookings sorted newest first
  const { data: rawBookings, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  const bookings = (rawBookings as BookingRecord[]) || [];

  // Calculate high-level KPIs
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const confirmedCount = confirmedBookings.length;
  const pendingCount = bookings.filter((b) => b.status === 'pending_payment' || b.status === 'draft').length;
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + Number(b.amount || 0), 0);

  return (
    <div style={pageWrapperStyle}>
      {/* Page Header */}
      <div style={headerSectionStyle}>
        <div>
          <h1 style={pageTitleStyle}>Executive Overview</h1>
          <p style={pageSubtitleStyle}>Real-time consultation bookings & revenue metrics</p>
        </div>
        <div style={livePulseBadgeStyle}>
          <span style={liveDotStyle} />
          <span>LIVE METRICS</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={statsGridStyle}>
        {/* Total Gross Revenue */}
        <div style={statCardStyle}>
          <span style={statLabelStyle}>TOTAL REVENUE</span>
          <div style={statValueRowStyle}>
            <span style={revenueValueStyle}>₹{totalRevenue.toLocaleString('en-IN')}</span>
            <span style={currencyPillStyle}>INR</span>
          </div>
          <span style={statHelpTextStyle}>Settled via Cashfree PG</span>
        </div>

        {/* Confirmed Bookings */}
        <div style={statCardStyle}>
          <span style={statLabelStyle}>CONFIRMED BOOKINGS</span>
          <div style={statValueRowStyle}>
            <span style={confirmedValueStyle}>{confirmedCount}</span>
            <span style={ratePillStyle}>
              {totalBookings > 0 ? `${Math.round((confirmedCount / totalBookings) * 100)}% Conv.` : '0%'}
            </span>
          </div>
          <span style={statHelpTextStyle}>Fully verified consultations</span>
        </div>

        {/* In-Flight / Pending */}
        <div style={statCardStyle}>
          <span style={statLabelStyle}>IN-FLIGHT ORDERS</span>
          <div style={statValueRowStyle}>
            <span style={pendingValueStyle}>{pendingCount}</span>
          </div>
          <span style={statHelpTextStyle}>Pending checkout completion</span>
        </div>

        {/* Total Lifetime Bookings */}
        <div style={statCardStyle}>
          <span style={statLabelStyle}>TOTAL INITIATED</span>
          <div style={statValueRowStyle}>
            <span style={statValueStyle}>{totalBookings}</span>
          </div>
          <span style={statHelpTextStyle}>All lifetime orders</span>
        </div>
      </div>

      {/* Bookings Section */}
      <div id="bookings" style={tableCardStyle}>
        <div style={tableHeaderStyle}>
          <div>
            <h2 style={tableTitleStyle}>Consultation Bookings</h2>
            <p style={tableSubtitleStyle}>Authoritative audit trail across all payment states</p>
          </div>
          <span style={rowCountBadgeStyle}>{bookings.length} Records</span>
        </div>

        {fetchError && (
          <div style={errorBannerStyle}>
            ⚠️ Error loading bookings: {fetchError.message}
          </div>
        )}

        {bookings.length === 0 ? (
          <div style={emptyStateStyle}>
            <span style={emptyIconStyle}>📋</span>
            <p style={emptyTitleStyle}>No Bookings Recorded Yet</p>
            <p style={emptyTextStyle}>
              When users schedule consultations from their dashboard, the state machine records will appear here in real time.
            </p>
          </div>
        ) : (
          <div style={tableScrollContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeadRowStyle}>
                  <th style={thStyle}>CLIENT</th>
                  <th style={thStyle}>SERVICE</th>
                  <th style={thStyle}>AMOUNT</th>
                  <th style={thStyle}>PAYMENT</th>
                  <th style={thStyle}>BOOKING STATUS</th>
                  <th style={thStyle}>CONTACT STATUS</th>
                  <th style={thStyle}>DATE & TIME</th>
                  <th style={thStyle}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const createdDate = new Date(booking.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  const currentBookingStatus = booking.booking_status || 'Confirmed';
                  const currentContactStatus = booking.contact_status || 'Pending';

                  return (
                    <tr key={booking.id} style={tableRowStyle}>
                      {/* Client info */}
                      <td style={tdStyle}>
                        <div style={clientNameStyle}>{booking.customer_name || 'Anonymous'}</div>
                        <div style={clientEmailStyle}>{booking.customer_email}</div>
                        {booking.customer_phone && (
                          <div style={clientPhoneStyle}>📞 {booking.customer_phone}</div>
                        )}
                      </td>

                      {/* Service */}
                      <td style={tdStyle}>
                        <span style={serviceBadgeStyle}>{booking.service_name}</span>
                      </td>

                      {/* Amount */}
                      <td style={tdStyle}>
                        <span style={amountStyle}>
                          ₹{Number(booking.amount).toLocaleString('en-IN')}
                        </span>
                        <span style={currencyStyle}> {booking.currency}</span>
                      </td>

                      {/* Payment Status */}
                      <td style={tdStyle}>
                        <span style={getStatusBadgeStyle(booking.status)}>
                          {formatStatus(booking.status)}
                        </span>
                      </td>

                      {/* Booking Status */}
                      <td style={tdStyle}>
                        <span style={getBookingStatusBadgeStyle(currentBookingStatus)}>
                          {currentBookingStatus.toUpperCase()}
                        </span>
                      </td>

                      {/* Contact Status */}
                      <td style={tdStyle}>
                        <span style={getContactStatusBadgeStyle(currentContactStatus)}>
                          {currentContactStatus}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={tdStyle}>
                        <span style={dateStyle}>{createdDate}</span>
                      </td>

                      {/* Inline Actions */}
                      <td style={tdStyle}>
                        <InlineManageDropdown
                          bookingId={booking.id}
                          currentContact={booking.contact_status}
                          currentBooking={booking.booking_status}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Status Formatting Helpers ─────────────────────────────────────────────── */

function formatStatus(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'CONFIRMED';
    case 'pending_payment':
      return 'PENDING';
    case 'draft':
      return 'DRAFT';
    case 'failed':
      return 'FAILED';
    case 'cancelled':
      return 'CANCELLED';
    case 'refunded':
      return 'REFUNDED';
    default:
      return status.toUpperCase();
  }
}

function getStatusBadgeStyle(status: string): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.06em',
  };

  switch (status) {
    case 'confirmed':
      return {
        ...base,
        background: 'rgba(16, 185, 129, 0.15)',
        color: '#10B981',
        border: '1px solid rgba(16, 185, 129, 0.35)',
      };
    case 'pending_payment':
      return {
        ...base,
        background: 'rgba(251, 191, 36, 0.12)',
        color: '#fbbf24',
        border: '1px solid rgba(251, 191, 36, 0.3)',
      };
    case 'failed':
    case 'cancelled':
      return {
        ...base,
        background: 'rgba(239, 68, 68, 0.12)',
        color: '#f87171',
        border: '1px solid rgba(239, 68, 68, 0.3)',
      };
    case 'draft':
    default:
      return {
        ...base,
        background: 'rgba(148, 163, 184, 0.1)',
        color: '#94a3b8',
        border: '1px solid rgba(148, 163, 184, 0.2)',
      };
  }
}

function getBookingStatusBadgeStyle(status: string): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.06em',
  };

  switch (status.toLowerCase()) {
    case 'completed':
      return {
        ...base,
        background: 'rgba(52, 211, 153, 0.15)',
        color: '#34d399',
        border: '1px solid rgba(52, 211, 153, 0.35)',
      };
    case 'cancelled':
      return {
        ...base,
        background: 'rgba(239, 68, 68, 0.12)',
        color: '#f87171',
        border: '1px solid rgba(239, 68, 68, 0.3)',
      };
    case 'confirmed':
    default:
      return {
        ...base,
        background: 'rgba(16, 185, 129, 0.15)',
        color: '#10B981',
        border: '1px solid rgba(16, 185, 129, 0.35)',
      };
  }
}

function getContactStatusBadgeStyle(status: string): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 600,
  };

  switch (status.toLowerCase()) {
    case 'contacted':
      return {
        ...base,
        background: 'rgba(16, 185, 129, 0.12)',
        color: '#10B981',
      };
    case 'callback required':
      return {
        ...base,
        background: 'rgba(96, 165, 250, 0.12)',
        color: '#60a5fa',
      };
    case 'no response':
      return {
        ...base,
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#f87171',
      };
    case 'pending':
    default:
      return {
        ...base,
        background: 'rgba(251, 191, 36, 0.1)',
        color: '#fbbf24',
      };
  }
}

/* ── Component Styles ─────────────────────────────────────────────────────── */

const pageWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
};

const headerSectionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '16px',
};

const pageTitleStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 800,
  color: '#EBE9E1',
  letterSpacing: '-0.03em',
  margin: '0 0 6px',
};

const pageSubtitleStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'rgba(235,233,225,0.5)',
  margin: 0,
};

const livePulseBadgeStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 14px',
  borderRadius: '20px',
  background: 'rgba(16, 185, 129, 0.1)',
  border: '1px solid rgba(16, 185, 129, 0.25)',
  fontSize: '11px',
  fontWeight: 800,
  letterSpacing: '0.08em',
  color: '#10B981',
};

const liveDotStyle: React.CSSProperties = {
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  background: '#10B981',
  boxShadow: '0 0 8px #10B981',
};

const statsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '20px',
};

const statCardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(16,185,129,0.18)',
  borderRadius: '16px',
  padding: '24px',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  color: 'rgba(235,233,225,0.45)',
};

const statValueRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '8px',
};

const statValueStyle: React.CSSProperties = {
  fontSize: '30px',
  fontWeight: 800,
  color: '#EBE9E1',
  letterSpacing: '-0.03em',
};

const revenueValueStyle: React.CSSProperties = {
  ...statValueStyle,
  color: '#10B981',
};

const confirmedValueStyle: React.CSSProperties = {
  ...statValueStyle,
  color: '#34d399',
};

const pendingValueStyle: React.CSSProperties = {
  ...statValueStyle,
  color: '#fbbf24',
};

const currencyPillStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#10B981',
  background: 'rgba(16,185,129,0.12)',
  padding: '2px 6px',
  borderRadius: '4px',
};

const ratePillStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#34d399',
  background: 'rgba(52,211,153,0.12)',
  padding: '2px 6px',
  borderRadius: '4px',
};

const statHelpTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'rgba(235,233,225,0.4)',
};

const tableCardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '18px',
  overflow: 'hidden',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
};

const tableHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '24px 28px',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  background: 'rgba(255,255,255,0.01)',
};

const tableTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#EBE9E1',
  margin: '0 0 4px',
};

const tableSubtitleStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'rgba(235,233,225,0.45)',
  margin: 0,
};

const rowCountBadgeStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: 'rgba(235,233,225,0.6)',
  background: 'rgba(255,255,255,0.05)',
  padding: '4px 10px',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.08)',
};

const errorBannerStyle: React.CSSProperties = {
  padding: '16px 28px',
  background: 'rgba(239,68,68,0.1)',
  color: '#f87171',
  fontSize: '13px',
  borderBottom: '1px solid rgba(239,68,68,0.2)',
};

const tableScrollContainerStyle: React.CSSProperties = {
  overflowX: 'auto',
  width: '100%',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
};

const tableHeadRowStyle: React.CSSProperties = {
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  background: 'rgba(0,0,0,0.2)',
};

const thStyle: React.CSSProperties = {
  padding: '14px 24px',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: 'rgba(235,233,225,0.4)',
  whiteSpace: 'nowrap',
};

const tableRowStyle: React.CSSProperties = {
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  transition: 'background 0.15s ease',
};

const tdStyle: React.CSSProperties = {
  padding: '18px 24px',
  verticalAlign: 'middle',
};

const clientNameStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#EBE9E1',
};

const clientEmailStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'rgba(235,233,225,0.5)',
  marginTop: '2px',
};

const clientPhoneStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'rgba(235,233,225,0.35)',
  marginTop: '2px',
};

const serviceBadgeStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 500,
  color: 'rgba(235,233,225,0.85)',
};

const amountStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#10B981',
};

const currencyStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'rgba(235,233,225,0.4)',
};

const emailSentStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#10B981',
};

const emailPendingStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'rgba(235,233,225,0.3)',
};

const dateStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'rgba(235,233,225,0.65)',
  whiteSpace: 'nowrap',
};

const orderIdStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'rgba(235,233,225,0.45)',
  fontFamily: "'JetBrains Mono', monospace",
  background: 'rgba(255,255,255,0.03)',
  padding: '3px 6px',
  borderRadius: '4px',
  border: '1px solid rgba(255,255,255,0.06)',
};

const emptyStateStyle: React.CSSProperties = {
  padding: '64px 24px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
};

const emptyIconStyle: React.CSSProperties = {
  fontSize: '36px',
  marginBottom: '4px',
};

const emptyTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#EBE9E1',
  margin: 0,
};

const emptyTextStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'rgba(235,233,225,0.45)',
  maxWidth: '420px',
  lineHeight: 1.6,
  margin: 0,
};
