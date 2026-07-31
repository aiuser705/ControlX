'use client';

import { useEffect, useState, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugin at module scope as required by GSAP best practices
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function useLenis() {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis with exact spec parameters
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    lenisRef.current = lenisInstance;
    setLenis(lenisInstance);

    // Sync Lenis scroll events with ScrollTrigger
    lenisInstance.on('scroll', (e: { progress: number }) => {
      ScrollTrigger.update();
      setScrollProgress(e.progress);
    });

    // Connect Lenis RAF to GSAP ticker to avoid double RAF request loops
    const updateTicker = (time: number) => {
      lenisInstance.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    
    // Disable lag smoothing to prevent scroll jitter on tab switches or frame drops
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenisInstance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  return { lenis, scrollProgress };
}
