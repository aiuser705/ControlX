'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

const NAV_LINKS = [
  { href: '/#services', label: 'Services' },
  { href: '/#work', label: 'Work' },
  { href: '/#about', label: 'About' },
  { href: '/#process', label: 'Process' },
];

interface UserProfile {
  id: string;
  email: string;
  role: string;
  full_name?: string;
}

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const navRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── 1. Listen to Supabase Auth State ───────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();

    const fetchSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (profile) setUserProfile(profile);
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('[Navigation] Error fetching session:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) setUserProfile(profile);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ── 2. Handle Scroll & Outside Click ───────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileMenuOpen]);

  // Handle Esc key to close menu
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setMobileMenuOpen(false);
      setUserDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserProfile(null);
    closeMenu();
    window.location.href = '/';
  };

  // Derive User's Display Name
  const displayName =
    userProfile?.full_name ||
    (currentUser?.email ? currentUser.email.split('@')[0] : 'Account');
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <nav
        ref={navRef}
        className={`nav-bar ${scrolled ? 'nav-bar--scrolled' : ''} ${mobileMenuOpen ? 'nav-bar--menu-open' : ''}`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" className="nav-logo" aria-label="Control X home" onClick={closeMenu}>
          <Image
            src="/assets/nav-logo-x.png"
            alt="Control X logo mark"
            width={34}
            height={25}
            className="nav-logo__x-img"
            priority
            style={{ width: 'auto', height: '25px', display: 'block', objectFit: 'contain' }}
          />
          <span className="nav-logo__wordmark">CONTROL</span>
        </Link>

        {/* Desktop Centre links */}
        <ul className="nav-links" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="nav-link">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Right actions */}
        <div className="nav-actions">
          <Link href="/#contact" className="nav-btn nav-btn--ghost" aria-label="Contact Us">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Contact
          </Link>

          {!authLoading && currentUser ? (
            /* Logged In User Dropdown */
            <div className="nav-user-dropdown-container" ref={dropdownRef}>
              <button
                type="button"
                className="nav-user-pill-btn"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
                id="userNavMenuBtn"
              >
                <span className="nav-user-avatar">{userInitial}</span>
                <span className="nav-user-name">Hi, {displayName}</span>
                <svg
                  className={`nav-user-chevron ${userDropdownOpen ? 'nav-user-chevron--open' : ''}`}
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {userDropdownOpen && (
                <div className="nav-user-menu" role="menu">
                  <div className="nav-user-menu__profile">
                    <div className="nav-user-menu__avatar-large">{userInitial}</div>
                    <div className="nav-user-menu__info">
                      <p className="nav-user-menu__name">{displayName}</p>
                      <p className="nav-user-menu__email">{currentUser.email}</p>
                    </div>
                  </div>

                  <div className="nav-user-menu__divider" />

                  <Link
                    href="/account"
                    className="nav-user-menu__link"
                    role="menuitem"
                    onClick={closeMenu}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>User Dashboard</span>
                  </Link>

                  {userProfile?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="nav-user-menu__link nav-user-menu__link--admin"
                      role="menuitem"
                      onClick={closeMenu}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
                      </svg>
                      <span>Admin CRM</span>
                    </Link>
                  )}

                  <div className="nav-user-menu__divider" />

                  <button
                    type="button"
                    className="nav-user-menu__logout"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" x2="9" y1="12" y2="12" />
                    </svg>
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated / Loading: "Get Started" CTA */
            <Link href="/login" className="nav-btn nav-btn--filled">
              <span>Get Started</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className={`nav-hamburger ${mobileMenuOpen ? 'nav-hamburger--active' : ''}`}
          type="button"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-drawer"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          <span className="nav-hamburger__line nav-hamburger__line--top" />
          <span className="nav-hamburger__line nav-hamburger__line--mid" />
          <span className="nav-hamburger__line nav-hamburger__line--bot" />
        </button>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        id="mobile-nav-drawer"
        className={`nav-mobile-drawer ${mobileMenuOpen ? 'nav-mobile-drawer--open' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="nav-mobile-drawer__backdrop" onClick={closeMenu} aria-hidden="true" />
        <div className="nav-mobile-drawer__content">
          {/* Top Row in Drawer */}
          <div className="nav-mobile-drawer__header">
            <Link href="/" className="nav-logo" onClick={closeMenu}>
              <Image
                src="/assets/nav-logo-x.png"
                alt="Control X logo mark"
                width={34}
                height={25}
                className="nav-logo__x-img"
                priority
                style={{ width: 'auto', height: '25px', display: 'block', objectFit: 'contain' }}
              />
              <span className="nav-logo__wordmark">CONTROL</span>
            </Link>
            <button
              className="nav-mobile-drawer__close"
              type="button"
              aria-label="Close menu"
              onClick={closeMenu}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="nav-mobile-drawer__nav">
            <span className="nav-mobile-drawer__nav-label">Navigation</span>
            <ul className="nav-mobile-drawer__list" role="list">
              {NAV_LINKS.map((link, idx) => (
                <li key={link.href} className="nav-mobile-drawer__item" style={{ animationDelay: `${0.05 + idx * 0.05}s` }}>
                  <Link href={link.href} className="nav-mobile-drawer__link" onClick={closeMenu}>
                    <span className="nav-mobile-drawer__link-num">0{idx + 1}</span>
                    <span className="nav-mobile-drawer__link-text">{link.label}</span>
                    <svg className="nav-mobile-drawer__link-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* User Account / Action CTAs at bottom of Drawer */}
          <div className="nav-mobile-drawer__actions">
            {currentUser ? (
              <div className="nav-mobile-user-card">
                <div className="nav-mobile-user-card__header">
                  <div className="nav-user-avatar">{userInitial}</div>
                  <div>
                    <p className="nav-mobile-user-card__name">Hi, {displayName}</p>
                    <p className="nav-mobile-user-card__email">{currentUser.email}</p>
                  </div>
                </div>
                <div className="nav-mobile-user-card__buttons">
                  <Link href="/account" className="btn-primary nav-mobile-drawer__btn" onClick={closeMenu}>
                    <span>My Account Dashboard</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <button type="button" className="btn-secondary nav-mobile-drawer__btn" onClick={handleLogout}>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-primary nav-mobile-drawer__btn" onClick={closeMenu}>
                  <span>Get Started / Login</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Scoped CSS for User Dropdown & Profile Pill in Navigation */}
      <style jsx>{`
        .nav-user-dropdown-container {
          position: relative;
          display: inline-block;
        }

        .nav-user-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 6px 14px 6px 7px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(15, 130, 89, 0.25);
          border-radius: 999px;
          color: #1a2a20;
          font-family: var(--font-sans, inherit);
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        }

        .nav-user-pill-btn:hover {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(15, 130, 89, 0.45);
          box-shadow: 0 4px 16px rgba(15, 130, 89, 0.15);
          transform: translateY(-1px);
        }

        .nav-user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0F8259 0%, #10B981 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12.5px;
          font-weight: 700;
          box-shadow: 0 2px 6px rgba(15, 130, 89, 0.3);
          flex-shrink: 0;
        }

        .nav-user-name {
          white-space: nowrap;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nav-user-chevron {
          transition: transform 0.24s ease;
          color: rgba(0, 0, 0, 0.55);
        }

        .nav-user-chevron--open {
          transform: rotate(180deg);
        }

        /* ── Dropdown Menu ─────────────────────────────────────────────── */
        .nav-user-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 250px;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 16px;
          padding: 10px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.14), 0 0 0 1px rgba(15, 130, 89, 0.1);
          z-index: 1000;
          animation: menuFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes menuFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .nav-user-menu__profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px 10px;
        }

        .nav-user-menu__avatar-large {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0F8259 0%, #10B981 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .nav-user-menu__info {
          overflow: hidden;
        }

        .nav-user-menu__name {
          font-size: 13.5px;
          font-weight: 700;
          color: #111827;
          margin: 0;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nav-user-menu__email {
          font-size: 11.5px;
          color: #6b7280;
          margin: 2px 0 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nav-user-menu__divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.07);
          margin: 6px 0;
        }

        .nav-user-menu__link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 10px;
          color: #374151;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.18s ease, color 0.18s ease;
        }

        .nav-user-menu__link:hover {
          background: rgba(15, 130, 89, 0.08);
          color: #0F8259;
        }

        .nav-user-menu__link--admin {
          color: #d97706;
        }
        .nav-user-menu__link--admin:hover {
          background: rgba(217, 119, 6, 0.1);
          color: #b45309;
        }

        .nav-user-menu__logout {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 12px;
          border-radius: 10px;
          border: none;
          background: none;
          color: #ef4444;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          transition: background 0.18s ease;
        }

        .nav-user-menu__logout:hover {
          background: rgba(239, 68, 68, 0.08);
        }

        /* ── Mobile User Card in Drawer ────────────────────────────────── */
        .nav-mobile-user-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          width: 100%;
          box-sizing: border-box;
        }

        .nav-mobile-user-card__header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-mobile-user-card__name {
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .nav-mobile-user-card__email {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.55);
          margin: 2px 0 0;
        }

        .nav-mobile-user-card__buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      `}</style>
    </>
  );
}
