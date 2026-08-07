'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Layout, PenTool, Code2, Sparkles, Gauge, Handshake } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const SERVICES_DATA = [
  {
    id: '01',
    title: 'Premium Landing Pages',
    desc: 'Beautiful, conversion-focused landing pages designed to capture attention, communicate value, and turn visitors into customers.',
    icon: <Layout size={36} strokeWidth={1.8} color="#0F8259" />,
  },
  {
    id: '02',
    title: 'UI / UX Design',
    desc: 'Thoughtfully designed interfaces that combine usability, clarity, and premium aesthetics across every screen.',
    icon: <PenTool size={36} strokeWidth={1.8} color="#0F8259" />,
  },
  {
    id: '03',
    title: 'Frontend Development',
    desc: 'Pixel-perfect websites built with React, Next.js and TypeScript for speed, scalability, and long-term maintainability.',
    icon: <Code2 size={36} strokeWidth={1.8} color="#0F8259" />,
  },
  {
    id: '04',
    title: 'Motion & Interactions',
    desc: 'Luxury animations powered by GSAP and Three.js that make every interaction smooth, immersive and memorable.',
    icon: <Sparkles size={36} strokeWidth={1.8} color="#0F8259" />,
  },
  {
    id: '05',
    title: 'Performance & SEO',
    desc: 'Optimized for Core Web Vitals, accessibility, search visibility and lightning-fast performance on every device.',
    icon: <Gauge size={36} strokeWidth={1.8} color="#0F8259" />,
  },
  {
    id: '06',
    title: 'Support & Growth',
    desc: 'Continuous maintenance, feature enhancements and long-term support to help your digital presence evolve with your business.',
    icon: <Handshake size={36} strokeWidth={1.8} color="#0F8259" />,
  },
];

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading entrance animation
      gsap.fromTo(
        '.services-header',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );

      // Staggered glass cards reveal
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // 3D Tilt interaction logic
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
          <h2 className="services-title">What We Build</h2>
          <p style={{ marginTop: '16px', fontSize: '16px', color: 'var(--c-text-muted)', maxWidth: '720px', lineHeight: '1.6' }}>
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
              <div className="service-card__icon">{service.icon}</div>
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
