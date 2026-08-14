'use client';

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ghostEchoRef = useRef<HTMLHeadingElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);

  const [submitted, setSubmitted] = useState(false);

  // ── GSAP Cinematic Entrance & Direct Load Support ───────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const isAlreadyInView = () => {
        if (!sectionRef.current) return false;
        const rect = sectionRef.current.getBoundingClientRect();
        return rect.top < window.innerHeight * 0.95 && rect.bottom > 0;
      };

      const animateIn = () => {
        if (titleRef.current) {
          gsap.to(titleRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
          });
        }

        if (ghostEchoRef.current) {
          gsap.to(ghostEchoRef.current, {
            opacity: 0.35,
            filter: 'blur(6px)',
            y: 10,
            duration: 0.9,
            delay: 0.15,
            ease: 'power3.out',
          });
        }

        if (formCardRef.current) {
          gsap.to(formCardRef.current, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            delay: 0.25,
            ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
          });
        }
      };

      // Set initial hidden transform states
      if (titleRef.current) gsap.set(titleRef.current, { opacity: 0, y: 30 });
      if (ghostEchoRef.current) gsap.set(ghostEchoRef.current, { opacity: 0, filter: 'blur(16px)', y: 24 });
      if (formCardRef.current) gsap.set(formCardRef.current, { opacity: 0, y: 50, scale: 0.97 });

      // Immediate trigger if direct loaded at #contact
      if (isAlreadyInView()) {
        animateIn();
      } else {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 85%',
          once: true,
          onEnter: () => animateIn(),
        });
      }

      // Check on next tick after browser layout calculation
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
        if (isAlreadyInView()) {
          animateIn();
        }
      }, 100);

      return () => clearTimeout(timer);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ── Ambient Water Droplet Canvas Particles ──────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const getWidth = () => canvas.offsetWidth || sectionRef.current?.offsetWidth || window.innerWidth;
    const getHeight = () => canvas.offsetHeight || sectionRef.current?.offsetHeight || 900;

    let width = (canvas.width = getWidth());
    let height = (canvas.height = getHeight());

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = getWidth();
      height = canvas.height = getHeight();
    };
    window.addEventListener('resize', handleResize);

    const measureTimer = setTimeout(handleResize, 150);

    const droplets = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1.5 + Math.random() * 2.5, // 3-8px diameter
      speedY: 0.4 + Math.random() * 0.85,
      wobbleSpeed: 0.015 + Math.random() * 0.025,
      wobbleAmp: 0.5 + Math.random() * 0.7,
      angle: Math.random() * Math.PI * 2,
      opacity: 0.22 + Math.random() * 0.28,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < droplets.length; i++) {
        const d = droplets[i];
        d.angle += d.wobbleSpeed;
        d.y += d.speedY;
        const currentX = d.x + Math.sin(d.angle) * d.wobbleAmp * 12;

        if (d.y > height + 12) {
          d.y = -12;
          d.x = Math.random() * width;
        }

        const grad = ctx.createRadialGradient(
          currentX,
          d.y,
          0,
          currentX,
          d.y,
          d.radius
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${d.opacity * 0.95})`);
        grad.addColorStop(0.35, `rgba(168, 240, 212, ${d.opacity * 0.85})`);
        grad.addColorStop(0.7, `rgba(16, 185, 129, ${d.opacity * 0.65})`);
        grad.addColorStop(1, 'rgba(16, 185, 129, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(currentX, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(measureTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section ref={sectionRef} id="contact" className="sec-contact">
      {/* Ambient Falling Water Droplets Particle Canvas Layer */}
      <canvas ref={canvasRef} className="contact-droplets-canvas" aria-hidden="true" />

      <div className="contact-container">
        {/* Outro Call To Action Header with Ghost-Echo Layer */}
        <div className="contact-title-container">
          <h2 ref={titleRef} className="contact-title">
            Let&apos;s Build Something<br />
            <span className="contact-title__highlight">Extraordinary Together.</span>
          </h2>
          <h2 ref={ghostEchoRef} className="contact-title-ghost" aria-hidden="true">
            Let&apos;s Build Something<br />
            <span className="contact-title__highlight">Extraordinary Together.</span>
          </h2>
        </div>

        {/* Interactive Glass Form Card */}
        <div ref={formCardRef} className="contact-card glass-card">
          {submitted ? (
            <div className="contact-success">
              <div className="contact-success__icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0F8259" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="contact-success__title">Inquiry Received</h3>
              <p className="contact-success__desc">
                Thank you for reaching out. Our executive design team will respond within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="contact-form__grid">
                {/* Field 1: Nest type / Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="nestType">
                    Nest type*
                  </label>
                  <input
                    id="nestType"
                    type="text"
                    required
                    placeholder="Enterprise / Brand Name"
                    className="form-input"
                  />
                </div>

                {/* Field 2: Email */}
                <div className="form-group">
                  <label className="form-label" htmlFor="email">
                    Email*
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="executive@brand.com"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Field 3: Dose / access textarea */}
              <div className="form-group form-group--full">
                <label className="form-label" htmlFor="doseAccess">
                  Dose / access requirements
                </label>
                <textarea
                  id="doseAccess"
                  rows={4}
                  placeholder="Describe your project scope, timeline, and architectural goals..."
                  className="form-input form-textarea"
                />
              </div>

              {/* Submit Button */}
              <button className="btn-primary btn-contact" type="submit">
                <span>Send Inquiry</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
