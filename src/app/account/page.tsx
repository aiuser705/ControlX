import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SignOutButton from '@/components/dashboard/SignOutButton';
import BookConsultationButton from '@/components/dashboard/BookConsultationButton';

export const metadata = {
  title: 'Client Dashboard & Account | Control X',
  description: 'Manage your active consultations, booking history, and project inquiries on Control X.',
};

interface BookingRow {
  id: string;
  service_name: string;
  amount: number | string;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: string;
  booking_status?: string | null;
  contact_status?: string | null;
  created_at: string;
}

interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
}

export default async function AccountPage() {
  const supabase = createClient();

  // 1. Validate authenticated session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/account');
  }

  // 2. Fetch User Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 3. Fetch User's Bookings
  const { data: rawBookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const bookings: BookingRow[] = rawBookings || [];

  // 4. Fetch User's Contact Messages (if any sent with this email)
  const { data: rawMessages } = await supabase
    .from('contact_messages')
    .select('*')
    .eq('email', user.email)
    .order('created_at', { ascending: false });

  const contactMessages: ContactMessageRow[] = rawMessages || [];

  // 5. Derive Analytics & Metrics
  const fullName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'Executive';
  
  const firstName = fullName.split(' ')[0];
  const userInitial = firstName.charAt(0).toUpperCase();
  const displayRole = profile?.role === 'admin' ? 'Admin' : 'Executive Client';

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(
    (b) =>
      b.status === 'confirmed' &&
      (b.booking_status === 'Confirmed' || !b.booking_status)
  );
  const completedBookings = bookings.filter((b) => b.booking_status === 'Completed');
  const totalSpend = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + Number(b.amount || 0), 0);

  const totalInquiries = contactMessages.length;
  const latestPhone = bookings[0]?.customer_phone || '';

  const memberSince = new Date(user.created_at || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="account-layout">
      {/* ── TOP HEADER / NAVBAR ────────────────────────────────────────── */}
      <header className="account-topbar">
        <div className="account-topbar__left">
          <Link href="/" className="account-brand" title="Back to Control X Home">
            <Image
              src="/assets/nav-logo-x.png"
              alt="Control X mark"
              width={28}
              height={22}
              style={{ objectFit: 'contain' }}
              priority
            />
            <span className="account-brand__text">CONTROL <span className="account-brand__sub">CLIENT PORTAL</span></span>
          </Link>
        </div>

        {/* Center Search / Action Bar */}
        <div className="account-topbar__search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search consultations, bookings, invoices..."
            readOnly
            className="account-search-input"
          />
          <span className="account-kbd-shortcut">⌘ K</span>
        </div>

        {/* Right Actions: Navigation Links & User Avatar */}
        <div className="account-topbar__right">
          <Link href="/#contact" className="account-topbar__btn account-topbar__btn--ghost">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>Email Inquiry</span>
          </Link>

          <Link href="#priority-call" className="account-topbar__btn account-topbar__btn--emerald">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>Priority Call</span>
          </Link>

          <div className="account-user-pill">
            <div className="account-avatar">{userInitial}</div>
            <div className="account-user-pill__text">
              <span className="account-user-pill__name">{firstName}</span>
              <span className="account-user-pill__role">{displayRole}</span>
            </div>
          </div>

          <SignOutButton />
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ────────────────────────────────────── */}
      <main className="account-main">
        {/* 1. HERO GREETING BANNER */}
        <section className="account-hero">
          <div className="account-hero__content">
            <div className="account-hero__badge">
              <span className="account-hero__badge-dot" />
              <span>Executive Portal · Active Session</span>
            </div>
            <h1 className="account-hero__title">
              Welcome back, {firstName} <span className="wave-emoji">👋</span>
            </h1>
            <p className="account-hero__subtitle">
              Here is the live status of your consultations, active priority calls, and project inquiries.
            </p>
          </div>

          <div className="account-hero__meta">
            <div className="account-hero__meta-item">
              <span className="account-hero__meta-label">Account Email</span>
              <span className="account-hero__meta-val">{user.email}</span>
            </div>
            <div className="account-hero__meta-item">
              <span className="account-hero__meta-label">Member Since</span>
              <span className="account-hero__meta-val">{memberSince}</span>
            </div>
            {profile?.role === 'admin' && (
              <Link href="/admin" className="account-hero__admin-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
                </svg>
                <span>Open Admin CRM →</span>
              </Link>
            )}
          </div>
        </section>

        {/* 2. STATS & METRICS OVERVIEW (4 Cards) */}
        <section className="account-stats-grid">
          {/* Stat 1: Total Consultations */}
          <div className="stat-card">
            <div className="stat-card__top">
              <div className="stat-card__icon-box stat-card__icon-box--blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
                </svg>
              </div>
              <span className="stat-card__tag stat-card__tag--neutral">Total Sessions</span>
            </div>
            <div className="stat-card__value">{totalBookings}</div>
            <p className="stat-card__label">Consultation Bookings</p>
            <div className="stat-card__footer">
              <span className="stat-card__subtext">
                {completedBookings.length} completed · {totalBookings - completedBookings.length} pending
              </span>
            </div>
          </div>

          {/* Stat 2: Active Priority Calls */}
          <div className="stat-card stat-card--highlight">
            <div className="stat-card__top">
              <div className="stat-card__icon-box stat-card__icon-box--emerald">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <span className="stat-card__tag stat-card__tag--emerald">Active Priority</span>
            </div>
            <div className="stat-card__value">{activeBookings.length}</div>
            <p className="stat-card__label">Confirmed 1-on-1 Calls</p>
            <div className="stat-card__footer">
              <span className="stat-card__subtext stat-card__subtext--emerald">
                ⚡ Instant leadership routing
              </span>
            </div>
          </div>

          {/* Stat 3: Total Investment */}
          <div className="stat-card">
            <div className="stat-card__top">
              <div className="stat-card__icon-box stat-card__icon-box--green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="stat-card__tag stat-card__tag--neutral">Invoiced</span>
            </div>
            <div className="stat-card__value">₹{totalSpend.toLocaleString('en-IN')}</div>
            <p className="stat-card__label">Confirmed Investment</p>
            <div className="stat-card__footer">
              <span className="stat-card__subtext">
                ✓ 256-bit encrypted checkout
              </span>
            </div>
          </div>

          {/* Stat 4: Free Email Inquiries */}
          <div className="stat-card">
            <div className="stat-card__top">
              <div className="stat-card__icon-box stat-card__icon-box--purple">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <span className="stat-card__tag stat-card__tag--neutral">Inbox</span>
            </div>
            <div className="stat-card__value">{totalInquiries}</div>
            <p className="stat-card__label">Free Project Inquiries</p>
            <div className="stat-card__footer">
              <span className="stat-card__subtext">
                {totalInquiries > 0 ? 'Messages logged in CRM' : 'No inquiries submitted'}
              </span>
            </div>
          </div>
        </section>

        {/* 3. TWO COMMUNICATION OPTIONS (EMAIL FREE vs PRIORITY CALL PAID) */}
        <section className="comm-section" id="priority-call">
          <div className="section-header">
            <div>
              <span className="section-header__tag">COMMUNICATION CHANNELS</span>
              <h2 className="section-header__title">Choose How You Would Like to Connect</h2>
            </div>
            <p className="section-header__desc">
              Whether exploring a new project or seeking an immediate 1-on-1 strategy call with leadership, select your preferred engagement tier.
            </p>
          </div>

          <div className="comm-grid">
            {/* ── OPTION 1: EMAIL — FREE ───────────────────────────────────── */}
            <div className="comm-card comm-card--free">
              <div className="comm-card__badge-row">
                <span className="comm-badge comm-badge--free">EMAIL · 100% FREE</span>
                <span className="comm-badge comm-badge--status">General Inquiries</span>
              </div>

              <div className="comm-card__header">
                <div className="comm-card__icon-wrap comm-card__icon-wrap--free">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <h3 className="comm-card__title">Email Us — Free Consultation</h3>
                  <p className="comm-card__price-tag">₹0 <span className="comm-card__price-sub">/ Free Consultation by Email</span></p>
                </div>
              </div>

              <p className="comm-card__summary">
                Have an idea, scope questions, or need a digital project built? Send us an inquiry. Our engineering directors will evaluate your requirements and respond directly.
              </p>

              <div className="comm-card__features">
                <div className="comm-feature">
                  <span className="comm-feature__check">✓</span>
                  <span><strong>Comprehensive Scope Review:</strong> Share your vision, deliverables, or technical questions.</span>
                </div>
                <div className="comm-feature">
                  <span className="comm-feature__check">✓</span>
                  <span><strong>Stack & Architecture Feasibility:</strong> Expert insights on frameworks, timelines, and budgets.</span>
                </div>
                <div className="comm-feature">
                  <span className="comm-feature__check">✓</span>
                  <span><strong>24-Hour Reply:</strong> Direct email communication from our core engineering team.</span>
                </div>
              </div>

              <div className="comm-card__action">
                <Link href="/#contact" className="comm-btn comm-btn--free">
                  <span>Send Free Email Inquiry</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <p className="comm-card__action-note">
                  Opens the official Control X contact form · Saved directly to your CRM message history
                </p>
              </div>
            </div>

            {/* ── OPTION 2: PRIORITY CALL — PAID ──────────────────────────── */}
            <div className="comm-card comm-card--paid">
              <div className="comm-card__badge-row">
                <span className="comm-badge comm-badge--paid">PRIORITY · PAID SESSION</span>
                <span className="comm-badge comm-badge--fast">⚡ Expedited Queue</span>
              </div>

              <div className="comm-card__header">
                <div className="comm-card__icon-wrap comm-card__icon-wrap--paid">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="comm-card__title">Priority Call — Direct Strategy Session</h3>
                  <p className="comm-card__price-tag">₹5,000 <span className="comm-card__price-sub">/ 1-Hour Guaranteed 1-on-1 Session</span></p>
                </div>
              </div>

              <p className="comm-card__summary">
                Designed for serious clients who want faster attention, priority communication, and a dedicated 1-on-1 strategy call with Control X leadership.
              </p>

              <div className="comm-card__features">
                <div className="comm-feature">
                  <span className="comm-feature__check comm-feature__check--emerald">⚡</span>
                  <span><strong>Guaranteed 1-Hour Strategy Session:</strong> Private video consultation with founders & leadership.</span>
                </div>
                <div className="comm-feature">
                  <span className="comm-feature__check comm-feature__check--emerald">⚡</span>
                  <span><strong>Direct Priority Scheduling:</strong> Instant Telegram notification dispatch and expedited calendar booking.</span>
                </div>
                <div className="comm-feature">
                  <span className="comm-feature__check comm-feature__check--emerald">⚡</span>
                  <span><strong>Dedicated Architecture & Budget Roadmap:</strong> Deep technical review tailored specifically to your goals.</span>
                </div>
              </div>

              <div className="comm-card__action">
                <BookConsultationButton
                  defaultName={fullName}
                  defaultEmail={user.email || ''}
                  defaultPhone={latestPhone}
                  customTriggerLabel="Book Priority Call — ₹5,000"
                  badgeLabel="Priority Executive Strategy Call"
                  description="Direct 1-on-1 strategy session with Control X leadership. Immediate scheduling priority & dedicated discussion."
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4. ACTIVE CONSULTATIONS & SESSIONS */}
        {activeBookings.length > 0 && (
          <section className="account-section">
            <div className="section-header">
              <div>
                <span className="section-header__tag section-header__tag--emerald">ACTIVE CALLS</span>
                <h2 className="section-header__title">Your Confirmed Priority Consultations</h2>
              </div>
              <p className="section-header__desc">
                Our executive team is currently assigned to these active consultation bookings.
              </p>
            </div>

            <div className="active-bookings-grid">
              {activeBookings.map((b) => (
                <div key={b.id} className="active-card">
                  <div className="active-card__header">
                    <div>
                      <span className="active-card__ref">BOOKING ID: #{b.id.slice(0, 8).toUpperCase()}</span>
                      <h3 className="active-card__service">{b.service_name}</h3>
                    </div>
                    <span className="status-pill status-pill--confirmed">
                      <span className="pulse-dot" /> Confirmed
                    </span>
                  </div>

                  <div className="active-card__grid">
                    <div className="active-card__detail">
                      <span className="detail-label">Client Name</span>
                      <span className="detail-val">{b.customer_name}</span>
                    </div>
                    <div className="active-card__detail">
                      <span className="detail-label">Contact Phone</span>
                      <span className="detail-val">{b.customer_phone || '—'}</span>
                    </div>
                    <div className="active-card__detail">
                      <span className="detail-label">Amount Paid</span>
                      <span className="detail-val detail-val--emerald">
                        ₹{Number(b.amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="active-card__detail">
                      <span className="detail-label">Contact Status</span>
                      <span className="detail-val">
                        <span className={`badge-contact badge-contact--${(b.contact_status || 'Pending').toLowerCase().replace(/\s+/g, '-')}`}>
                          {b.contact_status || 'Pending'}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="active-card__footer">
                    <span>
                      📅 Booked on {new Date(b.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="active-card__note">
                      ✓ Telegram alert confirmed & leadership assigned
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. ALL BOOKING HISTORY TABLE */}
        <section className="account-section">
          <div className="section-header">
            <div>
              <span className="section-header__tag">TRANSACTION LEDGER</span>
              <h2 className="section-header__title">Consultation & Booking History</h2>
            </div>
            <span className="section-header__counter">Total: {totalBookings}</span>
          </div>

          {totalBookings === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">🗓</div>
              <h3 className="empty-state__title">No bookings yet</h3>
              <p className="empty-state__text">
                You haven’t booked any consultations yet. Choose between a <strong>Free Email Inquiry</strong> or a <strong>Priority Call</strong> above to get started.
              </p>
              <Link href="#priority-call" className="comm-btn comm-btn--free" style={{ maxWidth: '240px', margin: '16px auto 0' }}>
                View Options ↑
              </Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="account-table">
                <thead>
                  <tr>
                    <th>BOOKING REF</th>
                    <th>SERVICE</th>
                    <th>AMOUNT</th>
                    <th>PAYMENT STATUS</th>
                    <th>CALL STATUS</th>
                    <th>CONTACT STAGE</th>
                    <th>DATE (IST)</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const isPaid = b.status === 'confirmed';
                    const isDraft = b.status === 'draft' || b.status === 'pending_payment';
                    const bookingStatus = b.booking_status || (isPaid ? 'Confirmed' : 'Draft');

                    return (
                      <tr key={b.id}>
                        <td>
                          <code className="booking-code">#{b.id.slice(0, 8).toUpperCase()}</code>
                        </td>
                        <td>
                          <span className="service-cell">{b.service_name}</span>
                        </td>
                        <td>
                          <span className="amount-cell">₹{Number(b.amount).toLocaleString('en-IN')}</span>
                        </td>
                        <td>
                          <span className={`badge-payment badge-payment--${b.status}`}>
                            {b.status === 'confirmed' ? '✓ Paid' : b.status}
                          </span>
                        </td>
                        <td>
                          <span className={`badge-booking badge-booking--${bookingStatus.toLowerCase()}`}>
                            {bookingStatus}
                          </span>
                        </td>
                        <td>
                          <span className="badge-contact-text">
                            {b.contact_status || (isPaid ? 'Pending' : '—')}
                          </span>
                        </td>
                        <td>
                          <span className="date-cell">
                            {new Date(b.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 6. FREE INQUIRIES SUBMISSION HISTORY (If any) */}
        {contactMessages.length > 0 && (
          <section className="account-section">
            <div className="section-header">
              <div>
                <span className="section-header__tag">MESSAGE INBOX</span>
                <h2 className="section-header__title">Your Free Email Inquiries</h2>
              </div>
              <span className="section-header__counter">Total: {contactMessages.length}</span>
            </div>

            <div className="inquiry-list">
              {contactMessages.map((msg) => (
                <div key={msg.id} className="inquiry-card">
                  <div className="inquiry-card__top">
                    <div>
                      <span className="inquiry-card__name">From: {msg.name} ({msg.email})</span>
                      <span className="inquiry-card__date">
                        📅 Submitted on {new Date(msg.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <span className={`status-pill status-pill--${msg.status}`}>
                      Status: {msg.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="inquiry-card__message">&quot;{msg.message}&quot;</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. ACCOUNT PROFILE & CREDENTIALS CARD */}
        <section className="account-section">
          <div className="section-header">
            <div>
              <span className="section-header__tag">SECURITY & PROFILE</span>
              <h2 className="section-header__title">Account Information</h2>
            </div>
          </div>

          <div className="profile-card">
            <div className="profile-card__grid">
              <div className="profile-card__item">
                <span className="profile-card__label">Full Name</span>
                <span className="profile-card__val">{fullName}</span>
              </div>
              <div className="profile-card__item">
                <span className="profile-card__label">Authenticated Email</span>
                <span className="profile-card__val">{user.email}</span>
              </div>
              <div className="profile-card__item">
                <span className="profile-card__label">Account Role</span>
                <span className="profile-card__val profile-card__val--badge">{displayRole}</span>
              </div>
              <div className="profile-card__item">
                <span className="profile-card__label">Contact Phone</span>
                <span className="profile-card__val">{latestPhone || 'Not specified'}</span>
              </div>
              <div className="profile-card__item">
                <span className="profile-card__label">Supabase Account UID</span>
                <code className="profile-card__code">{user.id}</code>
              </div>
              <div className="profile-card__item">
                <span className="profile-card__label">Security Status</span>
                <span className="profile-card__val" style={{ color: '#10B981' }}>
                  ✓ RLS Protected & Encrypted Session
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER OUTRO ──────────────────────────────────────────────── */}
      <footer className="account-footer">
        <div className="account-footer__container">
          <span>&copy; {new Date().getFullYear()} CONTROL X. All rights reserved.</span>
          <span className="account-footer__tech">Precision Digital Engineering & Physical Optics</span>
        </div>
      </footer>

      {/* ── SCOPED CSS FOR ACCOUNT PORTAL ──────────────────────────────── */}
      <style>{`
        .account-layout {
          min-height: 100vh;
          background: #030806;
          background-image: 
            radial-gradient(circle at 15% 15%, rgba(15, 130, 89, 0.12) 0%, transparent 45%),
            radial-gradient(circle at 85% 85%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
            linear-gradient(180deg, #030705 0%, #06110b 50%, #030705 100%);
          color: #EBE9E1;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── TOPBAR ─────────────────────────────────────────────────────── */
        .account-topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 36px;
          background: rgba(3, 8, 6, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(16, 185, 129, 0.15);
          gap: 20px;
        }

        .account-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #ffffff;
        }

        .account-brand__text {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .account-brand__sub {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: #10B981;
          background: rgba(16, 185, 129, 0.12);
          padding: 2px 7px;
          border-radius: 4px;
          margin-left: 6px;
          border: 1px solid rgba(16, 185, 129, 0.25);
        }

        .account-topbar__search {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 8px 16px;
          width: 380px;
          color: rgba(235, 233, 225, 0.5);
          transition: border-color 0.2s;
        }
        .account-topbar__search:focus-within {
          border-color: rgba(16, 185, 129, 0.4);
        }

        .account-search-input {
          background: transparent;
          border: none;
          outline: none;
          color: #EBE9E1;
          font-size: 13px;
          width: 100%;
          font-family: inherit;
        }
        .account-search-input::placeholder {
          color: rgba(235, 233, 225, 0.4);
        }

        .account-kbd-shortcut {
          font-size: 11px;
          font-family: monospace;
          background: rgba(255, 255, 255, 0.08);
          padding: 2px 6px;
          border-radius: 4px;
          color: rgba(235, 233, 225, 0.6);
        }

        .account-topbar__right {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .account-topbar__btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 12.5px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .account-topbar__btn--ghost {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #EBE9E1;
        }
        .account-topbar__btn--ghost:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .account-topbar__btn--emerald {
          background: linear-gradient(135deg, #0F8259 0%, #10B981 100%);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
        }
        .account-topbar__btn--emerald:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(16, 185, 129, 0.35);
        }

        .account-user-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 12px 4px 5px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 999px;
        }

        .account-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0F8259 0%, #10B981 100%);
          color: #fff;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .account-user-pill__text {
          display: flex;
          flex-direction: column;
        }

        .account-user-pill__name {
          font-size: 12.5px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
        }

        .account-user-pill__role {
          font-size: 10.5px;
          color: #10B981;
          font-weight: 500;
        }

        /* ── MAIN CONTENT ───────────────────────────────────────────────── */
        .account-main {
          flex: 1;
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          padding: 36px 32px 80px;
          display: flex;
          flex-direction: column;
          gap: 40px;
          box-sizing: border-box;
        }

        /* ── HERO BANNER ────────────────────────────────────────────────── */
        .account-hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 32px;
          background: linear-gradient(135deg, rgba(15, 130, 89, 0.16) 0%, rgba(6, 17, 11, 0.85) 100%);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 24px;
          backdrop-filter: blur(20px);
          box-shadow: 0 16px 50px rgba(0, 0, 0, 0.35);
          flex-wrap: wrap;
          gap: 24px;
        }

        .account-hero__badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 999px;
          color: #10B981;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .account-hero__badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 8px #10B981;
        }

        .account-hero__title {
          font-size: 32px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.02em;
          margin: 0 0 8px;
        }

        .wave-emoji {
          display: inline-block;
          animation: wave 2.2s infinite;
          transform-origin: 70% 70%;
        }

        @keyframes wave {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }

        .account-hero__subtitle {
          font-size: 14.5px;
          color: rgba(235, 233, 225, 0.65);
          max-width: 600px;
          margin: 0;
          line-height: 1.5;
        }

        .account-hero__meta {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .account-hero__meta-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
        }

        .account-hero__meta-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: rgba(235, 233, 225, 0.45);
        }

        .account-hero__meta-val {
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
        }

        .account-hero__admin-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.4);
          border-radius: 12px;
          color: #fbbf24;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .account-hero__admin-btn:hover {
          background: rgba(245, 158, 11, 0.25);
          transform: translateY(-1px);
        }

        /* ── STATS GRID ─────────────────────────────────────────────────── */
        .account-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          backdrop-filter: blur(14px);
          transition: transform 0.24s ease, border-color 0.24s ease;
        }
        .stat-card:hover {
          transform: translateY(-3px);
          border-color: rgba(16, 185, 129, 0.25);
        }

        .stat-card--highlight {
          background: linear-gradient(135deg, rgba(15, 130, 89, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .stat-card__top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .stat-card__icon-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-card__icon-box--blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
        .stat-card__icon-box--emerald { background: rgba(16, 185, 129, 0.18); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.35); }
        .stat-card__icon-box--green { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
        .stat-card__icon-box--purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }

        .stat-card__tag {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          letter-spacing: 0.03em;
        }
        .stat-card__tag--neutral { background: rgba(255, 255, 255, 0.06); color: rgba(235, 233, 225, 0.6); }
        .stat-card__tag--emerald { background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.3); }

        .stat-card__value {
          font-size: 28px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }

        .stat-card__label {
          font-size: 13px;
          color: rgba(235, 233, 225, 0.55);
          margin: 0 0 16px;
        }

        .stat-card__footer {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 12px;
          margin-top: auto;
        }

        .stat-card__subtext {
          font-size: 12px;
          color: rgba(235, 233, 225, 0.45);
        }
        .stat-card__subtext--emerald {
          color: #10B981;
          font-weight: 600;
        }

        /* ── SECTION HEADERS ────────────────────────────────────────────── */
        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .section-header__tag {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #10B981;
          display: block;
          margin-bottom: 4px;
        }

        .section-header__tag--emerald {
          color: #10B981;
        }

        .section-header__title {
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .section-header__desc {
          font-size: 13.5px;
          color: rgba(235, 233, 225, 0.55);
          max-width: 520px;
          margin: 0;
        }

        .section-header__counter {
          font-size: 12.5px;
          font-weight: 600;
          color: rgba(235, 233, 225, 0.45);
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 12px;
          border-radius: 999px;
        }

        /* ── TWO COMMUNICATION CARDS (FREE vs PAID) ─────────────────────── */
        .comm-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 28px;
        }

        .comm-card {
          border-radius: 24px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          position: relative;
          backdrop-filter: blur(20px);
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease;
        }
        .comm-card:hover {
          transform: translateY(-4px);
        }

        /* Free Card: Sleek Platinum/Graphite with Emerald Accents */
        .comm-card--free {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
        }
        .comm-card--free:hover {
          border-color: rgba(255, 255, 255, 0.22);
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);
        }

        /* Paid Card: Rich Obsidian Emerald with Glowing Aura */
        .comm-card--paid {
          background: linear-gradient(145deg, rgba(15, 130, 89, 0.16) 0%, rgba(5, 15, 10, 0.85) 100%);
          border: 1px solid rgba(16, 185, 129, 0.35);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 0 30px rgba(16, 185, 129, 0.1);
        }
        .comm-card--paid:hover {
          border-color: rgba(16, 185, 129, 0.55);
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.5), 0 0 40px rgba(16, 185, 129, 0.18);
        }

        .comm-card__badge-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .comm-badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 4px 10px;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .comm-badge--free {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .comm-badge--status {
          background: rgba(255, 255, 255, 0.04);
          color: rgba(235, 233, 225, 0.5);
        }
        .comm-badge--paid {
          background: rgba(16, 185, 129, 0.2);
          color: #10B981;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }
        .comm-badge--fast {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .comm-card__header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }

        .comm-card__icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .comm-card__icon-wrap--free {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .comm-card__icon-wrap--paid {
          background: rgba(16, 185, 129, 0.2);
          color: #10B981;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }

        .comm-card__title {
          font-size: 20px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 4px;
          letter-spacing: -0.02em;
        }

        .comm-card__price-tag {
          font-size: 22px;
          font-weight: 800;
          color: #10B981;
          margin: 0;
        }
        .comm-card__price-sub {
          font-size: 12px;
          font-weight: 500;
          color: rgba(235, 233, 225, 0.5);
        }

        .comm-card__summary {
          font-size: 13.5px;
          color: rgba(235, 233, 225, 0.7);
          line-height: 1.6;
          margin: 0 0 22px;
        }

        .comm-card__features {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 28px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 18px 0;
        }

        .comm-feature {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          color: rgba(235, 233, 225, 0.8);
          line-height: 1.45;
        }

        .comm-feature strong {
          color: #ffffff;
        }

        .comm-feature__check {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-size: 10px;
          font-weight: 800;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .comm-feature__check--emerald {
          background: rgba(16, 185, 129, 0.2);
          color: #10B981;
        }

        .comm-card__action {
          margin-top: auto;
        }

        .comm-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 14px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.22s ease;
          box-sizing: border-box;
        }

        .comm-btn--free {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }
        .comm-btn--free:hover {
          background: rgba(255, 255, 255, 0.16);
          border-color: rgba(255, 255, 255, 0.35);
          transform: translateY(-1px);
        }

        .comm-card__action-note {
          font-size: 11.5px;
          color: rgba(235, 233, 225, 0.4);
          text-align: center;
          margin: 10px 0 0;
        }

        /* ── ACTIVE BOOKINGS GRID ───────────────────────────────────────── */
        .active-bookings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 20px;
        }

        .active-card {
          background: linear-gradient(135deg, rgba(15, 130, 89, 0.15) 0%, rgba(255, 255, 255, 0.02) 100%);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          backdrop-filter: blur(16px);
        }

        .active-card__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .active-card__ref {
          font-size: 11px;
          font-family: monospace;
          color: rgba(235, 233, 225, 0.5);
          letter-spacing: 0.05em;
        }

        .active-card__service {
          font-size: 17px;
          font-weight: 700;
          color: #ffffff;
          margin: 2px 0 0;
        }

        .active-card__grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          background: rgba(0, 0, 0, 0.3);
          padding: 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .detail-label {
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: rgba(235, 233, 225, 0.45);
          display: block;
          margin-bottom: 2px;
        }

        .detail-val {
          font-size: 13.5px;
          font-weight: 600;
          color: #EBE9E1;
        }
        .detail-val--emerald {
          color: #10B981;
          font-weight: 700;
        }

        .active-card__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11.5px;
          color: rgba(235, 233, 225, 0.45);
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          flex-wrap: wrap;
          gap: 8px;
        }

        .active-card__note {
          color: #10B981;
          font-weight: 600;
        }

        /* ── TABLE STYLES ───────────────────────────────────────────────── */
        .table-wrapper {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          overflow-x: auto;
          backdrop-filter: blur(14px);
        }

        .account-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 13px;
        }

        .account-table th {
          padding: 14px 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: rgba(235, 233, 225, 0.45);
          background: rgba(0, 0, 0, 0.25);
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          white-space: nowrap;
        }

        .account-table td {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          color: rgba(235, 233, 225, 0.85);
          white-space: nowrap;
        }

        .account-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }

        .booking-code {
          font-family: monospace;
          font-size: 12px;
          color: #10B981;
          background: rgba(16, 185, 129, 0.1);
          padding: 3px 6px;
          border-radius: 4px;
        }

        .service-cell {
          font-weight: 600;
          color: #ffffff;
        }

        .amount-cell {
          font-weight: 700;
          color: #10B981;
        }

        .date-cell {
          color: rgba(235, 233, 225, 0.5);
          font-size: 12px;
        }

        /* ── STATUS PILLS & BADGES ──────────────────────────────────────── */
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 700;
        }

        .status-pill--confirmed {
          background: rgba(16, 185, 129, 0.15);
          color: #10B981;
          border: 1px solid rgba(16, 185, 129, 0.35);
        }

        .status-pill--new {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .status-pill--read {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        .status-pill--replied {
          background: rgba(16, 185, 129, 0.15);
          color: #10B981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 8px #10B981;
          animation: pulse 1.6s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }

        .badge-payment {
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .badge-payment--confirmed { background: rgba(16, 185, 129, 0.15); color: #10B981; }
        .badge-payment--draft { background: rgba(255, 255, 255, 0.08); color: rgba(235, 233, 225, 0.6); }
        .badge-payment--failed { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

        .badge-booking {
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
        }
        .badge-booking--confirmed { background: rgba(16, 185, 129, 0.12); color: #10B981; }
        .badge-booking--completed { background: rgba(59, 130, 246, 0.12); color: #60a5fa; }
        .badge-booking--cancelled { background: rgba(239, 68, 68, 0.12); color: #f87171; }

        .badge-contact {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }
        .badge-contact--not-contacted { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
        .badge-contact--contacted { background: rgba(16, 185, 129, 0.15); color: #10B981; }
        .badge-contact--pending { background: rgba(255, 255, 255, 0.08); color: rgba(235, 233, 225, 0.7); }

        .badge-contact-text {
          font-size: 12px;
          color: rgba(235, 233, 225, 0.65);
        }

        /* ── INQUIRY LIST ───────────────────────────────────────────────── */
        .inquiry-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .inquiry-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .inquiry-card__top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }

        .inquiry-card__name {
          font-size: 13.5px;
          font-weight: 700;
          color: #ffffff;
          display: block;
        }

        .inquiry-card__date {
          font-size: 11.5px;
          color: rgba(235, 233, 225, 0.45);
        }

        .inquiry-card__message {
          font-size: 13px;
          color: rgba(235, 233, 225, 0.75);
          line-height: 1.5;
          margin: 0;
          background: rgba(0, 0, 0, 0.25);
          padding: 12px 16px;
          border-radius: 10px;
          border-left: 3px solid #10B981;
        }

        /* ── PROFILE & SECURITY CARD ────────────────────────────────────── */
        .profile-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          padding: 28px;
        }

        .profile-card__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .profile-card__item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .profile-card__label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: rgba(235, 233, 225, 0.45);
        }

        .profile-card__val {
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
        }

        .profile-card__val--badge {
          display: inline-block;
          background: rgba(16, 185, 129, 0.15);
          color: #10B981;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 12px;
          width: fit-content;
        }

        .profile-card__code {
          font-family: monospace;
          font-size: 12px;
          color: rgba(235, 233, 225, 0.55);
          word-break: break-all;
        }

        /* ── EMPTY STATE ────────────────────────────────────────────────── */
        .empty-state {
          text-align: center;
          padding: 48px 24px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
        }

        .empty-state__icon {
          font-size: 36px;
          margin-bottom: 12px;
        }

        .empty-state__title {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 6px;
        }

        .empty-state__text {
          font-size: 13.5px;
          color: rgba(235, 233, 225, 0.55);
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.5;
        }

        /* ── FOOTER ─────────────────────────────────────────────────────── */
        .account-footer {
          margin-top: auto;
          padding: 24px 36px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(0, 0, 0, 0.4);
        }

        .account-footer__container {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: rgba(235, 233, 225, 0.45);
          flex-wrap: wrap;
          gap: 10px;
        }

        .account-footer__tech {
          color: rgba(16, 185, 129, 0.7);
        }

        /* ── RESPONSIVE ADAPTATIONS ─────────────────────────────────────── */
        @media (max-width: 1080px) {
          .account-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .comm-grid {
            grid-template-columns: 1fr;
          }
          .profile-card__grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .account-topbar {
            padding: 12px 20px;
          }
          .account-topbar__search {
            display: none;
          }
          .account-main {
            padding: 24px 16px 60px;
            gap: 32px;
          }
          .account-hero {
            padding: 24px 20px;
          }
          .account-hero__title {
            font-size: 24px;
          }
          .account-stats-grid {
            grid-template-columns: 1fr;
          }
          .profile-card__grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
