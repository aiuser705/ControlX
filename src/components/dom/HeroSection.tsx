'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import GlassX from './GlassX';

/**
 * HeroSection — the full-viewport opening experience.
 *
 * Layer stack (bottom to top):
 *   1. WebGL canvas (page.tsx)   — video + mouse displacement
 *   2. This component overlay    — nav + hero content
 *
 * Entrance animation: staggered reveal of each text line + GlassX,
 * driven by GSAP with a cinematic ease. Matches reference video timing.
 */
export default function HeroSection() {
  const heroRef      = useRef<HTMLElement>(null);
  const taglineRef   = useRef<HTMLParagraphElement>(null);
  const headlineRef  = useRef<HTMLHeadingElement>(null);
  const sublineRef   = useRef<HTMLParagraphElement>(null);
  const ctaRef       = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  // ── Entrance animation ──────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.4 });

      // GlassX drops in from slightly above
      tl.fromTo('.glass-x-scene',
        { opacity: 0, y: -40, scale: 0.88 },
        { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: 'expo.out' },
        0
      );

      // Tagline
      tl.fromTo(taglineRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' },
        0.3
      );

      // Headline — each word slides up
      const words = headlineRef.current?.querySelectorAll('.hero-word');
      if (words?.length) {
        tl.fromTo(words,
          { opacity: 0, y: 36, rotateX: 12 },
          {
            opacity: 1, y: 0, rotateX: 0,
            duration: 1.0, ease: 'expo.out',
            stagger: 0.08,
          },
          0.45
        );
      }

      // Sub-headline
      tl.fromTo(sublineRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' },
        0.85
      );

      // CTA buttons
      tl.fromTo(ctaRef.current?.children ?? [],
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.12 },
        1.0
      );

      // Scroll hint fades in last
      tl.fromTo(scrollHintRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.0, ease: 'power2.inOut' },
        1.5
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // ── Headline — wrap each word for per-word animation ──────────────────────
  const headline   = 'We Build Digital Experiences';
  const headlineWords = headline.split(' ');

  return (
    <section
      ref={heroRef}
      id="hero"
      className="hero-section"
      aria-label="Hero"
    >
      {/* Tagline badge */}
      <p ref={taglineRef} className="hero-tagline" aria-label="Tagline">
        <span className="hero-tagline__dot" aria-hidden="true"/>
        Premium Digital Agency
      </p>

      {/* GlassX 3D visual */}
      <GlassX />

      {/* Main headline */}
      <h1 ref={headlineRef} className="hero-headline" aria-label={headline}>
        {headlineWords.map((word, i) => (
          <span
            key={i}
            className="hero-word"
            style={{ display: 'inline-block', marginRight: '0.22em' }}
          >
            {word}
          </span>
        ))}
      </h1>

      {/* Sub-headline */}
      <p ref={sublineRef} className="hero-subline">
        Luxury interfaces. Cinematic motion. Zero compromise.
        <br className="hero-subline__break"/>
        Built for brands that demand the extraordinary.
      </p>

      {/* CTA buttons */}
      <div ref={ctaRef} className="hero-cta">
        <a href="#work" className="btn-primary" id="hero-cta-primary">
          View Our Work
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
        <a href="#contact" className="btn-secondary" id="hero-cta-secondary">
          Start a Project
        </a>
      </div>

      {/* Scroll indicator */}
      <div ref={scrollHintRef} className="hero-scroll-hint" aria-label="Scroll down">
        <div className="hero-scroll-hint__line"/>
        <span className="hero-scroll-hint__label">Scroll</span>
      </div>

      {/* 4-point sparkle decorations — matching reference */}
      <span className="sparkle sparkle--tr" aria-hidden="true">✦</span>
      <span className="sparkle sparkle--bl" aria-hidden="true">✦</span>
    </section>
  );
}
