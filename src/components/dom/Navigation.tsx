'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Process', href: '#process' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className={`nav-bar ${scrolled ? 'nav-bar--scrolled' : ''}`}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <Link href="/" className="nav-logo" aria-label="Control X home">
        <span className="nav-logo__x" aria-hidden="true">X</span>
        <span className="nav-logo__wordmark">CONTROL X</span>
      </Link>

      {/* Centre links */}
      <ul className="nav-links" role="list">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="nav-link">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Right actions */}
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
    </nav>
  );
}
