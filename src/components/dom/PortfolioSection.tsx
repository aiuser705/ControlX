'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const PORTFOLIO_ITEMS = [
  {
    id: '01',
    title: 'Aetheria Refractive Optics',
    category: 'Spatial Design & WebGL Optics',
    desc: 'High-precision optical glass refraction maps with physical caustics dispersion.',
    imageBg: 'linear-gradient(135deg, rgba(15, 130, 89, 0.4) 0%, rgba(6, 77, 51, 0.8) 100%)',
    prismType: 'Pyramidal Glass Crystal',
  },
  {
    id: '02',
    title: 'Kinetic Monolith Systems',
    category: 'Interactive Installation',
    desc: 'Real-time 3D physics interaction engine driving physical stage lighting.',
    imageBg: 'linear-gradient(135deg, rgba(20, 80, 60, 0.5) 0%, rgba(12, 45, 35, 0.9) 100%)',
    prismType: 'Bevelled Cubic Slab',
  },
  {
    id: '03',
    title: 'Luminary Brand Platform',
    category: 'Luxury E-Commerce & Editorial',
    desc: 'Bespoke luxury agency platform combining Playfair Display typography with glassmorphism.',
    imageBg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.35) 0%, rgba(4, 46, 30, 0.85) 100%)',
    prismType: 'Floating Prismatic Octahedron',
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
          {PORTFOLIO_ITEMS.map((item) => (
            <div key={item.id} className="portfolio-card glass-card">
              {/* Giant Index Number */}
              <div className="portfolio-card__number">{item.id}</div>

              {/* Prism Visual Area */}
              <div
                className="portfolio-card__visual"
                style={{ background: item.imageBg }}
              >
                {/* SVG Prism Artwork */}
                <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="portfolio-prism-svg">
                  <polygon points="90,20 150,140 30,140" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                  <polygon points="90,20 150,140 90,120" fill="rgba(255,255,255,0.15)"/>
                  <polygon points="90,20 30,140 90,120" fill="rgba(255,255,255,0.35)"/>
                  <line x1="90" y1="20" x2="90" y2="120" stroke="#A8F0D4" strokeWidth="1.5"/>
                </svg>
                <div className="portfolio-card__label">{item.prismType}</div>
              </div>

              {/* Card Meta Content */}
              <div className="portfolio-card__content">
                <span className="portfolio-card__category">{item.category}</span>
                <h3 className="portfolio-card__title">{item.title}</h3>
                <p className="portfolio-card__desc">{item.desc}</p>
                <button className="btn-secondary" type="button">
                  View Case Study
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
