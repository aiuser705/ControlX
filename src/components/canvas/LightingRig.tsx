'use client';

export function LightingRig() {
  return (
    <group name="lighting_system">
      {/* Ambient Light */}
      <ambientLight color="#FFFFFF" intensity={0.75} />

      {/* Directional Key Light */}
      <directionalLight
        color="#FFFFFF"
        intensity={1.2}
        position={[5.0, 10.0, 7.0]}
        castShadow
        shadow-bias={-0.0001}
      />

      {/* Directional Fill Light (Cool Mint) */}
      <directionalLight
        color="#D1E7DD"
        intensity={0.5}
        position={[-5.0, -2.0, 4.0]}
        castShadow={false}
      />

      {/* Point Emerald Accent Light */}
      <pointLight
        color="#0F8259"
        intensity={0.8}
        position={[0.0, -1.0, 2.0]}
        distance={10.0}
        decay={2.0}
      />
    </group>
  );
}
