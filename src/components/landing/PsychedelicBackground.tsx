'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';
import { motion, useScroll, useTransform } from 'framer-motion';

function CursorTracker() {
  const { viewport } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return null;
}

function LargeOrb({ color, position, scale, speed, distort }: {
  color: string;
  position: [number, number, number];
  scale: number;
  speed: number;
  distort: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.5;
      // Follow cursor
      meshRef.current.position.x = position[0] + mousePos.x * 2;
      meshRef.current.position.y = position[1] + mousePos.y * 2;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={1.5} floatIntensity={3}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 128, 128]} />
        <MeshDistortMaterial
          color={color}
          distort={distort}
          speed={speed * 3}
          roughness={0.1}
          metalness={0.9}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </mesh>
    </Float>
  );
}

function GiantTorus({ color, position }: { color: string; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.position.x = position[0] + mousePos.x * 3;
      meshRef.current.position.y = position[1] + mousePos.y * 3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={2} floatIntensity={2}>
      <mesh ref={meshRef} position={position} scale={2.5}>
        <torusGeometry args={[1, 0.4, 64, 128]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.1}
          wireframe
        />
      </mesh>
    </Float>
  );
}

function GiantIcosahedron({ color, position }: { color: string; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.4;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.3;
      meshRef.current.position.x = position[0] + mousePos.x * 2;
      meshRef.current.position.y = position[1] + mousePos.y * 2;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={1.5} floatIntensity={2.5}>
      <mesh ref={meshRef} position={position} scale={2}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

function MassiveParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const particles = useMemo(() => {
    const positions = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03 + mousePos.x * 0.5;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.02 + mousePos.y * 0.5;
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
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

function Scene() {
  const neonColors = [
    '#ff00ff',
    '#bf00ff',
    '#00ffff',
    '#39ff14',
    '#ffff00',
    '#ff6600',
  ];

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[15, 15, 15]} intensity={2} color="#ff00ff" />
      <pointLight position={[-15, -15, -15]} intensity={2} color="#00ffff" />
      <pointLight position={[0, 0, 10]} intensity={1} color="#39ff14" />
      <pointLight position={[10, -10, 5]} intensity={1} color="#ffff00" />
      <pointLight position={[-10, 10, 5]} intensity={1} color="#ff6600" />

      <LargeOrb
        color={neonColors[0]}
        position={[-6, 3, -5]}
        scale={3}
        speed={1}
        distort={0.5}
      />
      <LargeOrb
        color={neonColors[1]}
        position={[6, -2, -4]}
        scale={2.5}
        speed={0.8}
        distort={0.6}
      />
      <LargeOrb
        color={neonColors[2]}
        position={[0, 4, -7]}
        scale={3.5}
        speed={1.2}
        distort={0.4}
      />
      <LargeOrb
        color={neonColors[3]}
        position={[-4, -3, -6]}
        scale={2.2}
        speed={0.6}
        distort={0.7}
      />
      <LargeOrb
        color={neonColors[4]}
        position={[5, 2, -8]}
        scale={2.8}
        speed={0.9}
        distort={0.5}
      />
      <LargeOrb
        color={neonColors[5]}
        position={[0, -4, -5]}
        scale={2.4}
        speed={1.1}
        distort={0.6}
      />

      <GiantTorus color="#ff00ff" position={[-8, 0, -10]} />
      <GiantTorus color="#00ffff" position={[8, 0, -10]} />
      <GiantIcosahedron color="#39ff14" position={[0, -6, -12]} />
      <GiantIcosahedron color="#ffff00" position={[-7, 5, -15]} />
      <GiantIcosahedron color="#ff6600" position={[7, -5, -15]} />

      <MassiveParticles />
      <CursorTracker />
    </>
  );
}

export default function PsychedelicBackground() {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);

  return (
    <motion.div style={{ scale }} className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950/20 via-transparent to-dark-950/40 pointer-events-none" />
    </motion.div>
  );
}
