'use client';

import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CAMERA_KEYFRAMES, SCROLL_MAP } from '@/constants/camera';
import gsap from 'gsap';

// Cubic bezier evaluator for CSS cubic-bezier(x1, y1, x2, y2) strings
function createCubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let u = t;
    for (let i = 0; i < 8; i++) {
      const currentX = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
      const currentDx = 3 * (1 - u) * (1 - u) * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2);
      if (Math.abs(currentDx) < 1e-6) break;
      u -= (currentX - t) / currentDx;
      u = Math.max(0, Math.min(1, u));
    }
    return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
  };
}

// Safely parse any GSAP or CSS cubic-bezier easing string into a callable function
function getEaseFunction(easeStr: string): (t: number) => number {
  if (!easeStr || easeStr === 'linear' || easeStr === 'none') {
    return (t: number) => t;
  }

  if (typeof easeStr === 'string' && easeStr.startsWith('cubic-bezier(')) {
    const matches = easeStr.match(/cubic-bezier\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/);
    if (matches && matches.length === 5) {
      const [, x1, y1, x2, y2] = matches.map(Number);
      return createCubicBezier(x1, y1, x2, y2);
    }
  }

  try {
    const parsed = gsap.parseEase(easeStr);
    if (typeof parsed === 'function') {
      return parsed;
    }
  } catch {
    // Fallback to linear if parseEase fails
  }

  return (t: number) => t;
}

// Pre-parse ease functions for all keyframes to avoid per-frame parsing overhead
const EASE_CACHE = CAMERA_KEYFRAMES.map((kf) => getEaseFunction(kf.ease));

export function useScrollCamera(scrollProgress: number) {
  const [xLogoVisible, setXLogoVisible] = useState<boolean>(true);
  const prevVisibilityRef = useRef<boolean>(true);

  useFrame(({ camera }) => {
    const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
    const currentTime = clampedProgress * 10.0; // Map 0.0-1.0 progress to 0.0-10.0s timeline

    // Determine current keyframe segment
    let startIdx = 0;
    let endIdx = CAMERA_KEYFRAMES.length - 1;

    for (let i = 0; i < CAMERA_KEYFRAMES.length - 1; i++) {
      if (currentTime >= CAMERA_KEYFRAMES[i].time && currentTime <= CAMERA_KEYFRAMES[i + 1].time) {
        startIdx = i;
        endIdx = i + 1;
        break;
      }
    }

    const startFrame = CAMERA_KEYFRAMES[startIdx];
    const endFrame = CAMERA_KEYFRAMES[endIdx];

    // Calculate segment progress (0.0 -> 1.0)
    const duration = endFrame.time - startFrame.time;
    const segmentProgress = duration > 0 ? (currentTime - startFrame.time) / duration : 0;

    // Evaluate easing curve using pre-parsed ease function
    const easeFunc = EASE_CACHE[endIdx];
    const easedFactor = easeFunc(segmentProgress);

    // Lerp positions
    const posX = startFrame.position[0] + (endFrame.position[0] - startFrame.position[0]) * easedFactor;
    const posY = startFrame.position[1] + (endFrame.position[1] - startFrame.position[1]) * easedFactor;
    const posZ = startFrame.position[2] + (endFrame.position[2] - startFrame.position[2]) * easedFactor;

    // Lerp rotations
    const rotX = startFrame.rotation[0] + (endFrame.rotation[0] - startFrame.rotation[0]) * easedFactor;
    const rotY = startFrame.rotation[1] + (endFrame.rotation[1] - startFrame.rotation[1]) * easedFactor;
    const rotZ = startFrame.rotation[2] + (endFrame.rotation[2] - startFrame.rotation[2]) * easedFactor;

    camera.position.set(posX, posY, posZ);
    camera.rotation.set(rotX, rotY, rotZ);

    // Determine X Logo visibility state from SCROLL_MAP
    const currentPct = clampedProgress * 100;
    const activeMap = SCROLL_MAP.find(
      (item) => currentPct >= item.pct[0] && currentPct <= item.pct[1]
    );

    const isVisible = activeMap ? activeMap.xLogoVisible : true;
    if (isVisible !== prevVisibilityRef.current) {
      prevVisibilityRef.current = isVisible;
      setXLogoVisible(isVisible);
    }
  });

  return { xLogoVisible };
}

