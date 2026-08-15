'use client';

import React from 'react';
import Link from 'next/link';
import ControlXMonogram from './ControlXMonogram';

interface ControlXLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showTagline?: boolean;
  href?: string;
  className?: string;
  onClick?: () => void;
  variant?: 'light' | 'dark';
}

export default function ControlXLogo({
  size = 'md',
  showTagline = false,
  href = '/',
  className = '',
  onClick,
  variant = 'light',
}: ControlXLogoProps) {
  // Sizing map
  const iconSize = size === 'sm' ? 24 : size === 'md' ? 30 : size === 'lg' ? 44 : 80;
  const fontSize = size === 'sm' ? '13px' : size === 'md' ? '15px' : size === 'lg' ? '22px' : '40px';
  const letterSpacing = size === 'sm' ? '0.14em' : '0.16em';

  const content = (
    <div
      className={`controlx-brandmark controlx-brandmark--${size} controlx-brandmark--${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? '8px' : size === 'md' ? '10px' : '16px',
        textDecoration: 'none',
        color: variant === 'dark' ? '#FFFFFF' : 'var(--c-text)',
      }}
    >
      <ControlXMonogram size={iconSize} priority />

      <div
        className="controlx-brandmark__text-group"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          lineHeight: 1,
        }}
      >
        <div
          className="controlx-brandmark__wordmark"
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize,
            letterSpacing,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '0.2em',
          }}
        >
          <span>CONTROL</span>
          <span style={{ color: 'var(--c-emerald)', fontWeight: 800 }}>X</span>
        </div>

        {showTagline && (
          <div
            className="controlx-brandmark__tagline"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: size === 'lg' ? '9px' : '7.5px',
              fontWeight: 700,
              letterSpacing: '0.26em',
              color: 'var(--c-emerald)',
              textTransform: 'uppercase',
              marginTop: '4px',
              opacity: 0.9,
            }}
          >
            BUILD · SCALE · DOMINATE
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="nav-logo" onClick={onClick} aria-label="Control X Home">
        {content}
      </Link>
    );
  }

  return content;
}
