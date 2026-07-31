import { CameraKeyframe, ScrollMapItem, ResponsiveZ } from '@/types';
import { EASE_QUARTZ } from './motion';

export const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  { time: 0.0, position: [0.0, 0.0, 8.0], rotation: [0.0, 0.0, 0.0], ease: 'linear' },
  { time: 1.5, position: [0.0, 0.0, 8.0], rotation: [0.0, 0.0, 0.0], ease: EASE_QUARTZ },
  { time: 5.5, position: [0.0, -2.5, 10.5], rotation: [-0.05, 0.0, 0.0], ease: EASE_QUARTZ },
  { time: 8.0, position: [0.0, -5.0, 9.0], rotation: [0.0, 0.0, 0.0], ease: EASE_QUARTZ },
  { time: 10.0, position: [0.0, -7.2, 7.5], rotation: [0.0, 0.0, 0.0], ease: 'cubic-bezier(0.25, 1, 0.5, 1)' },
];

export const SCROLL_MAP: ScrollMapItem[] = [
  { pct: [0, 15], section: 'Hero Section', cameraZ: 8.0, xLogoVisible: true, particles: 0 },
  { pct: [16, 40], section: 'Services Section', cameraZ: 10.5, xLogoVisible: false, particles: 0 },
  { pct: [41, 70], section: 'Process Node Rail Section', cameraZ: 9.0, xLogoVisible: false, particles: 0 },
  { pct: [71, 100], section: 'Contact Form & Footer Outro', cameraZ: 7.5, xLogoVisible: true, particles: 5000 },
];

export const RESPONSIVE_Z: ResponsiveZ = {
  desktop: 8.0,
  laptop: 8.5,
  tablet: 9.5,
  mobile: 11.0,
};
