'use client';

import React from 'react';
import Image from 'next/image';

interface ControlXMonogramProps {
  size?: number;
  className?: string;
  variant?: 'light' | 'dark' | 'glass';
  priority?: boolean;
}

export default function ControlXMonogram({
  size = 28,
  className = '',
  variant = 'light',
  priority = false,
}: ControlXMonogramProps) {
  return (
    <div
      className={`controlx-monogram-wrap ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Image
        src="/assets/branding/controlx-monogram.png"
        alt="Control X Official Monogram"
        width={size}
        height={size}
        className="controlx-monogram-img"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
        priority={priority}
        unoptimized
      />
    </div>
  );
}
