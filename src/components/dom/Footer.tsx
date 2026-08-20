'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="footer-outro">
      <div className="footer-container">
        {/* Brand Finale Typography */}
        <div className="footer-brand">
          <h3 className="footer-brand__title">CONTROL X</h3>
          <p className="footer-brand__subtitle">Your Vision × Our Expertise</p>
        </div>

        {/* Social & Contact Links */}
        <nav aria-label="Social and Contact links" className="footer-socials-nav">
          <div className="footer-socials-grid">
            {/* 1. Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn social-btn--facebook"
              aria-label="Visit Control X on Facebook"
            >
              <span className="social-btn__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </span>
              <span className="social-btn__label">Facebook</span>
            </a>

            {/* 2. Twitter / X */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn social-btn--twitter"
              aria-label="Visit Control X on X (formerly Twitter)"
            >
              <span className="social-btn__icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </span>
              <span className="social-btn__label">Twitter</span>
            </a>

            {/* 3. Pinterest */}
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn social-btn--pinterest"
              aria-label="Visit Control X on Pinterest"
            >
              <span className="social-btn__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                </svg>
              </span>
              <span className="social-btn__label">Pinterest</span>
            </a>

            {/* 4. Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn social-btn--instagram"
              aria-label="Visit Control X on Instagram"
            >
              <span className="social-btn__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </span>
              <span className="social-btn__label">Instagram</span>
            </a>

            {/* 5. Email */}
            <a
              href="mailto:watchover705@gmail.com?subject=Inquiry%20%7C%20Control%20X"
              className="social-btn social-btn--email"
              aria-label="Send email to Control X at watchover705@gmail.com"
            >
              <span className="social-btn__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <span className="social-btn__label">Email</span>
            </a>
          </div>
        </nav>

        {/* Copyright & Technical Note */}
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} CONTROL X. All rights reserved.</span>
          <span className="footer-bottom__tech">Precision Optics & WebGL Architecture</span>
        </div>
      </div>

      {/* Scoped CSS for Footer Social Buttons & Bespoke Animations */}
      <style jsx>{`
        .footer-socials-nav {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .footer-socials-grid {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .social-btn {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 10px 18px;
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 999px;
          color: #2b3d33;
          text-decoration: none;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.02em;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                      background 0.28s ease,
                      border-color 0.28s ease,
                      color 0.28s ease,
                      box-shadow 0.28s ease;
          outline: none;
          cursor: pointer;
        }

        .social-btn:focus-visible {
          box-shadow: 0 0 0 3px rgba(15, 130, 89, 0.3);
        }

        .social-btn__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .social-btn__label {
          line-height: 1;
        }

        /* ── 1. Facebook: Gentle Float & Wave ────────────────────────────── */
        .social-btn--facebook:hover {
          transform: translateY(-4px) scale(1.04);
          background: rgba(255, 255, 255, 0.85);
          border-color: rgba(24, 119, 242, 0.45);
          color: #1877f2;
          box-shadow: 0 8px 24px rgba(24, 119, 242, 0.22);
        }
        .social-btn--facebook:hover .social-btn__icon {
          animation: fbFloat 1.4s ease-in-out infinite alternate;
        }
        @keyframes fbFloat {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-2px) scale(1.12); }
        }

        /* ── 2. Twitter / X: Dynamic Tilt & Spin ────────────────────────── */
        .social-btn--twitter:hover {
          transform: translateY(-4px) rotate(-3deg) scale(1.05);
          background: rgba(255, 255, 255, 0.88);
          border-color: rgba(0, 0, 0, 0.4);
          color: #000000;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        }
        .social-btn--twitter:hover .social-btn__icon {
          animation: xTilt 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes xTilt {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(-18deg) scale(1.2); }
          100% { transform: rotate(-10deg) scale(1.15); }
        }

        /* ── 3. Pinterest: Elastic Pulse & Spring Bounce ────────────────── */
        .social-btn--pinterest:hover {
          transform: translateY(-4px) scale(1.04);
          background: rgba(255, 255, 255, 0.85);
          border-color: rgba(230, 0, 35, 0.45);
          color: #e60023;
          box-shadow: 0 8px 24px rgba(230, 0, 35, 0.24);
        }
        .social-btn--pinterest:hover .social-btn__icon {
          animation: pinterestBounce 0.75s cubic-bezier(0.28, 0.84, 0.42, 1) infinite alternate;
        }
        @keyframes pinterestBounce {
          0% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.22) translateY(-3px); }
          100% { transform: scale(1.12) translateY(-1px); }
        }

        /* ── 4. Instagram: Smooth Radiant Aura Glow ─────────────────────── */
        .social-btn--instagram:hover {
          transform: translateY(-4px) scale(1.04);
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(225, 48, 108, 0.5);
          color: #e1306c;
          box-shadow: 0 8px 26px rgba(225, 48, 108, 0.28), 0 0 12px rgba(253, 29, 29, 0.15);
        }
        .social-btn--instagram:hover .social-btn__icon {
          animation: instaGlow 1.2s ease-in-out infinite alternate;
        }
        @keyframes instaGlow {
          0% { transform: rotate(0deg) scale(1.05); filter: drop-shadow(0 0 2px rgba(225, 48, 108, 0.4)); }
          100% { transform: rotate(8deg) scale(1.18); filter: drop-shadow(0 0 6px rgba(225, 48, 108, 0.8)); }
        }

        /* ── 5. Email: Emerald Crystal Glow & Envelope Shiver ───────────── */
        .social-btn--email:hover {
          transform: translateY(-4px) scale(1.04);
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(15, 130, 89, 0.5);
          color: #0F8259;
          box-shadow: 0 8px 24px rgba(15, 130, 89, 0.26);
        }
        .social-btn--email:hover .social-btn__icon {
          animation: emailShiver 0.8s ease-in-out infinite alternate;
        }
        @keyframes emailShiver {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.15); }
          100% { transform: translateY(-1px) scale(1.1); }
        }

        /* Mobile adaptation */
        @media (max-width: 640px) {
          .footer-socials-grid {
            gap: 10px;
          }
          .social-btn {
            padding: 8px 14px;
            font-size: 12px;
          }
        }
      `}</style>
    </footer>
  );
}
