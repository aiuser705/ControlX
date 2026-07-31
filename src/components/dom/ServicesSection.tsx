'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const SERVICES_DATA = [
  {
    id: '01',
    title: 'Seltubic Develops',
    desc: 'Cerant olauc cvepote umaltrinite dectutates, and diret antit who defenllping atamainess.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 28C12 28 16 12 28 12C28 12 24 28 12 28Z" stroke="#0F8259" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 22C18 22 22 14 30 14" stroke="#0F8259" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="28" cy="10" r="2" fill="#0F8259"/>
      </svg>
    ),
  },
  {
    id: '02',
    title: 'Nature Interratioc',
    desc: 'Commodity and deherancy and accritilating resfiuctives charsingis, deloite & consfectors.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="14" width="20" height="14" rx="2" stroke="#0F8259" strokeWidth="2.2"/>
        <path d="M8 28H32" stroke="#0F8259" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M16 14V10H24V14" stroke="#0F8259" strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    id: '03',
    title: 'Completing Services',
    desc: 'Domnicos ad accare eorind nexun, inferciar, fast leirees smiitn, datolaciar mreaforters.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="18" width="8" height="14" stroke="#0F8259" strokeWidth="2"/>
        <rect x="22" y="10" width="8" height="22" stroke="#0F8259" strokeWidth="2"/>
        <path d="M14 18V12L22 8" stroke="#0F8259" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: '04',
    title: 'Botal Devices',
    desc: 'Lorem ipsum all ealing tasts izari and advanced optical device integration platforms.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="10" stroke="#0F8259" strokeWidth="2.2"/>
        <circle cx="20" cy="20" r="4" fill="#0F8259"/>
        <path d="M20 6V10M20 30V34M6 20H10M30 20H34" stroke="#0F8259" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: '05',
    title: 'Mesolty Desinge',
    desc: 'Dusteiphanss melay eirastade with high-end spatial geometry & liquid surface dynamics.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 28L20 10L30 28H10Z" stroke="#0F8259" strokeWidth="2.2" strokeLinejoin="round"/>
        <circle cx="20" cy="20" r="3" fill="#0F8259"/>
      </svg>
    ),
  },
  {
    id: '06',
    title: 'Punic Citama',
    desc: 'Spreem ipsum fmoronsgund arfood for luxury digital interactive installations.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="20" height="20" rx="4" stroke="#0F8259" strokeWidth="2"/>
        <path d="M10 18H30M18 10V30" stroke="#0F8259" strokeWidth="1.8"/>
      </svg>
    ),
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
          <h2 className="services-title">Services</h2>
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
                Read more
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
