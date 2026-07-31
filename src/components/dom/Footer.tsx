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

        {/* Social Links */}
        <div className="footer-socials">
          <a href="#facebook" className="footer-social-link" aria-label="Facebook">
            Facebook
          </a>
          <a href="#twitter" className="footer-social-link" aria-label="Twitter">
            Twitter
          </a>
          <a href="#pinterest" className="footer-social-link" aria-label="Pinterest">
            Pinterest
          </a>
          <a href="#instagram" className="footer-social-link" aria-label="Instagram">
            Instagram
          </a>
        </div>

        {/* Copyright & Technical Note */}
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} CONTROL X. All rights reserved.</span>
          <span className="footer-bottom__tech">Precision Optics & WebGL Architecture</span>
        </div>
      </div>
    </footer>
  );
}
