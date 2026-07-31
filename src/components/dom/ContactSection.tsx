'use client';

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        formCardRef.current,
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.0,
          ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section ref={sectionRef} id="contact" className="sec-contact">
      <div className="contact-container">
        {/* Outro Call To Action Header */}
        <h2 className="contact-title">
          Let&apos;s Build Something<br />
          <span className="contact-title__highlight">Extraordinary Together.</span>
        </h2>

        {/* Interactive Glass Form Card */}
        <div ref={formCardRef} className="contact-card glass-card">
          {submitted ? (
            <div className="contact-success">
              <div className="contact-success__icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0F8259" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
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
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
