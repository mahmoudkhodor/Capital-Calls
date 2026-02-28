'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function InfinityPath() {
  const pointsRef = useRef<THREE.Points>(null);
  const lineRef = useRef<THREE.Line>(null);
  const [particleCount] = useState(500);

  // Generate infinity path points using parametric equations
  const pathPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 200;

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      // Lemniscate of Bernoulli (infinity symbol)
      const scale = 2;
      const x = (scale * Math.cos(t)) / (1 + Math.sin(t) * Math.sin(t));
      const y = (scale * Math.sin(t) * Math.cos(t)) / (1 + Math.sin(t) * Math.sin(t));
      const z = Math.sin(t * 2) * 0.3; // Add some 3D depth

      points.push(new THREE.Vector3(x, y, z));
    }

    return points;
  }, []);

  // Particles along the path
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const t = (i / particleCount) * Math.PI * 2;
      const x = (2 * Math.cos(t)) / (1 + Math.sin(t) * Math.sin(t));
      const y = (2 * Math.sin(t) * Math.cos(t)) / (1 + Math.sin(t) * Math.sin(t));
      const z = Math.sin(t * 2) * 0.3;

      // Add some randomness
      const spread = 0.1;
      positions[i * 3] = x + (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = y + (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = z + (Math.random() - 0.5) * spread;

      // Color gradient along path
      const hue = (i / particleCount) * 0.3 + 0.7; // Purple to cyan range
      const color = new THREE.Color().setHSL(hue, 1, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors };
  }, [particleCount]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Animate particles along path
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const baseT = (i / particleCount) * Math.PI * 2;
        const t = baseT + time * 0.5; // Move along path

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

    // Pulse the line
    if (lineRef.current) {
      lineRef.current.rotation.z = time * 0.1;
    }
  });

  // Create line geometry
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
    return geometry;
  }, [pathPoints]);

  return (
    <group>
      {/* Base infinity path line */}
      <line ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial color="#7c3aed" transparent opacity={0.3} />
      </line>

      {/* Animated particles */}
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
    </group>
  );
}

export default function InfinityLoop() {
  return (
    <div className="relative w-full h-[400px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#7c3aed" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#06b6d4" />
        <InfinityPath />
      </Canvas>

      {/* Overlay text */}
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
