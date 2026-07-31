export const EMERALD_GLASS = {
  color: '#0F8259',
  transmission: 0.95,
  opacity: 1.0,
  transparent: true,
  roughness: 0.05,
  metalness: 0.0,
  ior: 1.52,
  thickness: 0.8,
  attenuationColor: '#0F8259',
  attenuationDistance: 0.5,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  reflectivity: 0.9,
} as const;

export const NODE_GLASS = {
  color: '#0F8259',
  transmission: 0.95,
  opacity: 1.0,
  transparent: true,
  roughness: 0.04,
  metalness: 0.0,
  ior: 1.52,
} as const;

export const TUBE_GLASS = {
  color: '#0F8259',
  transmission: 0.92,
  opacity: 1.0,
  transparent: true,
  roughness: 0.08,
  metalness: 0.0,
  ior: 1.48,
  thickness: 0.3,
} as const;
