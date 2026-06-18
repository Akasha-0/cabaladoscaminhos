'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { AtmosphereIntensity } from '@/stores/cockpit-store';

// Cosmic palette — Doc 26 §3
const COLORS = {
  akashicViolet: '#7C5CFF',
  auroraCyan: '#2DD4BF',
  deepSpace: '#06070F',
};

// Deterministic PRNG so SSR/CSR render identical particle positions.
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function Torus() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += 0.1 * delta;
  });
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[1, 0.3, 100, 16]} />
      <meshBasicMaterial color={COLORS.akashicViolet} wireframe />
    </mesh>
  );
}

function Particles({ count = 80 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const rand = mulberry32(0xa1b2c3d4);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.5 + rand() * 1;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += 0.05 * delta;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={COLORS.auroraCyan} size={0.05} sizeAttenuation />
    </points>
  );
}

export function MandalaAtmosphere({ intensity = 'medium' }: { intensity?: AtmosphereIntensity }) {
  const particleCount = intensity === 'low' ? 50 : intensity === 'high' ? 100 : 80;
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      className="absolute inset-0 -z-10 pointer-events-none"
      data-testid="mandala-atmosphere"
      data-intensity={intensity}
      data-reduced-motion={reduced ? 'true' : 'false'}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        dpr={[1, 2]}
        frameloop={reduced ? 'demand' : 'always'}
        data-frameloop={reduced ? 'demand' : 'always'}
      >
        <ambientLight intensity={0.5} />
        <Torus />
        <Particles count={particleCount} />
      </Canvas>
    </div>
  );
}
