'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import GlassX from './GlassX';

/**
 * HeroSection — Opening Viewport Experience
 *
 * Strict Render Layer Stack:
 *   1. Background (page.tsx)
 *   2. Ground Shadow (GlassX internal Layer 2)
 *   3. Hero X Video (GlassX internal Layer 3 - WebGL edge-aware keyed canvas)
 *   4. Reflection Overlay (GlassX internal Layer 4)
 *   5. Specular Highlight Layer (GlassX internal Layer 5)
 *   6. Cursor Highlight (GlassX internal Layer 6)
 *   7. Hero Text (Tagline, Headline, Subline - zIndex 7)
 *   8. Buttons (CTA buttons - zIndex 8)
 *   9. Custom Cursor (Top overlay - zIndex 999)
 */
export default function HeroSection() {
  const heroRef        = useRef<HTMLElement>(null);
  const taglineRef     = useRef<HTMLParagraphElement>(null);
  const headlineRef    = useRef<HTMLHeadingElement>(null);
  const sublineRef     = useRef<HTMLParagraphElement>(null);
  const ctaRef         = useRef<HTMLDivElement>(null);
  const scrollHintRef  = useRef<HTMLDivElement>(null);

  // ── Entrance animation ──────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.4 });

      // GlassX reveals with subtle scale & entrance
      tl.fromTo(
        '.glass-x-scene',
        { opacity: 0, y: -30, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 1.3, ease: 'expo.out' },
        0
      );

      // Tagline reveal
      tl.fromTo(
        taglineRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' },
        0.3
      );

      // Headline — each word slides up
      const words = headlineRef.current?.querySelectorAll('.hero-word');
      if (words?.length) {
        tl.fromTo(
          words,
          { opacity: 0, y: 36, rotateX: 12 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1.0,
            ease: 'expo.out',
            stagger: 0.08,
          },
          0.45
        );
      }

      // Sub-headline reveal
      tl.fromTo(
        sublineRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' },
        0.85
      );

      // CTA buttons reveal
      tl.fromTo(
        ctaRef.current?.children ?? [],
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.12 },
        1.0
      );

      // Scroll hint fades in last
      tl.fromTo(
        scrollHintRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.0, ease: 'power2.inOut' },
        1.5
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const headline = 'We Build Digital Experiences';
  const headlineWords = headline.split(' ');

  return (
    <section
      ref={heroRef}
      id="hero"
      className="hero-section"
      aria-label="Hero"
      style={{ position: 'relative', zIndex: 10 }}
    >
      {/* Layers 2-6: Ground Shadow -> Hero X Video -> Reflection -> Specular Sheen -> Cursor Glow */}
      <GlassX src="/videos/x_animation_3.mp4" />

      {/* Layer 7: Hero Text (Tagline, Headline, Subline) */}
      <div style={{ position: 'relative', zIndex: 7 }}>
        <p ref={taglineRef} className="hero-tagline" aria-label="Tagline">
          <span className="hero-tagline__dot" aria-hidden="true" />
          Premium Digital Agency
        </p>

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

        <p ref={sublineRef} className="hero-subline">
          Luxury interfaces. Cinematic motion. Zero compromise.
          <br className="hero-subline__break" />
          Built for brands that demand the extraordinary.
        </p>
      </div>

      {/* Layer 8: Buttons */}
      <div ref={ctaRef} className="hero-cta" style={{ position: 'relative', zIndex: 8 }}>
        <a href="#work" className="btn-primary" id="hero-cta-primary">
          View Our Work
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
        <a href="#contact" className="btn-secondary" id="hero-cta-secondary">
          Start a Project
        </a>
      </div>

      {/* Scroll indicator */}
      <div ref={scrollHintRef} className="hero-scroll-hint" aria-label="Scroll down" style={{ position: 'relative', zIndex: 8 }}>
        <div className="hero-scroll-hint__line" />
        <span className="hero-scroll-hint__label">Scroll</span>
      </div>

      {/* 4-point sparkle decorations */}
      <span className="sparkle sparkle--tr" aria-hidden="true">✦</span>
      <span className="sparkle sparkle--bl" aria-hidden="true">✦</span>
    </section>
  );
}
