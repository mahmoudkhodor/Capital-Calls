'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function InfinityParticles({ particleCount = 500 }: { particleCount?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const t = (i / particleCount) * Math.PI * 2;
      const x = (2 * Math.cos(t)) / (1 + Math.sin(t) * Math.sin(t));
      const y = (2 * Math.sin(t) * Math.cos(t)) / (1 + Math.sin(t) * Math.sin(t));
      const z = Math.sin(t * 2) * 0.3;

      const spread = 0.1;
      positions[i * 3] = x + (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = y + (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = z + (Math.random() - 0.5) * spread;

      const hue = (i / particleCount) * 0.3 + 0.7;
      const color = new THREE.Color().setHSL(hue, 1, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors };
  }, [particleCount]);

  useFrame((state) => {
    if (pointsRef.current) {
      const time = state.clock.elapsedTime;
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const baseT = (i / particleCount) * Math.PI * 2;
        const t = baseT + time * 0.5;

        const x = (2 * Math.cos(t)) / (1 + Math.sin(t) * Math.sin(t));
        const y = (2 * Math.sin(t) * Math.cos(t)) / (1 + Math.sin(t) * Math.sin(t));
        const z = Math.sin(t * 2) * 0.3;

        const spread = 0.15;
        positions[i * 3] = x + Math.sin(time * 2 + i * 0.1) * spread * 0.3;
        positions[i * 3 + 1] = y + Math.cos(time * 1.5 + i * 0.1) * spread * 0.3;
        positions[i * 3 + 2] = z + Math.sin(time + i * 0.05) * spread * 0.2;
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function InfinityLoop() {
  return (
    <div className="relative w-full h-[400px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#7c3aed" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#06b6d4" />
        <InfinityParticles />
      </Canvas>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Endless <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Possibilities</span>
          </h3>
          <p className="text-white/60 max-w-md">
            Your journey with us never stops — continuous growth, connections, and opportunities
          </p>
        </div>
      </div>
    </div>
  );
}
