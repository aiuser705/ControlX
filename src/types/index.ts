export interface CameraKeyframe {
  time: number;
  position: [number, number, number];
  rotation: [number, number, number];
  ease: string;
}

export interface ScrollMapItem {
  pct: [number, number];
  section: string;
  cameraZ: number;
  xLogoVisible: boolean;
  particles: number;
}

export interface ResponsiveZ {
  desktop: number;
  laptop: number;
  tablet: number;
  mobile: number;
}

export type CursorHoverTarget = 'x-logo' | 'card' | 'button' | 'node-disc' | null;
