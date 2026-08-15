'use client';

import React, { useEffect, useRef } from 'react';

/**
 * ChromaKeyVideo — Safari/iOS-Reliable Real-Time Canvas Chroma Key Component
 *
 * 1. Loads video in a hidden HTML5 video element (muted, loop, playsInline, autoPlay).
 * 2. Waits for video 'loadeddata'/'canplay' and valid non-black decoded frames before sampling.
 * 3. Dynamically samples background color from corner pixel (sampleX, sampleY) at runtime.
 * 4. Processes each video frame to a 2D Canvas via requestAnimationFrame.
 * 5. Applies Euclidean RGB distance & chromaticity thresholding with smooth edge feathering and total despill.
 * 6. Supports interactive 3D mouse parallax tilt, depth shadow, and specular highlights.
 */

export interface ChromaKeyVideoProps {
  src: string;
  className?: string;
  threshold?: number;
  feather?: number;
  sampleX?: number;
  sampleY?: number;
  maxWidth?: string;
  aspectRatio?: string;
}

export default function ChromaKeyVideo({
  src = '/videos/X2-trimmed.mp4',
  className = '',
  threshold = 50,
  feather = 25,
  sampleX = 2,
  sampleY = 2,
  maxWidth,
  aspectRatio = '16 / 9',
}: ChromaKeyVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const targetPos = useRef({ x: 0, y: 0, dist: 0 });
  const currentPos = useRef({ x: 0, y: 0, dist: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Create hidden HTML5 video element
    const video = document.createElement('video');
    video.src = src;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = 'auto';
    videoRef.current = video;

    let targetR = 119;
    let targetG = 40;
    let targetB = 72;
    let isVideoReady = false;
    let animId: number;

    const procWidth = 640;
    const procHeight = 360;
    canvas.width = procWidth;
    canvas.height = procHeight;

    const featherInv = feather > 0 ? 1.0 / feather : 1.0;
    const thresholdSq = threshold * threshold;
    const maxDist = threshold + feather;
    const maxDistSq = maxDist * maxDist;

    const onReady = () => {
      isVideoReady = true;
      video.play().catch(() => {});
    };

    video.addEventListener('loadeddata', onReady);
    video.addEventListener('canplay', onReady);
    video.addEventListener('playing', () => { isVideoReady = true; });

    video.play().catch(() => {
      // Autoplay user interaction fallback
      const resume = () => {
        video.play().catch(() => {});
        window.removeEventListener('click', resume);
        window.removeEventListener('touchstart', resume);
      };
      window.addEventListener('click', resume, { once: true });
      window.addEventListener('touchstart', resume, { once: true });
    });

    const processFrame = () => {
      animId = requestAnimationFrame(processFrame);

      if (video.readyState < 2 || video.paused) {
        return;
      }

      // Draw current video frame to processing canvas
      ctx.drawImage(video, 0, 0, procWidth, procHeight);

      // Extract image data
      const imgData = ctx.getImageData(0, 0, procWidth, procHeight);
      const data = imgData.data;
      const len = data.length;

      // Sample corner color at (sampleX, sampleY) — ignore black / uninitialized frames
      const sampleIdx = (sampleY * procWidth + sampleX) * 4;
      if (sampleIdx < len - 4) {
        const sr = data[sampleIdx];
        const sg = data[sampleIdx + 1];
        const sb = data[sampleIdx + 2];

        // Valid non-black frame detection (avoids black-frame sampling race condition)
        if (sr + sg + sb > 50) {
          targetR = sr;
          targetG = sg;
          targetB = sb;
        }
      }

      // High-performance typed array chroma key processing loop
      for (let i = 0; i < len; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean color distance from sampled background color
        const dr = r - targetR;
        const dg = g - targetG;
        const db = b - targetB;
        const distSq = dr * dr + dg * dg + db * db;

        // Pink/Magenta Chromatic Excess Metric (handles central bright gradient)
        const minRB = r < b ? r : b;
        const maxRB = r > b ? r : b;
        const pinkExcess = minRB - g;

        // Emerald Glass Protection (Green dominance: G > max(R, B))
        const greenDelta = g - maxRB;
        const greenProt = greenDelta > 0 ? (greenDelta > 8 ? 1.0 : greenDelta / 8.0) : 0.0;

        // Specular White Glint Protection (R, G, B all > 160)
        const brightMin = r < g ? (r < b ? r : b) : (g < b ? g : b);
        const specProt = brightMin > 160 ? (brightMin > 200 ? 1.0 : (brightMin - 160) / 40.0) : 0.0;

        const totalProt = greenProt > specProt ? greenProt : specProt;

        // Combined Background Matching
        // 1. Direct Euclidean distance from corner
        // 2. Magenta chromatic excess in central lighting gradient
        let alphaNorm = 1.0;
        if (distSq <= thresholdSq || (pinkExcess >= 22 && totalProt < 0.2)) {
          // Exact background match — 100% transparent
          alphaNorm = 0.0;
        } else if (distSq < maxDistSq || (pinkExcess >= 10 && totalProt < 0.5)) {
          // Edge boundary feathering
          const dist = Math.sqrt(distSq);
          const eAlpha = (dist - threshold) * featherInv;
          const pAlpha = 1.0 - (pinkExcess - 10) / 14.0;
          alphaNorm = Math.min(Math.max(0.0, eAlpha), Math.max(0.0, pAlpha));
        }

        // Protection overrides for crystal glass & highlights
        if (totalProt > 0.0) {
          alphaNorm = Math.max(alphaNorm, totalProt);
        }

        if (alphaNorm <= 0.01) {
          data[i + 3] = 0;
        } else {
          const finalAlpha = Math.min(255, Math.max(0, Math.round(alphaNorm * 255)));
          data[i + 3] = finalAlpha;

          // Total Edge Despill: eliminates pink/magenta fringe on glass boundaries
          if (pinkExcess > 0 && greenProt < 1.0) {
            const despillAmount = pinkExcess * (1.0 - greenProt) * (1.0 - alphaNorm * 0.5);
            data[i] = Math.max(0, Math.min(255, Math.round(r - despillAmount)));
            data[i + 2] = Math.max(0, Math.min(255, Math.round(b - despillAmount)));
          }
        }
      }

      // Write back modified pixels to canvas
      ctx.putImageData(imgData, 0, 0);
    };

    animId = requestAnimationFrame(processFrame);

    return () => {
      cancelAnimationFrame(animId);
      video.removeEventListener('loadeddata', onReady);
      video.removeEventListener('canplay', onReady);
      video.pause();
      video.removeAttribute('src');
      video.load();
      videoRef.current = null;
    };
  }, [src, threshold, feather, sampleX, sampleY]);

  // ── Mouse Parallax & 3D Tilt Interaction ─────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const nx = (e.clientX - centerX) / (window.innerWidth / 2);
      const ny = (e.clientY - centerY) / (window.innerHeight / 2);

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.min(1, Math.sqrt(dx * dx + dy * dy) / 450);

      targetPos.current = { x: nx, y: ny, dist };
    };

    window.addEventListener('mousemove', handleMouseMove);

    let rafId: number;
    let t = 0;

    const animatePhysics = () => {
      rafId = requestAnimationFrame(animatePhysics);
      t += 0.018;

      const cp = currentPos.current;
      const tp = targetPos.current;
      cp.x += (tp.x - cp.x) * 0.08;
      cp.y += (tp.y - cp.y) * 0.08;
      cp.dist += (tp.dist - cp.dist) * 0.08;

      const rotY = cp.x * 5;                  // 5deg max Y tilt
      const rotX = -cp.y * 4;                 // 4deg max X tilt
      const transX = cp.x * 12;               // 12px horizontal parallax
      const transY = cp.y * 10;               // 10px vertical parallax
      const bobY = Math.sin(t) * 4;           // 4px subtle floating bob
      const scale = 1 + (1 - cp.dist) * 0.02; // 2% micro scale response

      if (containerRef.current) {
        containerRef.current.style.transform = `
          perspective(1000px)
          translate3d(${transX}px, ${transY + bobY}px, 0px)
          rotateX(${rotX}deg)
          rotateY(${rotY}deg)
          scale3d(${scale}, ${scale}, 1)
        `;
      }

      // Dynamic Ground Shadow Shift
      if (shadowRef.current) {
        const shadowX = -cp.x * 14;
        shadowRef.current.style.transform = `translateX(-50%) translateX(${shadowX}px)`;
        shadowRef.current.style.opacity = `${0.32 + (1 - cp.dist) * 0.10}`;
      }

      // Specular Highlight Dynamic Follow
      if (highlightRef.current) {
        const sheenIntensity = 0.50 + (1 - cp.dist) * 0.30;
        highlightRef.current.style.background = `
          radial-gradient(
            circle at ${50 + cp.x * 25}% ${45 + cp.y * 25}%,
            rgba(255, 255, 255, ${0.35 * sheenIntensity}) 0%,
            rgba(168, 240, 212, ${0.18 * sheenIntensity}) 35%,
            transparent 70%
          )
        `;
      }

      // Proximity Glow Ring
      if (glowRef.current) {
        const glowOpacity = (1 - cp.dist) * 0.40;
        glowRef.current.style.background = `
          radial-gradient(
            circle at ${50 + cp.x * 15}% ${50 + cp.y * 15}%,
            rgba(15, 130, 89, ${0.18 * glowOpacity}) 0%,
            rgba(77, 248, 186, ${0.08 * glowOpacity}) 45%,
            transparent 70%
          )
        `;
      }
    };

    animatePhysics();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className={`glass-x-scene glass-x-wrapper ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: maxWidth || '520px',
        aspectRatio,
        margin: '0 auto',
      }}
    >
      {/* Tilt & Physics Container */}
      <div
        ref={containerRef}
        className="glass-x-container"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* Ground Depth Shadow */}
        <div
          ref={shadowRef}
          className="glass-x-ground-shadow"
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '-28px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '240px',
            height: '24px',
            background:
              'radial-gradient(ellipse at center, rgba(10, 45, 30, 0.28) 0%, rgba(15, 130, 89, 0.08) 50%, transparent 80%)',
            filter: 'blur(8px)',
            pointerEvents: 'none',
            zIndex: 2,
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Real-time Chroma Key Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 3,
          }}
        />

        {/* Ground Mirror Reflection Overlay */}
        <div
          className="glass-x-reflection-v2"
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '-18px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '200px',
            height: '20px',
            background:
              'radial-gradient(ellipse at center, rgba(15, 130, 89, 0.22) 0%, rgba(168, 240, 212, 0.10) 45%, transparent 75%)',
            filter: 'blur(5px)',
            pointerEvents: 'none',
            zIndex: 4,
          }}
        />

        {/* Specular Highlight Sheen Layer */}
        <div
          ref={highlightRef}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            mixBlendMode: 'overlay',
            borderRadius: '50%',
            opacity: 0.85,
            zIndex: 5,
          }}
        />

        {/* Cursor Proximity Glow Ring */}
        <div
          ref={glowRef}
          style={{
            position: 'absolute',
            inset: '-15px',
            pointerEvents: 'none',
            borderRadius: '50%',
            opacity: 0.9,
            zIndex: 6,
          }}
        />
      </div>
    </div>
  );
}
