'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const PORTFOLIO_ITEMS = [
  {
    id: '01',
    title: 'Brand VIP',
    category: 'Brand & Identity Platform',
    desc: 'Exclusive brand identity and high-end digital presentation system.',
    url: 'https://brand-vip.vercel.app/',
    imageSrc: '/assets/projects/brand-vip.png',
    prismType: 'AURA · Fall/Winter Collection',
  },
  {
    id: '02',
    title: 'Portfolio',
    category: 'Interactive Portfolio & Showcase',
    desc: 'Minimalist, high-performance personal portfolio experience.',
    url: 'https://portfolio-v1-sigma-brown.vercel.app/',
    imageSrc: '/assets/projects/portfolio.png',
    prismType: 'Rahul · Web Designer',
  },
  {
    id: '03',
    title: 'Salon VIP',
    category: 'Luxury Service & Booking Platform',
    desc: 'Bespoke salon and wellness luxury digital platform.',
    url: 'https://salon-vip.vercel.app/',
    imageSrc: '/assets/projects/salon-vip.png',
    prismType: 'Maison Noir · Colour Art',
  },
  {
    id: '04',
    title: 'Gym VIP',
    category: 'Fitness & Premium Membership',
    desc: 'High-energy, modern fitness and performance platform.',
    url: 'https://gym-vip.vercel.app/',
    imageSrc: '/assets/projects/gym-vip.png',
    prismType: 'IRONYARD · Reception',
  },
  {
    id: '05',
    title: 'Interactive Login Experience',
    category: 'Interactive Web Experience',
    desc: 'A playful interactive login interface with a responsive character-based interaction system.',
    url: '/login',
    imageSrc: '/assets/projects/login-experience.png',
    prismType: 'ControlX · Interactive Mascot System',
  },
];

export default function PortfolioSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      if (!track) return;

      // Calculate horizontal scroll distance
      const scrollWidth = track.scrollWidth - window.innerWidth + 120;

      // Pinned horizontal scroll timeline
      gsap.to(track, {
        x: -scrollWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          end: () => `+=${scrollWidth}`,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="work" className="sec-portfolio">
      <div className="portfolio-header">
        <p className="portfolio-tagline">SELECTED SHOWCASE</p>
        <h2 className="portfolio-title">Selected Work</h2>
      </div>

      <div className="portfolio-track-wrapper">
        <div ref={trackRef} className="portfolio-track">
          {PORTFOLIO_ITEMS.map((item) => {
            const isExternal = item.url.startsWith('http');
            return (
              <a
                key={item.id}
                href={item.url}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="portfolio-card glass-card"
                style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                {/* Giant Index Number */}
                <div className="portfolio-card__number">{item.id}</div>

                {/* Real Website Landing Page Visual Area */}
                <div className="portfolio-card__visual">
                  <Image
                    src={item.imageSrc}
                    alt={`${item.title} Landing Page Preview`}
                    fill
                    sizes="(max-width: 640px) 320px, 520px"
                    style={{ objectFit: 'cover', objectPosition: 'top' }}
                    className="portfolio-card__img"
                    unoptimized
                  />
                  <div className="portfolio-card__img-overlay" />
                  <div className="portfolio-card__label">{item.prismType}</div>
                </div>

                {/* Card Meta Content */}
                <div className="portfolio-card__content">
                  <span className="portfolio-card__category">{item.category}</span>
                  <h3 className="portfolio-card__title">{item.title}</h3>
                  <p className="portfolio-card__desc">{item.desc}</p>
                  <span className="btn-secondary inline-flex items-center gap-2" style={{ display: 'inline-flex' }}>
                    View Project &rarr;
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
