'use client';

import { Canvas } from '@react-three/fiber';
import { BackgroundPlane } from './BackgroundPlane';
import { LightingRig } from './LightingRig';
import { useScrollCamera } from '@/hooks/useScrollCamera';

interface SceneCanvasProps {
  scrollProgress: number;
}

function SceneContent({ scrollProgress }: SceneCanvasProps) {
  useScrollCamera(scrollProgress);

  return (
    <>
      <LightingRig />
      <BackgroundPlane />
    </>
  );
}

export function SceneCanvas({ scrollProgress }: SceneCanvasProps) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-full h-full">
      <Canvas
        camera={{
          fov: 45,
          near: 0.1,
          far: 1000.0,
          position: [0, 0, 8],
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <SceneContent scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}

export default SceneCanvas;
