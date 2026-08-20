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

  // Form field state
  const [nestType, setNestType] = useState('');
  const [email, setEmail] = useState('');
  const [doseAccess, setDoseAccess] = useState('');

  // Submission UI state
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Character count (excluding spaces)
  const MAX_CHARS = 250;
  const charCount = doseAccess.replace(/\s/g, '').length;
  const charLimitExceeded = charCount > MAX_CHARS;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Client-side character limit guard (excluding spaces)
    if (charLimitExceeded) {
      setFormError(`Your message exceeds the 250-character limit (${charCount} / 250 characters, excluding spaces). Please shorten it.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nestType, email, doseAccess }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitted(true);
      } else if (res.status === 409 && data.already_submitted) {
        setAlreadySubmitted(true);
      } else {
        setFormError(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setFormError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
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
          {/* ── Already Submitted State ── */}
          {alreadySubmitted ? (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ marginBottom: '20px', display: 'inline-flex' }}>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px', color: '#1b2b23' }}>
                Message Already Received
              </h3>
              <p style={{ fontSize: '15px', color: '#4a7060', maxWidth: '440px', margin: '0 auto', lineHeight: 1.7 }}>
                You have already submitted a message. Please wait for our team to contact you. Thank you!
              </p>
            </div>
          ) : submitted ? (
            /* ── Success State ── */
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ marginBottom: '20px', display: 'inline-flex' }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#0F8259" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px', color: '#1b2b23' }}>
                Inquiry Received
              </h3>
              <p style={{ fontSize: '15px', color: '#4a7060', maxWidth: '440px', margin: '0 auto', lineHeight: 1.6 }}>
                Thank you! Your message has been received. Please wait for our team to contact you.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {/* Two-column grid for Name + Email */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px',
                marginBottom: '20px',
              }}>
                {/* Field 1: Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  <label
                    htmlFor="nestType"
                    style={{ fontSize: '13px', fontWeight: 600, color: '#1b2b23', letterSpacing: '0.02em' }}
                  >
                    Full Name / Brand Name *
                  </label>
                  <input
                    id="nestType"
                    type="text"
                    required
                    placeholder="Enterprise / Brand Name"
                    value={nestType}
                    onChange={(e) => setNestType(e.target.value)}
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(255,255,255,0.75)',
                      border: '1.5px solid rgba(15,130,89,0.25)',
                      borderRadius: '10px',
                      fontSize: '14px',
                      color: '#1b2b23',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0F8259';
                      e.target.style.boxShadow = '0 0 0 3px rgba(15,130,89,0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(15,130,89,0.25)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Field 2: Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  <label
                    htmlFor="email"
                    style={{ fontSize: '13px', fontWeight: 600, color: '#1b2b23', letterSpacing: '0.02em' }}
                  >
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="executive@brand.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(255,255,255,0.75)',
                      border: '1.5px solid rgba(15,130,89,0.25)',
                      borderRadius: '10px',
                      fontSize: '14px',
                      color: '#1b2b23',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0F8259';
                      e.target.style.boxShadow = '0 0 0 3px rgba(15,130,89,0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(15,130,89,0.25)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Field 3: Message */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label
                    htmlFor="doseAccess"
                    style={{ fontSize: '13px', fontWeight: 600, color: '#1b2b23', letterSpacing: '0.02em' }}
                  >
                    Message / Project Requirements
                  </label>
                  {/* Live Character counter (excluding spaces) */}
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: charLimitExceeded ? '#dc2626' : charCount > 200 ? '#f59e0b' : '#6b7280',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {charCount} / {MAX_CHARS}
                  </span>
                </div>
                <textarea
                  id="doseAccess"
                  rows={5}
                  placeholder="Describe your project scope, timeline, and goals..."
                  value={doseAccess}
                  onChange={(e) => setDoseAccess(e.target.value)}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.75)',
                    border: `1.5px solid ${charLimitExceeded ? '#dc2626' : 'rgba(15,130,89,0.25)'}`,
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: '#1b2b23',
                    outline: 'none',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '130px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = charLimitExceeded ? '#dc2626' : '#0F8259';
                    e.target.style.boxShadow = charLimitExceeded
                      ? '0 0 0 3px rgba(220,38,38,0.12)'
                      : '0 0 0 3px rgba(15,130,89,0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = charLimitExceeded ? '#dc2626' : 'rgba(15,130,89,0.25)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {charLimitExceeded && (
                  <p style={{ fontSize: '12px', color: '#dc2626', margin: 0, fontWeight: 500 }}>
                    Message exceeds the 250-character limit (excluding spaces). Please shorten it before submitting.
                  </p>
                )}
              </div>

              {/* Error message */}
              {formError && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(220, 38, 38, 0.08)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  borderRadius: '8px',
                  color: '#dc2626',
                  fontSize: '13px',
                  fontWeight: 500,
                  marginBottom: '16px',
                }}>
                  ⚠ {formError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || charLimitExceeded}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '16px 32px',
                  background:
                    isSubmitting || charLimitExceeded
                      ? 'rgba(15,130,89,0.35)'
                      : 'linear-gradient(135deg, #0a6b48 0%, #0F8259 50%, #15a874 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  letterSpacing: '0.02em',
                  cursor: isSubmitting ? 'wait' : charLimitExceeded ? 'not-allowed' : 'pointer',
                  opacity: 1,
                  boxShadow: (isSubmitting || charLimitExceeded) ? 'none' : '0 8px 28px rgba(15,130,89,0.35)',
                  transition: 'all 0.25s ease',
                  pointerEvents: isSubmitting ? 'none' : 'auto',
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting && !charLimitExceeded) {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 36px rgba(15,130,89,0.45)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = (isSubmitting || charLimitExceeded) ? 'none' : '0 8px 28px rgba(15,130,89,0.35)';
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Inquiry
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
