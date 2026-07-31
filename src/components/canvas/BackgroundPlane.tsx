'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import fragmentShader from '@/shaders/background.fragment.glsl';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Modular video asset source — Swappable anytime without changing logic or shaders
export const BACKGROUND_VIDEO_PATH = '/videos/Create_a_second_cinematic_e.mp4';

export function BackgroundPlane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size, pointer } = useThree();
  const prevMouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const velocityRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));

  // Initialize THREE.VideoTexture with clean looping background video asset
  const { videoTexture, videoElement } = useMemo(() => {
    if (typeof window === 'undefined') return { videoTexture: null, videoElement: null };

    const video = document.createElement('video');
    video.src = BACKGROUND_VIDEO_PATH;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.play().catch(() => {
      // Autoplay fallback
    });

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;

    return { videoTexture: texture, videoElement: video };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uVelocity: { value: new THREE.Vector2(0, 0) },
      uVideoTexture: { value: videoTexture },
    }),
    [videoTexture]
  );

  useEffect(() => {
    return () => {
      if (videoElement) {
        videoElement.pause();
        videoElement.removeAttribute('src');
        videoElement.load();
      }
      if (videoTexture) {
        videoTexture.dispose();
      }
    };
  }, [videoElement, videoTexture]);

  useFrame((state, delta) => {
    if (materialRef.current) {
      // Calculate mouse velocity for interactive displacement
      const currentMouse = new THREE.Vector2(pointer.x, pointer.y);
      const mouseDelta = currentMouse.clone().sub(prevMouseRef.current);

      // Smooth velocity interpolation (lerp)
      velocityRef.current.lerp(mouseDelta.divideScalar(Math.max(delta, 0.001)), 0.15);
      prevMouseRef.current.copy(currentMouse);

      // Update shader uniforms per frame
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uResolution.value.set(state.size.width, state.size.height);
      materialRef.current.uniforms.uMouse.value.set(pointer.x, pointer.y);
      materialRef.current.uniforms.uVelocity.value.copy(velocityRef.current);

      if (videoTexture) {
        materialRef.current.uniforms.uVideoTexture.value = videoTexture;
      }
    }
  });

  return (
    <mesh renderOrder={-1000} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
