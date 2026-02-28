'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScroll } from 'framer-motion';

function Neuron({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.2);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial
        color="#7c3aed"
        emissive="#7c3aed"
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

function BrainNetwork() {
  const groupRef = useRef<THREE.Group>(null);

  const neurons = useMemo(() => {
    const neuronPositions: [number, number, number][] = [];
    const neuronCount = 40;

    for (let i = 0; i < neuronCount; i++) {
      neuronPositions.push([
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4 - 2,
      ]);
    }
    return neuronPositions;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {neurons.map((position, i) => (
        <Neuron key={i} position={position} />
      ))}
    </group>
  );
}

export default function BrainNeurons() {
  return (
    <div className="w-full h-[600px] relative">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#7c3aed" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#06b6d4" />
        <BrainNetwork />
      </Canvas>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Neural <span className="text-purple-400">Connections</span>
          </h3>
          <p className="text-white/60 max-w-md">
            Our platform connects founders and investors through intelligent matching
          </p>
        </div>
      </div>
    </div>
  );
}
