'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Search,
  BarChart2,
  Target,
  PenTool,
  Code2,
  Rocket,
  Headphones,
  TrendingUp,
  Check,
  Gauge,
  Smartphone,
  CheckCircle2,
  Layers,
  Cpu,
  Zap,
  ShieldCheck,
  Activity,
  MessageSquare,
  GitPullRequest,
  MousePointer,
  Type,
  Square,
  Circle,
  Share2,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ── 8 Step Workflow Metadata ─────────────────────────────────────────────────

interface WorkflowStep {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: React.ReactNode;
  checkmarks: string[];
  buttonText: string;
  demoType: 'discover' | 'research' | 'strategy' | 'design' | 'development' | 'launch' | 'support' | 'evolution';
  techNodes: string[];
  metrics: { value: string; label: string; icon: React.ReactNode }[];
}

const PROCESS_STEPS: WorkflowStep[] = [
  {
    id: '01',
    title: 'Discover',
    subtitle: 'Ecosystem Analysis & Intent Mapping',
    desc: 'Deep inquiry into brand ecosystem, user intent, market dynamics, and spatial UI architecture.',
    icon: <Search className="w-5 h-5" />,
    checkmarks: ['Brand Audit', 'Market Research', 'User Intent Mapping', 'Technical Scope'],
    buttonText: 'Learn more about Discovery',
    demoType: 'discover',
    techNodes: ['Audit', 'Intent', 'Scope', 'UX Architecture'],
    metrics: [
      { value: '100%', label: 'Alignment', icon: <Check className="w-4 h-4" /> },
      { value: '48h', label: 'Sprints', icon: <Gauge className="w-4 h-4" /> },
      { value: '10x', label: 'Clarity', icon: <Target className="w-4 h-4" /> },
      { value: '100', label: 'Strategy', icon: <CheckCircle2 className="w-4 h-4" /> },
    ],
  },
  {
    id: '02',
    title: 'Research',
    subtitle: 'Quantitative Telemetry & Benchmarking',
    desc: 'Empirical telemetry benchmarking, competitive landscape mapping, and behavioral heatmaps.',
    icon: <BarChart2 className="w-5 h-5" />,
    checkmarks: ['Performance Audit', 'Competitor Analysis', 'Telemetry Data', 'Conversion Goals'],
    buttonText: 'Learn more about Research',
    demoType: 'research',
    techNodes: ['Telemetry', 'Heatmaps', 'Benchmark', 'Metrics'],
    metrics: [
      { value: '1.4M', label: 'Data Points', icon: <BarChart2 className="w-4 h-4" /> },
      { value: '0.1%', label: 'Top Rank', icon: <TrendingUp className="w-4 h-4" /> },
      { value: '99.9%', label: 'Accuracy', icon: <ShieldCheck className="w-4 h-4" /> },
      { value: '100', label: 'Insight Score', icon: <CheckCircle2 className="w-4 h-4" /> },
    ],
  },
  {
    id: '03',
    title: 'Strategy',
    subtitle: 'Spatial Language & Architectural Design',
    desc: 'Defining spatial visual language, optical material systems, GLSL shaders, and UI component hierarchy.',
    icon: <Target className="w-5 h-5" />,
    checkmarks: ['Spatial Language', 'Shader Specs', 'Component Matrix', 'Motion System'],
    buttonText: 'Learn more about Strategy',
    demoType: 'strategy',
    techNodes: ['Tokens', 'Shaders', 'Motion System', 'Architecture'],
    metrics: [
      { value: '128', label: 'Tokens', icon: <Layers className="w-4 h-4" /> },
      { value: 'GLSL', label: 'Shaders', icon: <Code2 className="w-4 h-4" /> },
      { value: '60 FPS', label: 'Target', icon: <Gauge className="w-4 h-4" /> },
      { value: '100', label: 'Scalable', icon: <CheckCircle2 className="w-4 h-4" /> },
    ],
  },
  {
    id: '04',
    title: 'Design',
    subtitle: 'High-Fidelity Optical Prototyping',
    desc: 'Crafting editorial typography, glassmorphism material passes, and real-time physical WebGL optics.',
    icon: <PenTool className="w-5 h-5" />,
    checkmarks: ['Glassmorphism', 'Editorial Type', '3D Asset Rig', 'Micro-Interactions'],
    buttonText: 'Learn more about Design',
    demoType: 'design',
    techNodes: ['Figma', 'Spline 3D', 'GLSL Optics', 'GSAP Motion'],
    metrics: [
      { value: '60 FPS', label: 'Optics', icon: <Gauge className="w-4 h-4" /> },
      { value: 'Ultra HD', label: 'Fidelity', icon: <PenTool className="w-4 h-4" /> },
      { value: '0.0', label: 'Artifacts', icon: <Check className="w-4 h-4" /> },
      { value: '100', label: 'Design Score', icon: <CheckCircle2 className="w-4 h-4" /> },
    ],
  },
  {
    id: '05',
    title: 'Development',
    subtitle: 'Next.js & Custom Shaders Architecture',
    desc: 'Pixel-perfect engineering with Next.js, App Router, TypeScript, Three.js, and custom GLSL rendering passes.',
    icon: <Code2 className="w-5 h-5" />,
    checkmarks: ['Clean Code', 'Scalable Architecture', 'High Performance', 'Secure & Reliable'],
    buttonText: 'Learn more about Development',
    demoType: 'development',
    techNodes: ['React', 'NEXT.js', 'Ts', 'Three.js', 'GSAP'],
    metrics: [
      { value: '98', label: 'Performance', icon: <Gauge className="w-4 h-4" /> },
      { value: '100', label: 'Lighthouse', icon: <Target className="w-4 h-4" /> },
      { value: '100', label: 'Best Practices', icon: <CheckCircle2 className="w-4 h-4" /> },
      { value: '100', label: 'SEO Score', icon: <Smartphone className="w-4 h-4" /> },
    ],
  },
  {
    id: '06',
    title: 'Launch',
    subtitle: 'Global Edge Deployment & Optimization',
    desc: 'Core Web Vitals optimization, 100/100 Lighthouse score tuning, DPR scaling, and global Vercel CDN deployment.',
    icon: <Rocket className="w-5 h-5" />,
    checkmarks: ['Edge CDN', 'DPR Scaling', 'Zero Layout Shift', 'SSL & Security'],
    buttonText: 'Learn more about Launch',
    demoType: 'launch',
    techNodes: ['Build', 'Vercel Edge', 'Global CDN', 'SSL'],
    metrics: [
      { value: '100', label: 'Lighthouse', icon: <Target className="w-4 h-4" /> },
      { value: '< 0.3s', label: 'FCP Speed', icon: <Zap className="w-4 h-4" /> },
      { value: '0.0', label: 'CLS Shift', icon: <Check className="w-4 h-4" /> },
      { value: '100', label: 'Security', icon: <ShieldCheck className="w-4 h-4" /> },
    ],
  },
  {
    id: '07',
    title: 'Support',
    subtitle: 'Continuous Telemetry & Health Monitoring',
    desc: 'Continuous real-time telemetry monitoring, automated health checks, and long-term system evolution.',
    icon: <Headphones className="w-5 h-5" />,
    checkmarks: ['Real-time Monitoring', 'Automated Backups', 'SLA Guaranteed', '24/7 Priority'],
    buttonText: 'Learn more about Support',
    demoType: 'support',
    techNodes: ['Telemetry', 'Health Check', 'SLA Guarantee'],
    metrics: [
      { value: '99.99%', label: 'Uptime', icon: <Activity className="w-4 h-4" /> },
      { value: '12ms', label: 'Latency', icon: <Gauge className="w-4 h-4" /> },
      { value: '24/7', label: 'Active Mon', icon: <Headphones className="w-4 h-4" /> },
      { value: '100', label: 'Health Score', icon: <CheckCircle2 className="w-4 h-4" /> },
    ],
  },
  {
    id: '08',
    title: 'Evolution',
    subtitle: 'Iterative Progression & Scaling',
    desc: 'Iterative feature enhancement, quarterly visual evolution, and strategic business scaling.',
    icon: <TrendingUp className="w-5 h-5" />,
    checkmarks: ['Quarterly Updates', 'Feature Expansion', 'Performance Tuning', 'Growth Roadmap'],
    buttonText: 'Learn more about Evolution',
    demoType: 'evolution',
    techNodes: ['v1.0', 'v2.0', 'v3.0', 'v4.0 Next Gen'],
    metrics: [
      { value: '+240%', label: 'Growth', icon: <TrendingUp className="w-4 h-4" /> },
      { value: 'v3.4', label: 'Active Ver', icon: <Cpu className="w-4 h-4" /> },
      { value: '100', label: 'Scalability', icon: <Check className="w-4 h-4" /> },
      { value: '100', label: 'Evolved', icon: <CheckCircle2 className="w-4 h-4" /> },
    ],
  },
];

// ── High-Performance Metric Counter (Direct DOM textContent Update) ──────────

function AnimatedCounter({ value }: { value: string }) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const numericMatch = value.match(/([0-9.]+)/);
    if (!spanRef.current || !numericMatch) return;

    const targetNum = parseFloat(numericMatch[1]);
    const prefix = value.substring(0, value.indexOf(numericMatch[1]));
    const suffix = value.substring(value.indexOf(numericMatch[1]) + numericMatch[1].length);

    const obj = { val: 0 };
    gsap.to(obj, {
      val: targetNum,
      duration: 0.9,
      ease: 'power2.out',
      onUpdate: () => {
        if (spanRef.current) {
          const formatted = targetNum % 1 === 0 ? Math.round(obj.val).toString() : obj.val.toFixed(1);
          spanRef.current.textContent = `${prefix}${formatted}${suffix}`;
        }
      },
    });
  }, [value]);

  return <span ref={spanRef}>{value}</span>;
}

// ── Live Research Analytics Graph Component ───────────────────────────────────

function LiveResearchGraph() {
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      pathRef.current.style.strokeDasharray = `${length}`;
      pathRef.current.style.strokeDashoffset = `${length}`;

      gsap.to(pathRef.current, {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: 'power3.inOut',
      });
    }

    let animId: number;
    let startTime = performance.now();

    const animateGraphDot = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      if (dotRef.current) {
        const progress = (elapsed * 0.35) % 1.0;
        const posX = progress * 300;
        const posY = 60 - Math.sin(progress * Math.PI * 3) * 35;
        dotRef.current.setAttribute('cx', posX.toFixed(2));
        dotRef.current.setAttribute('cy', posY.toFixed(2));
      }
      animId = requestAnimationFrame(animateGraphDot);
    };

    animId = requestAnimationFrame(animateGraphDot);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="wf-linear-graph">
      <svg viewBox="0 0 300 80" className="wf-graph-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d="M 0 60 Q 50 20 100 45 T 200 15 T 300 10 L 300 80 L 0 80 Z" fill="url(#areaGrad)" />
        <path ref={pathRef} d="M 0 60 Q 50 20 100 45 T 200 15 T 300 10" fill="none" stroke="#10B981" strokeWidth="2.8" />
        <circle ref={dotRef} r="4" fill="#ffffff" filter="drop-shadow(0 0 6px #10B981)" />
      </svg>
    </div>
  );
}

// ── Typewriter VS Code Component ──────────────────────────────────────────────

const CODE_STRING = `import { Canvas } from '@react-three/fiber'
import { EffectComposer } from '@react-three/postprocessing'
import { Bloom, DepthOfField } from 'postprocessing'

export default function Experience() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 2, 3]} />
      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={0.3} />
        <DepthOfField focusDistance={0.02} bokehScale={3} />
      </EffectComposer>
    </Canvas>
  )
}`;

function LiveTypewriterCodeEditor() {
  return (
    <div className="wf-code-window">
      <div className="wf-code-header">
        <span className="wf-dot wf-dot--red" />
        <span className="wf-dot wf-dot--yellow" />
        <span className="wf-dot wf-dot--green" />
        <span className="wf-code-title">page.tsx — Live Development</span>
      </div>
      <pre className="wf-code-content">
        <code>
          {CODE_STRING}
          <span className="wf-cursor-blink">|</span>
        </code>
      </pre>
    </div>
  );
}

// ── 8 Step Dynamic UI Component Switcher ──────────────────────────────────────

function StepDemoBlock({ step }: { step: WorkflowStep }) {
  switch (step.demoType) {
    case 'discover':
      return (
        <div className="wf-custom-ui wf-ui--discover">
          <div className="wf-discover-corkboard">
            <svg className="wf-cork-svg" viewBox="0 0 320 200">
              <path d="M 70 50 Q 150 80 230 40" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0.6" />
              <path d="M 70 50 Q 120 140 190 140" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0.6" />
            </svg>
            <div className="wf-pin-note wf-pin-note--yellow">
              <div className="wf-pin-dot" />
              <span className="wf-note-tag">✦ CLIENT BRIEF</span>
              <p>Luxury WebGL spatial optics for high-conversion brands.</p>
            </div>
            <div className="wf-pin-note wf-pin-note--dark">
              <div className="wf-pin-dot" />
              <span className="wf-note-tag">USER PERSONA</span>
              <div className="wf-persona-row">
                <div className="wf-p-avatar">CX</div>
                <div>
                  <strong>Executive Director</strong>
                  <span>Demands 60 FPS elegance</span>
                </div>
              </div>
            </div>
            <div className="wf-pin-note wf-pin-note--glass">
              <div className="wf-pin-dot" />
              <span className="wf-note-tag">GOALS</span>
              <p>Target +145% Revenue Growth & Intent Clarity.</p>
            </div>
          </div>
        </div>
      );

    case 'research':
      return (
        <div className="wf-custom-ui wf-ui--research">
          <div className="wf-linear-workspace">
            <div className="wf-linear-topbar">
              <span className="wf-linear-title">Linear Analytics • Telemetry Stream</span>
              <span className="wf-live-pill"><span className="wf-live-dot" /> LIVE</span>
            </div>
            <div className="wf-linear-metrics-row">
              <div className="wf-lm-card">
                <span className="wf-lm-lbl">SAMPLE SIZE</span>
                <strong className="wf-lm-val">1.4M pts</strong>
              </div>
              <div className="wf-lm-card">
                <span className="wf-lm-lbl">BENCHMARK</span>
                <strong className="wf-lm-val wf-lm-val--accent">Top 0.1%</strong>
              </div>
            </div>
            <LiveResearchGraph />
          </div>
        </div>
      );

    case 'strategy':
      return (
        <div className="wf-custom-ui wf-ui--strategy">
          <div className="wf-strategy-tree">
            <div className="wf-tree-header">Architectural Decision Tree</div>
            <div className="wf-tree-flow">
              <div className="wf-tree-node wf-tree-node--done">
                <span className="wf-tree-badge">01</span>
                <span>Spatial Language</span>
              </div>
              <div className="wf-tree-line wf-tree-line--active" />
              <div className="wf-tree-node wf-tree-node--active">
                <span className="wf-tree-badge">02</span>
                <span>Raymarched Shaders</span>
              </div>
              <div className="wf-tree-line" />
              <div className="wf-tree-node">
                <span className="wf-tree-badge">03</span>
                <span>Edge Deployment</span>
              </div>
            </div>
            <div className="wf-tree-chips">
              <span className="wf-chip">Raymarched Optics</span>
              <span className="wf-chip">GSAP Motion</span>
              <span className="wf-chip">60 FPS</span>
            </div>
          </div>
        </div>
      );

    case 'design':
      return (
        <div className="wf-custom-ui wf-ui--design">
          <div className="wf-figma-app">
            <div className="wf-figma-nav">
              <div className="wf-figma-tools">
                <MousePointer className="w-3.5 h-3.5" />
                <Square className="w-3.5 h-3.5" />
                <Circle className="w-3.5 h-3.5" />
                <Type className="w-3.5 h-3.5" />
              </div>
              <span className="wf-figma-zoom">Figma • 100%</span>
              <span className="wf-figma-share"><Share2 className="w-3 h-3" /> Share</span>
            </div>
            <div className="wf-figma-body">
              <div className="wf-figma-swatches">
                <div className="wf-f-swatch" style={{ background: '#0F8259' }} title="Emerald Primary" />
                <div className="wf-f-swatch" style={{ background: '#10B981' }} title="Mint Glow" />
                <div className="wf-f-swatch" style={{ background: '#EBE9E1' }} title="Quartz Ivory" />
                <div className="wf-f-swatch" style={{ background: '#18191C' }} title="Obsidian Text" />
              </div>
              <div className="wf-figma-wireframe">
                <div className="wf-fw-header">Playfair Display 32px</div>
                <div className="wf-fw-box" />
              </div>
            </div>
          </div>
        </div>
      );

    case 'development':
      return (
        <div className="wf-custom-ui wf-ui--dev">
          <LiveTypewriterCodeEditor />
        </div>
      );

    case 'launch':
      return (
        <div className="wf-custom-ui wf-ui--launch">
          <div className="wf-deploy-terminal">
            <div className="wf-deploy-top">
              <GitPullRequest className="w-4 h-4 text-emerald-400" />
              <span>GitHub Actions • Workflow #418</span>
              <span className="wf-pass-pill">✓ PASSED</span>
            </div>
            <div className="wf-deploy-steps">
              <div className="wf-d-step">✓ git push origin main (1.2s)</div>
              <div className="wf-d-step">✓ Next.js Build Succeeded (4.8s)</div>
              <div className="wf-d-step">✓ Lighthouse Audit 100/100 (0.0 CLS)</div>
              <div className="wf-d-step wf-d-step--active">● Vercel Global Edge Deployed</div>
            </div>
          </div>
        </div>
      );

    case 'support':
      return (
        <div className="wf-custom-ui wf-ui--support">
          <div className="wf-support-inbox">
            <div className="wf-inbox-top">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Support Center • Priority Live Inbox</span>
            </div>
            <div className="wf-inbox-grid">
              <div className="wf-ticket wf-ticket--resolved">
                <span className="wf-t-status">✓ RESOLVED</span>
                <strong>SLA Health Check</strong>
                <span>12ms Latency Guaranteed</span>
              </div>
              <div className="wf-ticket wf-ticket--active">
                <span className="wf-t-status wf-t-status--active">● ONLINE</span>
                <strong>24/7 Priority Support</strong>
                <span>Zero Downtime Monitored</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'evolution':
      return (
        <div className="wf-custom-ui wf-ui--evolution">
          <div className="wf-evo-workspace">
            <div className="wf-evo-header">Product Evolution & Growth Roadmap</div>
            <div className="wf-evo-nodes">
              <div className="wf-e-node">
                <span className="wf-e-ver">v1.0</span>
                <span>Core Engine</span>
              </div>
              <span className="wf-e-arrow">→</span>
              <div className="wf-e-node">
                <span className="wf-e-ver">v2.0</span>
                <span>Raymarched Shaders</span>
              </div>
              <span className="wf-e-arrow">→</span>
              <div className="wf-e-node wf-e-node--active">
                <span className="wf-e-ver">v3.4</span>
                <span>Spatial UI</span>
              </div>
            </div>
            <div className="wf-growth-badge">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>+240% Growth Delta • Continuous Upgrades</span>
            </div>
          </div>
        </div>
      );
  }
}

// ── Fluid Micro Bubbles Generator ─────────────────────────────────────────────

const BUBBLE_COUNT = 20;

// ── Main Process Section Component ───────────────────────────────────────────

export default function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const bubbleGroupRef = useRef<SVGGElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [activeNode, setActiveNode] = useState(4); // Default Step 05 (Development) active
  const [activeTechTag, setActiveTechTag] = useState(1);

  // Calculate percentage along the rail track
  const progressPercent = ((activeNode + 1) / PROCESS_STEPS.length) * 100;
  const progressWidthPixels = Math.max(10, progressPercent * 9.96);

  // Smooth GSAP Card Transition
  const handleSelectNode = (index: number) => {
    if (index === activeNode) return;

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      nodeRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }

    if (cardRef.current) {
      gsap.to(cardRef.current, {
        opacity: 0,
        y: 12,
        duration: 0.18,
        ease: 'power2.in',
        onComplete: () => {
          setActiveNode(index);
          setActiveTechTag(1);
          gsap.to(cardRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: 'power2.out',
          });
        },
      });
    } else {
      setActiveNode(index);
    }
  };

  // Interactive Tech Tag Click Handler with Spring GSAP Animation
  const handleTechTagClick = (tagIndex: number, event: React.MouseEvent<HTMLDivElement>) => {
    setActiveTechTag(tagIndex);
    const target = event.currentTarget;
    gsap.fromTo(
      target,
      { scale: 1.18 },
      { scale: 1.0, duration: 0.35, ease: 'back.out(1.7)' }
    );
  };

  // Fluid Micro-Particle Simulation Loop (Bounded Strictly to [0, currentFilledWidth])
  useEffect(() => {
    let startTime = performance.now();

    const animateBubbles = (now: number) => {
      const elapsed = (now - startTime) / 1000;

      if (bubbleGroupRef.current) {
        const bubbleElements = bubbleGroupRef.current.children;
        const currentFilledWidth = Math.max(10, ((activeNode + 1) / PROCESS_STEPS.length) * 996);

        for (let i = 0; i < bubbleElements.length; i++) {
          const circle = bubbleElements[i] as SVGCircleElement;
          const speed = 0.15 + (i % 5) * 0.06;
          const initialOffset = (i * 0.12) % 1.0;
          
          const normX = (initialOffset + elapsed * speed) % 1.0;
          const posX = 4 + normX * (currentFilledWidth - 8);
          const posY = 14 + Math.sin(elapsed * 2.5 + i) * 2.5;

          circle.setAttribute('cx', posX.toFixed(2));
          circle.setAttribute('cy', posY.toFixed(2));
        }
      }

      animFrameRef.current = requestAnimationFrame(animateBubbles);
    };

    animFrameRef.current = requestAnimationFrame(animateBubbles);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeNode]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.process-title',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
        }
      );

      gsap.fromTo(
        '.process-title__underline',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.0,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Card Mouse Parallax
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = (-(y - centerY) / centerY) * 3.5;
    const rotY = ((x - centerX) / centerX) * 3.5;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-2px)`;
  };

  const handleCardMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  };

  const activeStep = PROCESS_STEPS[activeNode];

  return (
    <section ref={sectionRef} id="process" className="sec-process">
      <div className="wf-particle-backdrop" aria-hidden="true">
        <div className="wf-particle wf-particle--1" />
        <div className="wf-particle wf-particle--2" />
        <div className="wf-particle wf-particle--3" />
        <div className="wf-particle wf-particle--4" />
      </div>

      <div className="process-container">
        {/* Editorial Header */}
        <div className="process-header">
          <p className="process-tagline">WORKFLOW METHODOLOGY</p>
          <h2 className="process-title">
            From Vision to Reality
            <span className="process-title__underline" aria-hidden="true" />
          </h2>
        </div>

        {/* 3D Glass Pipeline & Active Breathing Nodes */}
        <div className="process-rail-container">
          <div className="process-rail-track-svg">
            <svg viewBox="0 0 1000 28" preserveAspectRatio="none" className="wf-svg-rail">
              <defs>
                <linearGradient id="glassTubeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
                  <stop offset="25%" stopColor="rgba(255, 255, 255, 0.25)" />
                  <stop offset="50%" stopColor="rgba(15, 130, 89, 0.15)" />
                  <stop offset="75%" stopColor="rgba(4, 78, 52, 0.25)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.50)" />
                </linearGradient>

                <linearGradient id="liquidEmeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#044E34" />
                  <stop offset="35%" stopColor="#0F8259" />
                  <stop offset="70%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>

                <filter id="emeraldBloom" x="-20%" y="-100%" width="140%" height="300%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <rect
                x="0"
                y="6"
                width="1000"
                height="16"
                rx="8"
                fill="url(#glassTubeGrad)"
                stroke="rgba(255, 255, 255, 0.75)"
                strokeWidth="1.2"
              />

              <rect
                x="2"
                y="8"
                width={`${progressWidthPixels}`}
                height="12"
                rx="6"
                fill="url(#liquidEmeraldGrad)"
                filter="url(#emeraldBloom)"
                className="wf-svg-liquid-fill"
              />

              <rect x="4" y="7" width="992" height="2" rx="1" fill="rgba(255, 255, 255, 0.85)" />

              {/* Micro-Bubbles Constrained to [0, progressWidth] */}
              <g ref={bubbleGroupRef} className="wf-bubble-group">
                {Array.from({ length: BUBBLE_COUNT }).map((_, i) => (
                  <circle
                    key={i}
                    r={(1.2 + (i % 4) * 0.8).toFixed(1)}
                    fill="#ffffff"
                    opacity={(0.4 + (i % 3) * 0.25).toFixed(2)}
                    filter="url(#emeraldBloom)"
                  />
                ))}
              </g>
            </svg>
          </div>

          {/* 8 Glass Control Spheres */}
          <div className="process-nodes-grid">
            {PROCESS_STEPS.map((step, index) => {
              const isActive = index === activeNode;
              const isPast = index < activeNode;

              return (
                <div
                  key={step.id}
                  ref={(el) => { nodeRefs.current[index] = el; }}
                  className={`node-disc-item ${isActive ? 'node-disc-item--active' : ''} ${isPast ? 'node-disc-item--past' : ''}`}
                  onClick={() => handleSelectNode(index)}
                  onMouseEnter={() => handleSelectNode(index)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Workflow step ${step.id}: ${step.title}`}
                >
                  <div className="node-disc">
                    <div className="node-glass-glare" />
                    <div className="node-disc__icon">{step.icon}</div>
                    {isActive && <div className="node-disc__ripple" />}
                  </div>
                  <span className="node-label">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3-Column Detail Card */}
        <div
          ref={cardRef}
          className="process-detail-card glass-card"
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
          <div className="process-card-grid">
            {/* Column 1: Info & Checklist */}
            <div className="process-card-col process-card-col--info">
              <div className="process-detail-card__badge">
                STEP {activeStep.id} / 08
              </div>
              <h3 className="process-detail-card__title">{activeStep.title}</h3>
              <p className="process-detail-card__desc">{activeStep.desc}</p>

              <div className="process-checkmarks-grid">
                {activeStep.checkmarks.map((item, i) => (
                  <div key={i} className="wf-check-item">
                    <span className="wf-check-icon"><Check className="w-3.5 h-3.5" /></span>
                    <span className="wf-check-text">{item}</span>
                  </div>
                ))}
              </div>

              <button type="button" className="process-card-btn">
                {activeStep.buttonText} →
              </button>
            </div>

            {/* Column 2: 8 Distinct UI Component Visualizations */}
            <div className="process-card-col process-card-col--code">
              <StepDemoBlock step={activeStep} />
            </div>

            {/* Column 3: Interactive Tech Tags + High-Performance Animated Counters */}
            <div className="process-card-col process-card-col--tech">
              {/* Interactive Tech Tags */}
              <div className="wf-tech-tree">
                {activeStep.techNodes.map((node, i) => {
                  const isTagActive = i === activeTechTag;
                  return (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="wf-tech-line" />}
                      <div
                        className={`wf-tech-badge ${isTagActive ? 'wf-tech-badge--active' : ''}`}
                        onClick={(e) => handleTechTagClick(i, e)}
                        role="button"
                        tabIndex={0}
                      >
                        {node}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Metric Badges with Direct DOM Count-Up Animations */}
              <div className="wf-metrics-2x2">
                {activeStep.metrics.map((m, i) => (
                  <div key={i} className="wf-metric-badge">
                    <div className="wf-metric-badge__icon">{m.icon}</div>
                    <strong className="wf-metric-badge__val">
                      <AnimatedCounter value={m.value} />
                    </strong>
                    <span className="wf-metric-badge__label">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
