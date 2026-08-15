'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const NAV_LINKS = [
  { href: '#services', label: 'Services' },
  { href: '#work', label: 'Work' },
  { href: '#about', label: 'About' },
  { href: '#process', label: 'Process' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const closeMenu = () => setMobileMenuOpen(false);

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
          <button className="nav-btn nav-btn--ghost" type="button" aria-label="Search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            Search
          </button>
          <Link href="#contact" className="nav-btn nav-btn--filled">
            Get Started
          </Link>
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

          {/* Action CTAs at bottom of Drawer */}
          <div className="nav-mobile-drawer__actions">
            <button className="btn-secondary nav-mobile-drawer__btn" type="button" aria-label="Search" onClick={closeMenu}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <span>Search Website</span>
            </button>
            <Link href="#contact" className="btn-primary nav-mobile-drawer__btn" onClick={closeMenu}>
              <span>Get Started</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
