'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Eye,
  ShieldCheck,
  Sparkles,
  User,
  Target,
  Briefcase,
  Star,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Award,
  Clock,
  Handshake,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const FEATURES = [
  {
    icon: Eye,
    title: 'Vision-First Approach',
    desc: 'Your direction is always protected and preserved without compromise.',
  },
  {
    icon: ShieldCheck,
    title: 'Total Brand Ownership',
    desc: 'You own every decision, asset, design, and code repository.',
  },
  {
    icon: Sparkles,
    title: 'Transparent Process',
    desc: 'Nothing happens without your explicit review and approval.',
  },
];

const RELATIONSHIPS = [
  { id: 'creator', label: 'Control X × Creator', sub: 'Designers, Artists & Visionaries', nodeIdx: 0 },
  { id: 'startup', label: 'Control X × Startup', sub: 'Founders & Next-Gen Products', nodeIdx: 1 },
  { id: 'business', label: 'Control X × Business', sub: 'Enterprise Brands & Platforms', nodeIdx: 2 },
  { id: 'vision', label: 'Control X × Your Vision', sub: 'Your Unique Brand Identity', nodeIdx: 3 },
];

const NODES = [
  { id: 'creator', label: 'CREATOR', icon: User, pos: 'top-left' },
  { id: 'startup', label: 'STARTUP', icon: Target, pos: 'bottom-left' },
  { id: 'business', label: 'BUSINESS', icon: Briefcase, pos: 'top-right' },
  { id: 'vision', label: 'YOUR VISION', icon: Star, pos: 'bottom-right' },
];

const WHY_CHOOSE_US = [
  {
    icon: Target,
    title: 'Strategic By Design',
    desc: 'We combine strategy and creativity to build digital experiences that perform.',
  },
  {
    icon: TrendingUp,
    title: 'Scalable & Future-Ready',
    desc: 'We use modern technologies and best practices to ensure your brand is future-proof.',
  },
  {
    icon: UserCheck,
    title: 'Client-Centric',
    desc: 'Your goals drive every decision. You stay in control at every step of the journey.',
  },
  {
    icon: Award,
    title: 'Quality Without Compromise',
    desc: 'Clean code, thoughtful design, and rigorous testing — every time.',
  },
  {
    icon: Clock,
    title: 'Timely Delivery',
    desc: 'We respect your time and consistently deliver on schedule.',
  },
  {
    icon: Handshake,
    title: 'Long-Term Partner',
    desc: "We don't just launch projects. We build relationships that create lasting value.",
  },
];

export default function BrandStorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const particleGroupRef = useRef<SVGGElement>(null);
  const particleTweenRef = useRef<gsap.core.Tween | null>(null);

  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [pulseX, setPulseX] = useState(false);

  // ── Canvas: 3D Crystal X + Concentric Orbit Rings + Floating Dust Motes ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // Floating particles
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * 500,
      y: Math.random() * 500,
      r: Math.random() * 1.8 + 0.4,
      sx: (Math.random() - 0.5) * 0.25,
      sy: (Math.random() - 0.5) * 0.25 - 0.05,
      a: Math.random() * 0.35 + 0.1,
      aSpd: (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
    }));

    const render = () => {
      animId = requestAnimationFrame(render);
      t += 0.006;

      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2 - 10;

      ctx.clearRect(0, 0, W, H);

      // Soft ambient radial backlight
      const bgGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 210);
      bgGlow.addColorStop(0, 'rgba(15, 130, 89, 0.14)');
      bgGlow.addColorStop(0.5, 'rgba(15, 130, 89, 0.03)');
      bgGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, W, H);

      // Concentric Orbit Rings
      const rings = [
        { r: 70, spd: 0.35, dash: [4, 4], alpha: 0.3 },
        { r: 115, spd: -0.22, dash: [6, 8], alpha: 0.18 },
        { r: 160, spd: 0.14, dash: [3, 9], alpha: 0.12 },
      ];

      rings.forEach(({ r, spd, dash, alpha }) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * spd);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(15, 130, 89, ${alpha})`;
        ctx.lineWidth = 1.2;
        ctx.setLineDash(dash);
        ctx.stroke();

        // Traveling glowing orb on ring
        const orbAng = t * spd * 2.8;
        const ox = Math.cos(orbAng) * r;
        const oy = Math.sin(orbAng) * r;
        ctx.fillStyle = 'rgba(168, 240, 212, 0.9)';
        ctx.beginPath();
        ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Drifting motes / particles
      particles.forEach((p) => {
        p.x += p.sx;
        p.y += p.sy;
        p.a += p.aSpd;
        if (p.a >= 0.45 || p.a <= 0.05) p.aSpd *= -1;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.fillStyle = `rgba(15, 130, 89, ${Math.max(0, p.a)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Center 3D Crystal X (with slow breathing)
      const scaleBreathe = 1 + Math.sin(t * 1.2) * 0.03;
      const xSize = Math.min(W, H) * 0.42;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scaleBreathe, scaleBreathe);

      // Deep volumetric shadow under X
      const xGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, xSize * 0.7);
      xGlow.addColorStop(0, 'rgba(15, 130, 89, 0.25)');
      xGlow.addColorStop(0.5, 'rgba(15, 130, 89, 0.06)');
      xGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = xGlow;
      ctx.fillRect(-xSize, -xSize, xSize * 2, xSize * 2);

      // Multi-layered 3D crystal text fill
      ctx.font = `900 ${xSize}px "Playfair Display", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Layer 1: Outer emerald bloom glow
      ctx.shadowColor = 'rgba(15, 130, 89, 0.85)';
      ctx.shadowBlur = 45;
      ctx.fillStyle = 'rgba(15, 130, 89, 0.3)';
      ctx.fillText('X', 0, 0);

      // Layer 2: Core glass emerald gradient
      ctx.shadowBlur = 20;
      const gradX = ctx.createLinearGradient(-xSize * 0.5, -xSize * 0.5, xSize * 0.5, xSize * 0.5);
      gradX.addColorStop(0, '#0F8259');
      gradX.addColorStop(0.5, '#10B981');
      gradX.addColorStop(1, '#054D34');
      ctx.fillStyle = gradX;
      ctx.fillText('X', 0, 0);

      // Layer 3: Specular crystal highlight top stroke
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.strokeText('X', 0, 0);

      ctx.restore();
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  // ── Particle Animation Trigger on Hover/Active Card (OPTION A) ─────
  useEffect(() => {
    // Stop any running particle animation
    if (particleTweenRef.current) {
      particleTweenRef.current.kill();
      particleTweenRef.current = null;
    }

    const particleGroup = particleGroupRef.current;
    if (!particleGroup) return;

    // Default: No particle moving when nothing is hovered
    if (hoveredNode === null) {
      gsap.to(particleGroup, { opacity: 0, duration: 0.2, overwrite: true });
      return;
    }

    const activePath = pathRefs.current[hoveredNode];
    if (!activePath) return;

    let totalLength = 0;
    try {
      totalLength = activePath.getTotalLength();
    } catch {
      return;
    }
    if (totalLength <= 0) return;

    // Set initial position at Node (progress = 0) and reveal
    const startPt = activePath.getPointAtLength(0);
    gsap.set(particleGroup, {
      opacity: 1,
      transform: `translate(${startPt.x}px, ${startPt.y}px)`,
    });

    const progressObj = { val: 0 };

    // Move Node -> X -> Node in continuous loop (2.2s roundtrip)
    particleTweenRef.current = gsap.to(progressObj, {
      val: 1,
      duration: 1.1,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      onUpdate: () => {
        if (!particleGroupRef.current || !activePath) return;
        const currentPt = activePath.getPointAtLength(progressObj.val * totalLength);
        gsap.set(particleGroupRef.current, {
          transform: `translate(${currentPt.x}px, ${currentPt.y}px)`,
        });
      },
    });

    return () => {
      if (particleTweenRef.current) {
        particleTweenRef.current.kill();
        particleTweenRef.current = null;
      }
    };
  }, [hoveredNode]);

  // ── GSAP ScrollTrigger Sequence ──────────────────────────────────
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      // 1. Header reveal
      gsap.fromTo(
        '.bs-header-tag',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: '.bs-header-tag', start: 'top 85%' } }
      );
      gsap.fromTo(
        '.bs-header-headline',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'expo.out', delay: 0.1, scrollTrigger: { trigger: '.bs-header-headline', start: 'top 85%' } }
      );

      // 2. Left CONTROL Panel & Feature Modules stagger
      gsap.fromTo(
        '.bs-left-panel',
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.bs-main-row', start: 'top 78%' } }
      );
      gsap.fromTo(
        '.bs-feature-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.bs-feature-list', start: 'top 80%' } }
      );

      // 3. Center Arena & SVG Connection Paths Draw
      gsap.fromTo(
        '.bs-center-arena',
        { opacity: 0, scale: 0.94 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.bs-main-row', start: 'top 78%' } }
      );
      gsap.fromTo(
        '.bs-svg-path',
        { strokeDashoffset: 400 },
        { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.15, scrollTrigger: { trigger: '.bs-center-arena', start: 'top 75%' } }
      );

      // 4. Floating Nodes stagger
      gsap.fromTo(
        '.bs-node',
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.6)', stagger: 0.1, scrollTrigger: { trigger: '.bs-center-arena', start: 'top 75%' } }
      );

      // 5. Right X Panel & Relationship Modules stagger
      gsap.fromTo(
        '.bs-right-panel',
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 1.1, ease: 'expo.out', delay: 0.15, scrollTrigger: { trigger: '.bs-main-row', start: 'top 78%' } }
      );
      gsap.fromTo(
        '.bs-rel-btn',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.bs-rel-list', start: 'top 80%' } }
      );

      // 6. Promise Equation Bar sequential reveal
      const eqTimeline = gsap.timeline({
        scrollTrigger: { trigger: '.bs-promise-bar', start: 'top 88%' },
      });
      eqTimeline
        .fromTo('.bs-eq-cap--1', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' })
        .fromTo('.bs-eq-op--1', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out' }, '-=0.3')
        .fromTo('.bs-eq-cap--2', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, '-=0.2')
        .fromTo('.bs-eq-op--2', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out' }, '-=0.3')
        .fromTo('.bs-eq-cap--3', { opacity: 0, y: 15, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.4)' }, '-=0.2');

      // 7. WHY CHOOSE US Section reveal
      gsap.fromTo(
        '.bs-why-container',
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.bs-why-container', start: 'top 85%' },
        }
      );
      gsap.fromTo(
        '.bs-why-tag',
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.bs-why-container', start: 'top 82%' },
        }
      );
      gsap.fromTo(
        '.bs-why-headline',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'expo.out',
          delay: 0.1,
          scrollTrigger: { trigger: '.bs-why-container', start: 'top 82%' },
        }
      );
      gsap.fromTo(
        '.bs-why-card',
        { opacity: 0, y: 20, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: { trigger: '.bs-why-row', start: 'top 85%' },
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ── Hover Cross-Interaction Handlers ──────────────────────────────
  const handleRelHover = (nodeIdx: number) => {
    setHoveredNode(nodeIdx);
    setPulseX(true);
    setTimeout(() => setPulseX(false), 400);
  };

  const handleRelLeave = () => {
    setHoveredNode(null);
  };

  // 3D Card Tilt Effect
  const handleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    gsap.to(el, {
      rotateX: -y * 4,
      rotateY: x * 4,
      duration: 0.3,
      ease: 'power2.out',
      transformPerspective: 1000,
    });
  };

  const handleTiltReset = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'expo.out',
    });
  };

  return (
    <section ref={sectionRef} id="about" className="bs-section-master" aria-label="Control X Brand Story">
      <div className="bs-container">

        {/* Section Top Header */}
        <div className="bs-header-wrap">
          <span className="bs-header-tag">OUR NAME. OUR PHILOSOPHY.</span>
          <h2 className="bs-header-headline">
            More Than <span className="bs-serif-em">Just a Name</span>
          </h2>
          <p className="bs-header-sub">
            Every unforgettable brand begins with a meaningful story. Control&nbsp;X isn&apos;t just a
            company name—it&apos;s the philosophy behind every digital experience we build.
          </p>
        </div>

        {/* ── 3-COLUMN MASTER COMPOSITION (CONTROL | HERO X | X COLLABORATION) ── */}
        <div className="bs-main-row">

          {/* ── LEFT PANEL: CONTROL & FEATURE MODULES ─────────────────────── */}
          <div
            className="bs-panel bs-left-panel"
            onMouseMove={handleTilt}
            onMouseLeave={handleTiltReset}
          >
            <div className="bs-panel-header">
              <div className="bs-hex-badge">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="bs-panel-tag">THE FOUNDATION</span>
            </div>

            <h3 className="bs-panel-title">CONTROL</h3>

            <p className="bs-panel-desc">
              Your vision, your direction, your goals — always in your hands. We never overwrite your direction.
              From initial strategy to final launch, you retain 100% brand ownership.
            </p>

            {/* 3 Luxury Feature Modules */}
            <div className="bs-feature-list">
              {FEATURES.map((feat, i) => {
                const IconComp = feat.icon;
                return (
                  <div key={i} className="bs-feature-card">
                    <div className="bs-feature-accent-line" />
                    <div className="bs-feature-icon-box">
                      <IconComp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="bs-feature-body">
                      <h4 className="bs-feature-title">{feat.title}</h4>
                      <p className="bs-feature-desc">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── CENTER PANEL: HERO INTERACTIVE X & CONNECTED NODES ──────────── */}
          <div className={`bs-center-arena ${pulseX ? 'bs-center-arena--pulse' : ''}`}>
            {/* Interactive Canvas (3D Crystal X + Orbit Rings + Motes) */}
            <canvas ref={canvasRef} className="bs-canvas" />

            {/* Curved SVG Connection Paths with Animated Stroke & Pulse */}
            <svg ref={svgRef} className="bs-svg-overlay" viewBox="0 0 400 480" preserveAspectRatio="none">
              <defs>
                <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0F8259" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.3" />
                </linearGradient>
                <radialGradient id="particleGlowGrad">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="35%" stopColor="#a8f0d4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
                <filter id="whiteGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Curve 0: Creator (Top-Left) */}
              <path
                ref={(el) => { pathRefs.current[0] = el; }}
                d="M 65 75 C 90 120, 130 200, 200 230"
                fill="none"
                stroke="url(#curveGrad)"
                strokeWidth="2"
                strokeDasharray="400"
                strokeDashoffset="0"
                className={`bs-svg-path ${hoveredNode === 0 ? 'bs-svg-path--active' : ''}`}
              />

              {/* Curve 1: Startup (Bottom-Left) */}
              <path
                ref={(el) => { pathRefs.current[1] = el; }}
                d="M 65 395 C 90 350, 130 260, 200 230"
                fill="none"
                stroke="url(#curveGrad)"
                strokeWidth="2"
                strokeDasharray="400"
                strokeDashoffset="0"
                className={`bs-svg-path ${hoveredNode === 1 ? 'bs-svg-path--active' : ''}`}
              />

              {/* Curve 2: Business (Top-Right) */}
              <path
                ref={(el) => { pathRefs.current[2] = el; }}
                d="M 335 75 C 310 120, 270 200, 200 230"
                fill="none"
                stroke="url(#curveGrad)"
                strokeWidth="2"
                strokeDasharray="400"
                strokeDashoffset="0"
                className={`bs-svg-path ${hoveredNode === 2 ? 'bs-svg-path--active' : ''}`}
              />

              {/* Curve 3: Vision (Bottom-Right) */}
              <path
                ref={(el) => { pathRefs.current[3] = el; }}
                d="M 335 395 C 310 350, 270 260, 200 230"
                fill="none"
                stroke="url(#curveGrad)"
                strokeWidth="2"
                strokeDasharray="400"
                strokeDashoffset="0"
                className={`bs-svg-path ${hoveredNode === 3 ? 'bs-svg-path--active' : ''}`}
              />

              {/* Moving White Glowing Particle (Triggers ONLY on Hover / Active Node) */}
              <g ref={particleGroupRef} style={{ opacity: 0, pointerEvents: 'none' }}>
                <circle cx="0" cy="0" r="11" fill="url(#particleGlowGrad)" />
                <circle cx="0" cy="0" r="3.5" fill="#ffffff" filter="url(#whiteGlow)" />
              </g>
            </svg>

            {/* 4 Connected Floating Glass Nodes */}
            {NODES.map((node, idx) => {
              const IconComp = node.icon;
              const isHighlighted = hoveredNode === idx;
              return (
                <div
                  key={node.id}
                  className={`bs-node bs-node--${node.pos} ${isHighlighted ? 'bs-node--active' : ''}`}
                  onMouseEnter={() => setHoveredNode(idx)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <div className="bs-node-circle">
                    <IconComp className="w-4.5 h-4.5 text-emerald-600" />
                  </div>
                  <span className="bs-node-label">{node.label}</span>
                </div>
              );
            })}
          </div>

          {/* ── RIGHT PANEL: X & INTERACTIVE RELATIONSHIP MODULES ──────────── */}
          <div
            className="bs-panel bs-right-panel"
            onMouseMove={handleTilt}
            onMouseLeave={handleTiltReset}
          >
            <div className="bs-panel-header bs-panel-header--right">
              <div className="bs-hex-badge">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="bs-panel-tag">COLLABORATION</span>
            </div>

            <div className="bs-x-heading-wrap">
              <h3 className="bs-panel-title bs-panel-title--x">X</h3>
              <div className="bs-accent-line" />
            </div>

            <p className="bs-panel-desc bs-panel-desc--x">
              X represents collaboration — the meeting point where your vision and our engineering expertise intersect to create something extraordinary.
            </p>

            {/* 4 Interactive Relationship Modules */}
            <div className="bs-rel-list">
              {RELATIONSHIPS.map((rel) => {
                const isSelected = hoveredNode === rel.nodeIdx;
                return (
                  <button
                    key={rel.id}
                    type="button"
                    onMouseEnter={() => handleRelHover(rel.nodeIdx)}
                    onMouseLeave={handleRelLeave}
                    className={`bs-rel-btn ${isSelected ? 'bs-rel-btn--active' : ''}`}
                  >
                    <div className="bs-rel-sweep" />
                    <div className="bs-rel-dot" />
                    <div className="bs-rel-text-box">
                      <span className="bs-rel-label">{rel.label}</span>
                      <span className="bs-rel-sub">{rel.sub}</span>
                    </div>
                    <ArrowRight className="bs-rel-arrow w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── PROMISE EQUATION BAR (FLOATING GLASS CAPSULES) ─────────────────── */}
        <div className="bs-promise-bar">
          <span className="bs-promise-tag">OUR PROMISE</span>

          <div className="bs-equation-row">
            <div className="bs-eq-cap bs-eq-cap--1">
              <span className="bs-cap-text bs-cap-text--green">Your Vision</span>
            </div>

            <span className="bs-eq-op bs-eq-op--1">×</span>

            <div className="bs-eq-cap bs-eq-cap--2">
              <span className="bs-cap-text bs-cap-text--dark">Our Expertise</span>
            </div>

            <span className="bs-eq-op bs-eq-op--2">=</span>

            <div className="bs-eq-cap bs-eq-cap--3 bs-eq-cap--result">
              <span className="bs-cap-text bs-cap-text--result">Extraordinary Digital Experiences</span>
            </div>
          </div>
        </div>

        {/* ── 16. WHY CHOOSE US SECTION (PREMIUM GLASS SYSTEM) ──────────────── */}
        <div className="bs-why-container">
          <div className="bs-why-header">
            <span className="bs-why-tag">WHY CHOOSE US</span>
            <h3 className="bs-why-headline">
              Built Different. <span className="bs-serif-em">For Results That Matter.</span>
            </h3>
          </div>

          <div className="bs-why-row">
            {WHY_CHOOSE_US.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="bs-why-card">
                  <div className="bs-why-icon-wrap">
                    <IconComp className="w-4.5 h-4.5 text-emerald-600" />
                  </div>
                  <h4 className="bs-why-title">{item.title}</h4>
                  <p className="bs-why-desc">{item.desc}</p>
                  {idx < WHY_CHOOSE_US.length - 1 && <div className="bs-why-divider" />}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
