'use client';

import { useEffect, useRef } from 'react';
import Navigation from '@/components/dom/Navigation';
import HeroSection from '@/components/dom/HeroSection';
import BrandStorySection from '@/components/dom/BrandStorySection';
import ServicesSection from '@/components/dom/ServicesSection';
import ProcessSection from '@/components/dom/ProcessSection';
import PortfolioSection from '@/components/dom/PortfolioSection';
import ContactSection from '@/components/dom/ContactSection';
import Footer from '@/components/dom/Footer';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure video plays automatically & continuously
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        const handleInteraction = () => {
          video.play();
          window.removeEventListener('click', handleInteraction);
          window.removeEventListener('touchstart', handleInteraction);
        };
        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
      });
    }

    // Smooth mouse parallax effect on background video container
    let rawX = 0, rawY = 0;
    let currentX = 0, currentY = 0;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      rawX = (e.clientX / window.innerWidth - 0.5) * 30; // Max 15px shift
      rawY = (e.clientY / window.innerHeight - 0.5) * 30;
    };

    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      currentX += (rawX - currentX) * 0.05; // Smooth lerp
      currentY += (rawY - currentY) * 0.05;

      if (containerRef.current) {
        containerRef.current.style.transform = `scale(1.05) translate3d(${currentX}px, ${currentY}px, 0)`;
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <>
      {/* ── Layer 0: Original Reference Video (Softened & Calibrated) ────────── */}
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          zIndex: 0,
          pointerEvents: 'none',
          willChange: 'transform',
        }}
      >
        <video
          ref={videoRef}
          src="/videos/background.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
            filter: 'brightness(0.86) contrast(0.84) saturate(0.82)',
          }}
        />
      </div>

      {/* ── Layer 1: Full-Screen Architectural Frosted Glass Overlay ────────── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1,
          pointerEvents: 'none',
          background: 'rgba(235, 233, 225, 0.48)', // Warm cream tint #EBE9E1
          backdropFilter: 'blur(16px) saturate(120%) brightness(1.02)',
          WebkitBackdropFilter: 'blur(16px) saturate(120%) brightness(1.02)',
          boxShadow: 'inset 0 0 120px rgba(0, 0, 0, 0.06)',
        }}
      />

      {/* ── Layer 10: DOM UI & Interactive Components Overlay ───────────────── */}
      <div
        id="ui"
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100svh',
        }}
      >
        <Navigation />
        <HeroSection />
        <BrandStorySection />
        <ServicesSection />
        <ProcessSection />
        <PortfolioSection />
        <ContactSection />
        <Footer />
      </div>
    </>
  );
}
