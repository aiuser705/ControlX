'use client';

import React, { useEffect, useRef } from 'react';

/**
 * GlassX — Canonical Hero Video Asset Component
 * Source Video: /videos/x_animation_3.mp4 (Master Canonical Approved Asset: "x_animation_3.mp4")
 *
 * PRODUCTION GPU MAGENTA CHROMA KEY ENGINE:
 * 1. Precision Magenta Background Removal: Detects min(R, B) - G backdrop excess.
 * 2. 100% Emerald Glass Protection: Preserves crystal glass body (G > max(R, B)), internal refractions,
 *    specular glints, and surface reflections without color tinting or edge damage.
 * 3. Sub-Pixel Edge Despill: Eliminates magenta fringe on transparent edge boundaries.
 * 4. Dual-Buffer Seamless Looper: Auto-calculates duration and loops crossfade dynamically.
 */

interface GlassXProps {
  src?: string;
  className?: string;
}

// ── WebGL Shaders ─────────────────────────────────────────────────────────────

const VERTEX_SHADER_SOURCE = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y); // Flip Y for WebGL texture
  }
`;

const FRAGMENT_SHADER_SOURCE = `
  precision highp float;
  varying vec2 v_texCoord;

  uniform sampler2D u_textureA;
  uniform sampler2D u_textureB;
  uniform float u_crossfade; // 0.0 = full A, 1.0 = full B

  // Production GPU Magenta Chroma Keyer for x_animation_3.mp4
  vec4 processMagentaChromaKey(vec4 color) {
    vec3 rgb = color.rgb;

    // Magenta Excess Metric: min(R, B) - G
    float minRB = min(rgb.r, rgb.b);
    float maxRB = max(rgb.r, rgb.b);
    float magentaExcess = minRB - rgb.g;

    // 1. Pure Magenta Backdrop Match (Red and Blue are high, Green is low)
    float magMatch = smoothstep(0.02, 0.15, magentaExcess);

    // 2. Emerald Glass Preservation Protection (Green dominance: G > max(R, B))
    float emeraldProtection = smoothstep(0.02, 0.10, rgb.g - maxRB);

    // 3. Final Adaptive Alpha Calculation
    float alpha = 1.0 - magMatch * (1.0 - emeraldProtection);

    // Matte cleanup curve for clean sub-pixel edge feathering
    alpha = smoothstep(0.02, 0.95, alpha);

    // 4. Sub-Pixel Anti-Aliased Edge Magenta Despill
    float edgeSpillWeight = (1.0 - alpha) * smoothstep(0.02, 0.90, alpha);
    float despillAmount = max(0.0, magentaExcess) * edgeSpillWeight * 0.85;
    rgb.r -= despillAmount;
    rgb.b -= despillAmount;

    return vec4(rgb, color.a * alpha);
  }

  void main() {
    vec4 colA = texture2D(u_textureA, v_texCoord);
    vec4 colB = texture2D(u_textureB, v_texCoord);

    vec4 keyedA = processMagentaChromaKey(colA);
    vec4 keyedB = processMagentaChromaKey(colB);

    // Dynamic seamless loop crossfade
    gl_FragColor = mix(keyedA, keyedB, u_crossfade);
  }
`;

export default function GlassX({
  src = '/videos/x_animation_3.mp4',
  className = '',
}: GlassXProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const targetPos = useRef({ x: 0, y: 0, dist: 0 });
  const currentPos = useRef({ x: 0, y: 0, dist: 0 });

  // ── WebGL & Video Playback State ─────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
    if (!gl) {
      console.warn('WebGL context unavailable');
      return;
    }

    // 1. Compile Shaders
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // 2. Setup Geometry Buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1, 0, 0,
        1, -1, 1, 0,
        -1, 1, 0, 1,
        -1, 1, 0, 1,
        1, -1, 1, 0,
        1, 1, 1, 1,
      ]),
      gl.STATIC_DRAW
    );

    const aPosition = gl.getAttribLocation(program, 'a_position');
    const aTexCoord = gl.getAttribLocation(program, 'a_texCoord');
    const uTextureA = gl.getUniformLocation(program, 'u_textureA');
    const uTextureB = gl.getUniformLocation(program, 'u_textureB');
    const uCrossfade = gl.getUniformLocation(program, 'u_crossfade');

    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(aTexCoord);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 16, 8);

    // 3. WebGL Textures
    const createGLTexture = () => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return tex;
    };

    const textureA = createGLTexture();
    const textureB = createGLTexture();

    // 4. Dual HTML Video Players for Dynamic Seamless Looping
    const createVideoPlayer = () => {
      const v = document.createElement('video');
      v.src = src;
      v.autoplay = false;
      v.loop = false;
      v.muted = true;
      v.playsInline = true;
      v.crossOrigin = 'anonymous';
      return v;
    };

    const videoA = createVideoPlayer();
    const videoB = createVideoPlayer();

    let duration = 10.0;
    let crossfadeDuration = 0.5;

    videoA.addEventListener('loadedmetadata', () => {
      if (videoA.duration && !isNaN(videoA.duration)) {
        duration = videoA.duration;
        crossfadeDuration = Math.min(0.6, Math.max(0.25, duration * 0.05));
      }
      if (videoA.videoWidth && canvas) {
        canvas.width = videoA.videoWidth;
        canvas.height = videoA.videoHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    });

    videoA.play().catch(() => { });
    let activePlayer = 'A';
    let isCrossfading = false;
    let crossfadeProgress = 0.0;
    let animId: number;

    // 5. Render Loop
    const render = () => {
      animId = requestAnimationFrame(render);

      const activeVid = activePlayer === 'A' ? videoA : videoB;
      const currentTime = activeVid.currentTime;

      // Dynamic seamless loop trigger near video end
      if (duration > 0 && currentTime >= duration - crossfadeDuration && !isCrossfading) {
        isCrossfading = true;
        if (activePlayer === 'A') {
          videoB.currentTime = 0;
          videoB.play().catch(() => { });
        } else {
          videoA.currentTime = 0;
          videoA.play().catch(() => { });
        }
      }

      if (isCrossfading) {
        crossfadeProgress += 1 / (crossfadeDuration * 60);
        if (crossfadeProgress >= 1.0) {
          crossfadeProgress = 1.0;
          isCrossfading = false;
          if (activePlayer === 'A') {
            videoA.pause();
            activePlayer = 'B';
          } else {
            videoB.pause();
            activePlayer = 'A';
          }
          crossfadeProgress = 0.0;
        }
      }

      // Update Textures
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textureA);
      if (videoA.readyState >= 2) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoA);
      }

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, textureB);
      if (videoB.readyState >= 2) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoB);
      }

      gl.uniform1i(uTextureA, 0);
      gl.uniform1i(uTextureB, 1);

      const blendFactor = activePlayer === 'A' ? crossfadeProgress : 1.0 - crossfadeProgress;
      gl.uniform1f(uCrossfade, blendFactor);

      // Render Quad
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      videoA.pause();
      videoB.pause();
      videoA.remove();
      videoB.remove();
      gl.deleteTexture(textureA);
      gl.deleteTexture(textureB);
      gl.deleteProgram(program);
    };
  }, [src]);

  // ── Mouse Interactions (Strictly Outside Video Layer) ────────────────────────
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

      // Soft mouse interactions (preserves optical asset integrity)
      const rotY = cp.x * 5;                // 5deg max Y tilt
      const rotX = -cp.y * 4;               // 4deg max X tilt
      const transX = cp.x * 12;             // 12px horizontal parallax
      const transY = cp.y * 10;             // 10px vertical parallax
      const bobY = Math.sin(t) * 4;         // 4px subtle floating bob
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

      // Dynamic Ground Shadow Shift (Layer 2)
      if (shadowRef.current) {
        const shadowX = -cp.x * 14;
        shadowRef.current.style.transform = `translateX(-50%) translateX(${shadowX}px)`;
        shadowRef.current.style.opacity = `${0.40 + (1 - cp.dist) * 0.12}`;
      }

      // Specular Highlight Movement (Layer 5)
      if (highlightRef.current) {
        const sheenX = 50 + cp.x * 35;
        const sheenY = 50 + cp.y * 35;
        highlightRef.current.style.background = `
          radial-gradient(
            circle at ${sheenX}% ${sheenY}%,
            rgba(255, 255, 255, 0.35) 0%,
            rgba(168, 240, 212, 0.15) 40%,
            transparent 70%
          )
        `;
      }

      // Cursor Proximity Glow (Layer 6)
      if (glowRef.current) {
        const glowX = 50 + cp.x * 30;
        const glowY = 50 + cp.y * 30;
        glowRef.current.style.background = `
          radial-gradient(
            circle at ${glowX}% ${glowY}%,
            rgba(15, 130, 89, 0.30) 0%,
            rgba(168, 240, 212, 0.12) 50%,
            transparent 80%
          )
        `;
      }
    };

    animatePhysics();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className={`glass-x-scene ${className}`} aria-label="Hero Glass X Video Experience">
      {/* 3D Interactive Outer Container Wrapper */}
      <div
        ref={containerRef}
        className="glass-x-wrapper"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* Layer 2: Ground Shadow (Subtle Ambient Ground Depth) */}
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
            background: 'radial-gradient(ellipse at center, rgba(10, 45, 30, 0.35) 0%, rgba(15, 130, 89, 0.12) 50%, transparent 80%)',
            filter: 'blur(8px)',
            pointerEvents: 'none',
            zIndex: 2,
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Layer 3: Hero X Video WebGL Canvas (x_animation_3.mp4 GPU Magenta Chroma Keyed Asset) */}
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 3,
          }}
        />

        {/* Layer 4: Reflection Overlay (Ground Mirror Flare beneath X) */}
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
            background: 'radial-gradient(ellipse at center, rgba(15, 130, 89, 0.38) 0%, rgba(168, 240, 212, 0.18) 45%, transparent 75%)',
            filter: 'blur(5px)',
            pointerEvents: 'none',
            zIndex: 4,
          }}
        />

        {/* Layer 5: Specular Highlight Layer (Cursor-driven Sheen overlay) */}
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

        {/* Layer 6: Cursor Highlight (Proximity Glow Halo) */}
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
