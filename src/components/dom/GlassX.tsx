'use client';

import React, { useEffect, useRef } from 'react';

/**
 * GlassX — Canonical Hero Video Asset Component
 * Source Video: /videos/new_x.mp4 (Master Canonical Approved Asset: "NEW X")
 *
 * PRODUCTION GPU MAGENTA/BERRY CHROMA KEY ENGINE:
 * 1. Precision Background Removal: Detects min(R, B) - G backdrop excess across the dynamic lighting gradient.
 * 2. 100% Emerald Glass Protection: Preserves crystal glass body (G > max(R, B)), internal refractions,
 *    specular glints, and surface reflections without color tinting or edge damage.
 * 3. Specular Highlight Protection: Preserves bright white optical glints (min(R, G, B) > 0.55).
 * 4. Total Edge Despill: Eliminates all magenta/pink fringe and edge halos on rotating rings and glass edges.
 * 5. Premultiplied Alpha Blending: Guarantees 100% transparent zero-noise backdrop on WebGL canvas.
 * 6. Dual-Buffer Seamless Looper: Auto-calculates duration and loops crossfade dynamically.
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

  // Production GPU Chroma Keyer for new X.mp4
  vec4 processChromaKey(vec4 color) {
    vec3 rgb = color.rgb;

    // Magenta Excess Metric: min(R, B) - G
    float minRB = min(rgb.r, rgb.b);
    float maxRB = max(rgb.r, rgb.b);
    float excess = minRB - rgb.g;

    // 1. Magenta Backdrop Match
    float bgMatch = smoothstep(0.04, 0.11, excess);

    // 2. Emerald Glass Preservation Protection (Green dominance: G > max(R, B))
    float greenProtection = smoothstep(0.00, 0.04, rgb.g - maxRB);

    // 3. Specular Glint Protection (Pure bright white glints and flares)
    float brightProtection = smoothstep(0.55, 0.80, min(min(rgb.r, rgb.g), rgb.b));
    float totalProtection = max(greenProtection, brightProtection);

    // 4. Final Adaptive Alpha Calculation
    float alpha = 1.0 - bgMatch * (1.0 - totalProtection);
    alpha = smoothstep(0.01, 0.98, alpha);

    // 5. Total Edge Despill (Eliminates all pink/magenta halo around glass rings)
    float despill = max(0.0, excess) * (1.0 - greenProtection);
    rgb.r = clamp(rgb.r - despill, 0.0, 1.0);
    rgb.b = clamp(rgb.b - despill, 0.0, 1.0);

    // Premultiply RGB by calculated alpha for clean WebGL canvas alpha blending
    float finalAlpha = color.a * alpha;
    return vec4(rgb * finalAlpha, finalAlpha);
  }

  void main() {
    vec4 colA = texture2D(u_textureA, v_texCoord);
    vec4 colB = texture2D(u_textureB, v_texCoord);

    vec4 keyedA = processChromaKey(colA);
    vec4 keyedB = processChromaKey(colB);

    // Dynamic seamless loop crossfade
    gl_FragColor = mix(keyedA, keyedB, u_crossfade);
  }
`;

export default function GlassX({
  src = '/videos/new_x.mp4',
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
      premultipliedAlpha: true,
    });
    if (!gl) {
      console.warn('WebGL context unavailable');
      return;
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

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

    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(aTexCoord);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 16, 8);

    const uTextureA = gl.getUniformLocation(program, 'u_textureA');
    const uTextureB = gl.getUniformLocation(program, 'u_textureB');
    const uCrossfade = gl.getUniformLocation(program, 'u_crossfade');

    // 3. Create Textures
    const createVideoTexture = () => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return tex;
    };

    const textureA = createVideoTexture();
    const textureB = createVideoTexture();

    // 4. Setup Dual Video Loop Elements
    const createVideo = () => {
      const v = document.createElement('video');
      v.src = src;
      v.crossOrigin = 'anonymous';
      v.loop = false;
      v.muted = true;
      v.playsInline = true;
      v.preload = 'auto';
      return v;
    };

    const videoA = createVideo();
    const videoB = createVideo();

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

      // Render Quad with transparent background
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
        shadowRef.current.style.opacity = `${0.35 + (1 - cp.dist) * 0.10}`;
      }

      // Specular Highlight Dynamic Follow (Layer 5)
      if (highlightRef.current) {
        const sheenIntensity = 0.50 + (1 - cp.dist) * 0.30;
        highlightRef.current.style.background = `
          radial-gradient(
            circle at ${50 + cp.x * 25}% ${45 + cp.y * 25}%,
            rgba(255, 255, 255, ${0.40 * sheenIntensity}) 0%,
            rgba(168, 240, 212, ${0.20 * sheenIntensity}) 35%,
            transparent 70%
          )
        `;
      }

      // Proximity Glow Ring (Layer 6)
      if (glowRef.current) {
        const glowOpacity = (1 - cp.dist) * 0.45;
        glowRef.current.style.background = `
          radial-gradient(
            circle at ${50 + cp.x * 15}% ${50 + cp.y * 15}%,
            rgba(15, 130, 89, ${0.20 * glowOpacity}) 0%,
            rgba(77, 248, 186, ${0.10 * glowOpacity}) 45%,
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
      className={`glass-x-wrapper ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '560px',
        aspectRatio: '16 / 9',
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
            background: 'radial-gradient(ellipse at center, rgba(10, 45, 30, 0.28) 0%, rgba(15, 130, 89, 0.08) 50%, transparent 80%)',
            filter: 'blur(8px)',
            pointerEvents: 'none',
            zIndex: 2,
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Layer 3: Hero X Video WebGL Canvas (NEW X GPU Chroma Keyed Asset) */}
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
            background: 'radial-gradient(ellipse at center, rgba(15, 130, 89, 0.25) 0%, rgba(168, 240, 212, 0.12) 45%, transparent 75%)',
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
