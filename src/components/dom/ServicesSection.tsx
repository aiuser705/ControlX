'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Handshake } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const SERVICES_DATA = [
  {
    id: '01',
    title: 'Premium Landing Pages',
    desc: 'Beautiful, conversion-focused landing pages designed to capture attention, communicate value, and turn visitors into customers.',
    iconClass: 'service-icon--layout',
    icon: (
      <svg className="service-icon-svg service-icon-svg--layout" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0F8259" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect className="icon-part-frame" x="3" y="3" width="18" height="18" rx="2" />
        <line className="icon-part-header" x1="3" y1="9" x2="21" y2="9" />
        <line className="icon-part-sidebar" x1="9" y1="9" x2="9" y2="21" />
        <rect className="icon-part-block1" x="11.5" y="11.5" width="7" height="3" rx="0.75" />
        <rect className="icon-part-block2" x="11.5" y="16" width="7" height="2.5" rx="0.75" />
      </svg>
    ),
  },
  {
    id: '02',
    title: 'UI / UX Design',
    desc: 'Thoughtfully designed interfaces that combine usability, clarity, and premium aesthetics across every screen.',
    iconClass: 'service-icon--pentool',
    icon: (
      <svg className="service-icon-svg service-icon-svg--pentool" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0F8259" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path className="icon-part-drawn-curve" d="M 4 20 C 6 13, 13 15, 18 6" />
        <circle className="icon-part-anchor-start" cx="4" cy="20" r="1.5" />
        <circle className="icon-part-anchor-end" cx="18" cy="6" r="1.5" />
        <g className="icon-part-pen-group">
          <path d="m12 19 7-7 3 3-7 7-3-3z" />
          <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="m2 2 7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </g>
      </svg>
    ),
  },
  {
    id: '03',
    title: 'Frontend Development',
    desc: 'Pixel-perfect websites built with React, Next.js and TypeScript for speed, scalability, and long-term maintainability.',
    iconClass: 'service-icon--code',
    icon: (
      <svg className="service-icon-svg service-icon-svg--code" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0F8259" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path className="icon-part-bracket-left" d="m7 8-4 4 4 4" />
        <path className="icon-part-bracket-right" d="m17 16 4-4-4-4" />
        <path className="icon-part-slash" d="m14.5 4-5 16" />
        <line className="icon-part-dash" x1="10" y1="12" x2="14" y2="12" />
      </svg>
    ),
  },
  {
    id: '04',
    title: 'Motion & Interactions',
    desc: 'Luxury animations powered by GSAP and Three.js that make every interaction smooth, immersive and memorable.',
    iconClass: 'service-icon--sparkles',
    icon: (
      <svg className="service-icon-svg service-icon-svg--sparkles" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0F8259" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path className="icon-part-sparkle-main" d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" />
        <path className="icon-part-sparkle-tr" d="M19 3v4M21 5h-4" />
        <path className="icon-part-sparkle-bl" d="M5 17v4M7 19H3" />
        <circle className="icon-part-sparkle-core" cx="12" cy="12" r="1.5" />
      </svg>
    ),
  },
  {
    id: '05',
    title: 'Performance & SEO',
    desc: 'Optimized for Core Web Vitals, accessibility, search visibility and lightning-fast performance on every device.',
    iconClass: 'service-icon--gauge',
    icon: (
      <svg className="service-icon-svg service-icon-svg--gauge" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0F8259" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path className="icon-part-gauge-arc" d="M3.34 19a10 10 0 1 1 17.32 0" />
        <line className="icon-part-gauge-tick1" x1="6" y1="14" x2="7.5" y2="13" />
        <line className="icon-part-gauge-tick2" x1="12" y1="4" x2="12" y2="6.5" />
        <line className="icon-part-gauge-tick3" x1="18" y1="14" x2="16.5" y2="13" />
        <g className="icon-part-gauge-needle-group">
          <circle cx="12" cy="15" r="2" fill="#0F8259" />
          <path d="M12 15 L7.5 10.5" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      </svg>
    ),
  },
  {
    id: '06',
    title: 'Support & Growth',
    desc: 'Continuous maintenance, feature enhancements and long-term support to help your digital presence evolve with your business.',
    iconClass: 'service-icon--handshake',
    icon: (
      <svg className="service-icon-svg service-icon-svg--handshake" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0F8259" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <g className="icon-part-hand-left">
          <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
          <path d="M3 4h8" />
          <path d="m11 17 2 2a1 1 0 1 0 3-3" />
        </g>
        <g className="icon-part-hand-right">
          <path d="m21 3 1 11h-2" />
          <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
        </g>
      </svg>
    ),
  },
];

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isAlreadyInView = () => {
        if (!sectionRef.current) return false;
        const rect = sectionRef.current.getBoundingClientRect();
        return rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
      };

      const animateHeader = () => {
        const titleTl = gsap.timeline();

        // 1. Tagline entrance
        titleTl.to(
          '.services-tagline',
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
          0
        );

        // 2. Paper Unroll Reveal on "What We Build" Heading
        titleTl.to(
          '.services-title-unroll',
          {
            clipPath: 'inset(0 0% 0 0 round 0px)',
            duration: 1.1,
            ease: 'power3.out',
          },
          0.12
        );

        // Moving paper-curl cylindrical edge
        titleTl.fromTo(
          '.services-title-curl',
          { x: 0, opacity: 1 },
          {
            x: () => {
              const el = document.querySelector('.services-title-unroll') as HTMLElement;
              return el ? el.offsetWidth : 320;
            },
            opacity: 0,
            duration: 1.1,
            ease: 'power3.out',
          },
          0.12
        );

        // 3D Parchment uncurl & settle
        titleTl.fromTo(
          '.services-title',
          { rotateY: 14, skewX: -3 },
          { rotateY: 0, skewX: 0, duration: 1.1, ease: 'power3.out' },
          0.12
        );

        // Directional framing chevrons moving outward and fading away
        titleTl.fromTo(
          '.services-chevron--left',
          { opacity: 0.75, x: 10 },
          { opacity: 0, x: -36, duration: 0.8, ease: 'power2.out' },
          0.2
        );

        titleTl.fromTo(
          '.services-chevron--right',
          { opacity: 0.75, x: -10 },
          { opacity: 0, x: 36, duration: 0.8, ease: 'power2.out' },
          0.2
        );

        // Subtitle entrance
        titleTl.to(
          '.services-subtitle',
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
          0.4
        );
      };

      // Set initial hidden transform states
      gsap.set('.services-tagline', { opacity: 0, y: 20 });
      gsap.set('.services-title-unroll', { clipPath: 'inset(0 100% 0 0 round 0px)' });
      gsap.set('.services-title', { rotateY: 14, skewX: -3 });
      gsap.set('.services-subtitle', { opacity: 0, y: 20 });

      if (isAlreadyInView()) {
        animateHeader();
      } else {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
          onEnter: () => animateHeader(),
        });
      }

      // Staggered glass cards reveal (preserved exactly)
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
          stagger: 0.12,
          scrollTrigger: {
            trigger: '.services-grid',
            start: 'top 75%',
          },
        }
      );

      // Refresh on next tick for direct hash navigation
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
        if (isAlreadyInView()) {
          animateHeader();
        }
      }, 120);

      return () => clearTimeout(timer);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // 3D Tilt + Cursor-following edge reflection tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = cardsRef.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = (-(y - centerY) / centerY) * 10;
    const rotY = ((x - centerX) / centerX) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px) scale(1.02)`;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleMouseLeave = (index: number) => {
    const card = cardsRef.current[index];
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
  };

  return (
    <section ref={sectionRef} id="services" className="sec-services">
      <div className="services-container">
        <div className="services-header">
          <p className="services-tagline">OUR EXPERTISE</p>
          <div className="services-title-wrapper">
            <span className="services-chevron services-chevron--left" aria-hidden="true">&lt;</span>
            <div className="services-title-unroll">
              <h2 className="services-title">What We Build</h2>
              <div className="services-title-curl" aria-hidden="true" />
            </div>
            <span className="services-chevron services-chevron--right" aria-hidden="true">&gt;</span>
          </div>
          <p className="services-subtitle">
            From strategy and design to development and long-term support, we craft premium digital experiences that help modern brands stand out online.
          </p>
        </div>

        <div className="services-grid">
          {SERVICES_DATA.map((service, idx) => (
            <div
              key={service.id}
              ref={(el) => { cardsRef.current[idx] = el; }}
              className="service-card glass-card"
              onMouseMove={(e) => handleMouseMove(e, idx)}
              onMouseLeave={() => handleMouseLeave(idx)}
            >
              <div className="service-card__border-beam" aria-hidden="true" />
              <div className={`service-card__icon ${service.iconClass}`}>
                <span className="service-icon-wrapper">{service.icon}</span>
              </div>
              <h3 className="service-card__title">{service.title}</h3>
              <p className="service-card__desc">{service.desc}</p>
              <button className="service-card__btn" type="button">
                Explore Service
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
