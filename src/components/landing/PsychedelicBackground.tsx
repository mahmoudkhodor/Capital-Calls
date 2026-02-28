'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedOrb({ color, position, scale, speed, distort }: {
  color: string;
  position: [number, number, number];
  scale: number;
  speed: number;
  distort: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.5;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          distort={distort}
          speed={speed * 2}
          roughness={0.2}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </mesh>
    </Float>
  );
}

function Particles() {
  const particlesRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function Scene() {
  const neonColors = [
    '#ff00ff', // neon pink
    '#bf00ff', // neon purple
    '#00ffff', // neon cyan
    '#39ff14', // neon green
    '#ffff00', // neon yellow
    '#ff6600', // neon orange
  ];

  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.3} />

      {/* Point lights for neon glow */}
      <pointLight position={[10, 10, 10]} intensity={1} color="#ff00ff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#00ffff" />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#39ff14" />

      {/* Animated orbs */}
      <AnimatedOrb
        color={neonColors[0]}
        position={[-4, 2, -3]}
        scale={1.8}
        speed={1}
        distort={0.4}
      />
      <AnimatedOrb
        color={neonColors[1]}
        position={[4, -1, -2]}
        scale={1.5}
        speed={0.8}
        distort={0.5}
      />
      <AnimatedOrb
        color={neonColors[2]}
        position={[0, 3, -5]}
        scale={2}
        speed={1.2}
        distort={0.3}
      />
      <AnimatedOrb
        color={neonColors[3]}
        position={[-3, -2, -4]}
        scale={1.3}
        speed={0.6}
        distort={0.6}
      />
      <AnimatedOrb
        color={neonColors[4]}
        position={[3, 1, -6]}
        scale={1.6}
        speed={0.9}
        distort={0.4}
      />
      <AnimatedOrb
        color={neonColors[5]}
        position={[0, -3, -3]}
        scale={1.4}
        speed={1.1}
        distort={0.5}
      />

      {/* Particle field */}
      <Particles />
    </>
  );
}

export default function PsychedelicBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950/30 via-transparent to-dark-950/50 pointer-events-none" />
    </div>
  );
}
