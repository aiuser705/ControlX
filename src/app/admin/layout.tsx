import { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import SignOutButton from '@/components/dashboard/SignOutButton';

export const metadata = {
  title: 'Admin Console | Control X',
  description: 'Executive Control & Bookings Management',
};

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * Secure Admin Layout (Server Component)
 *
 * Enforces Zero-Trust authorization:
 * 1. Checks valid Supabase Auth session via getUser()
 * 2. Queries 'profiles' table to verify role === 'admin'
 * 3. Immediately redirects unauthorized visitors to home ('/')
 */
export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = createClient();

  // 1. Validate JWT session against Supabase Auth server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 2. Query user profile role
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, role')
    .eq('id', user.id)
    .single();

  // 3. Zero-Trust Access Gate: Only 'admin' role allowed
  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  // 4. Fetch unread messages count
  const adminSupabase = createAdminClient();
  const { count: unreadCount } = await adminSupabase
    .from('contact_messages')
    .select('id', { count: 'exact', head: true })
    .in('status', ['new', 'New']);

  return (
    <div style={wrapperStyle}>
      {/* Top Admin Navigation Bar */}
      <header style={headerStyle}>
        <div style={brandGroupStyle}>
          <Link href="/admin" style={brandLinkStyle}>
            <span style={brandXStyle}>X</span>
            <span style={brandTextStyle}>CONTROL</span>
          </Link>
          <span style={adminBadgeStyle}>ADMIN CONSOLE</span>
        </div>

        <nav style={navLinksStyle}>
          <Link href="/admin" style={navItemStyle}>
            Dashboard
          </Link>
          <Link href="/admin/bookings" style={navItemStyle}>
            Bookings
          </Link>
          <Link href="/admin/messages" style={{ ...navItemStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Messages</span>
            {unreadCount && unreadCount > 0 ? (
              <span style={unreadBadgeStyle}>
                {unreadCount}
              </span>
            ) : null}
          </Link>
          <Link href="/admin/blocked-customers" style={navItemStyle}>
            Blocked
          </Link>
          <Link href="/" target="_blank" style={navExternalLinkStyle}>
            Live Site ↗
          </Link>
        </nav>

        <div style={userActionGroupStyle}>
          <div style={userInfoStyle}>
            <span style={userDotStyle} />
            <span style={userEmailStyle}>{profile.email || user.email}</span>
          </div>
          <SignOutButton />
        </div>
      </header>

      {/* Main Admin View Container */}
      <div style={contentContainerStyle}>{children}</div>
    </div>
  );
}

/* ── Layout Styles ────────────────────────────────────────────────────────── */

const wrapperStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at 30% 10%, #0d2818 0%, #050f08 55%, #020705 100%)',
  color: '#EBE9E1',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 36px',
  borderBottom: '1px solid rgba(16,185,129,0.15)',
  background: 'rgba(2, 7, 5, 0.75)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
};

const brandGroupStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const brandLinkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  textDecoration: 'none',
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
  color: '#EBE9E1',
};

const adminBadgeStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 800,
  letterSpacing: '0.08em',
  padding: '3px 8px',
  borderRadius: '6px',
  background: 'rgba(251, 191, 36, 0.15)',
  color: '#fbbf24',
  border: '1px solid rgba(251, 191, 36, 0.35)',
};

const navLinksStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '24px',
};

const navItemStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: 'rgba(235,233,225,0.65)',
  textDecoration: 'none',
  transition: 'color 0.2s',
  padding: '6px 12px',
  borderRadius: '6px',
};

const navItemActiveStyle: React.CSSProperties = {
  ...navItemStyle,
  color: '#10B981',
  background: 'rgba(16,185,129,0.1)',
  border: '1px solid rgba(16,185,129,0.2)',
};

const navExternalLinkStyle: React.CSSProperties = {
  ...navItemStyle,
  color: 'rgba(235,233,225,0.4)',
  fontSize: '12px',
};

const userActionGroupStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const userInfoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 12px',
  background: 'rgba(255,255,255,0.03)',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.06)',
};

const userDotStyle: React.CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: '#10B981',
  boxShadow: '0 0 8px #10B981',
};

const userEmailStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'rgba(235,233,225,0.75)',
  fontWeight: 500,
};

const contentContainerStyle: React.CSSProperties = {
  flex: 1,
  width: '100%',
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '36px 24px 60px',
};

const unreadBadgeStyle: React.CSSProperties = {
  background: '#ef4444',
  color: '#fff',
  fontSize: '10px',
  fontWeight: 800,
  padding: '2px 6px',
  borderRadius: '10px',
  lineHeight: '12px',
  boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)',
};
