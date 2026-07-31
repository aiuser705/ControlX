'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const PROCESS_STEPS = [
  { id: '01', title: 'Discover',    desc: 'Deep inquiry into brand ecosystem, market dynamics, and operational architecture.' },
  { id: '02', title: 'Research',    desc: 'Quantitative telemetry and competitive landscape benchmarking.' },
  { id: '03', title: 'Strategy',    desc: 'Defining spatial visual language, optical material systems, and UI flow.' },
  { id: '04', title: 'Design',      desc: 'High-fidelity editorial typography, glassmorphism components, and 3D assets.' },
  { id: '05', title: 'Development', desc: 'Next.js App Router, custom GLSL shaders, and WebGL rendering passes.' },
  { id: '06', title: 'Launch',       desc: '60 FPS performance optimization, DPR scaling, and global deployment.' },
  { id: '07', title: 'Support',      desc: 'Continuous real-time telemetry monitoring and system scaling.' },
  { id: '08', title: 'Evolution',    desc: 'Iterative feature enhancement and brand visual progression.' },
];

export default function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeNode, setActiveNode] = useState(3); // Default 'Design' active

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Process title reveal
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

      // Green line underline draw animation
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

      // Node discs reveal
      gsap.fromTo(
        '.node-disc-item',
        { opacity: 0, scale: 0.5, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          stagger: 0.08,
          scrollTrigger: {
            trigger: '.process-rail-container',
            start: 'top 75%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="process" className="sec-process">
      <div className="process-container">
        {/* Editorial Title */}
        <div className="process-header">
          <p className="process-tagline">WORKFLOW METHODOLOGY</p>
          <h2 className="process-title">
            From Vision to Reality
            <span className="process-title__underline" aria-hidden="true"/>
          </h2>
        </div>

        {/* Process Node Rail Track */}
        <div className="process-rail-container">
          {/* Green Glass Tube Rail */}
          <div className="process-rail-track">
            <div
              className="process-rail-progress"
              style={{ width: `${((activeNode + 1) / PROCESS_STEPS.length) * 100}%` }}
            />
          </div>

          {/* 8 Node Discs */}
          <div className="process-nodes-grid">
            {PROCESS_STEPS.map((step, index) => {
              const isActive = index === activeNode;
              return (
                <div
                  key={step.id}
                  className={`node-disc-item ${isActive ? 'node-disc-item--active' : ''}`}
                  onClick={() => setActiveNode(index)}
                  onMouseEnter={() => setActiveNode(index)}
                >
                  <div className="node-disc">
                    <div className="node-disc__inner"/>
                  </div>
                  <span className="node-label">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Node Detail Card */}
        <div className="process-detail-card glass-card">
          <div className="process-detail-card__badge">
            STEP {PROCESS_STEPS[activeNode].id} / 08
          </div>
          <h3 className="process-detail-card__title">
            {PROCESS_STEPS[activeNode].title}
          </h3>
          <p className="process-detail-card__desc">
            {PROCESS_STEPS[activeNode].desc}
          </p>
        </div>
      </div>
    </section>
  );
}
