import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SignOutButton from '@/components/dashboard/SignOutButton';
import BookConsultationButton from '@/components/dashboard/BookConsultationButton';

/**
 * /dashboard — Secure Server Component
 *
 * Data fetching happens entirely on the server — the JWT is never
 * sent to the browser. The middleware already blocks unauthenticated
 * users, but we call getUser() here as a defence-in-depth backup.
 */
export default async function DashboardPage() {
  const supabase = createClient();

  // Always use getUser() on the server — validates JWT with Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Hard redirect if session somehow slipped past middleware
  if (!user) {
    redirect('/login');
  }

  // Fetch the profile row created by the handle_new_user trigger
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, role')
    .eq('id', user.id)
    .single();

  const displayEmail = profile?.email ?? user.email ?? 'Unknown';
  const displayRole = profile?.role ?? 'user';

  return (
    <div style={wrapperStyle}>
      {/* Top navigation bar */}
      <header style={headerStyle}>
        <div style={brandStyle}>
          <span style={brandXStyle}>X</span>
          <span style={brandTextStyle}>CONTROL</span>
        </div>
        <SignOutButton />
      </header>

      {/* Main content */}
      <main style={mainStyle}>
        {/* Welcome card */}
        <div style={cardStyle}>
          <div style={avatarStyle}>
            {displayEmail.charAt(0).toUpperCase()}
          </div>

          <div>
            <p style={labelStyle}>SIGNED IN AS</p>
            <h1 style={titleStyle}>Welcome back</h1>
            <p style={emailStyle}>{displayEmail}</p>
          </div>

          <div style={dividerStyle} />

          {/* Role badge */}
          <div style={metaRowStyle}>
            <span style={metaLabelStyle}>Role</span>
            <span style={roleBadgeStyle(displayRole)}>{displayRole}</span>
          </div>

          <div style={metaRowStyle}>
            <span style={metaLabelStyle}>User ID</span>
            <code style={codeStyle}>{user.id}</code>
          </div>
        </div>

        {/* Placeholder notice */}
        <div style={noticeStyle}>
          <span style={noticeIconStyle}>🚧</span>
          <p style={noticeTextStyle}>
            Full dashboard panels are coming soon. Admin features, analytics,
            and project management will be available here.
          </p>
        </div>

        {/* Book Consultation */}
        <BookConsultationButton />
      </main>
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────────── */

const wrapperStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at 30% 20%, #0d2818 0%, #050f08 60%, #020705 100%)',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 40px',
  borderBottom: '1px solid rgba(16,185,129,0.12)',
  background: 'rgba(0,0,0,0.2)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
};

const brandStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
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
  textTransform: 'uppercase' as const,
};

const mainStyle: React.CSSProperties = {
  maxWidth: '520px',
  margin: '60px auto',
  padding: '0 24px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '20px',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(16,185,129,0.18)',
  borderRadius: '20px',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  padding: '40px',
  boxShadow: '0 24px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '16px',
};

const avatarStyle: React.CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #0F8259 0%, #10B981 100%)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '26px',
  fontWeight: 800,
  boxShadow: '0 0 32px rgba(16,185,129,0.3)',
  marginBottom: '4px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.12em',
  color: 'rgba(235,233,225,0.35)',
  margin: '0 0 4px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 800,
  color: '#EBE9E1',
  margin: '0 0 4px',
  letterSpacing: '-0.03em',
};

const emailStyle: React.CSSProperties = {
  fontSize: '15px',
  color: '#10B981',
  margin: 0,
  fontWeight: 500,
};

const dividerStyle: React.CSSProperties = {
  height: '1px',
  background: 'rgba(255,255,255,0.07)',
  margin: '4px 0',
};

const metaRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
};

const metaLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.06em',
  color: 'rgba(235,233,225,0.45)',
  textTransform: 'uppercase' as const,
};

const roleBadgeStyle = (role: string): React.CSSProperties => ({
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  padding: '3px 10px',
  borderRadius: '6px',
  background:
    role === 'admin'
      ? 'rgba(251,191,36,0.15)'
      : role === 'client'
      ? 'rgba(16,185,129,0.15)'
      : 'rgba(148,163,184,0.12)',
  color:
    role === 'admin' ? '#fbbf24' : role === 'client' ? '#10B981' : '#94a3b8',
  border: `1px solid ${
    role === 'admin'
      ? 'rgba(251,191,36,0.3)'
      : role === 'client'
      ? 'rgba(16,185,129,0.3)'
      : 'rgba(148,163,184,0.2)'
  }`,
});

const codeStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'rgba(235,233,225,0.4)',
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  letterSpacing: '0.02em',
};

const noticeStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  padding: '16px 20px',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '12px',
};

const noticeIconStyle: React.CSSProperties = {
  fontSize: '18px',
  flexShrink: 0,
  marginTop: '1px',
};

const noticeTextStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'rgba(235,233,225,0.45)',
  lineHeight: 1.6,
  margin: 0,
};
