'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { motion, useScroll, useTransform } from 'framer-motion';

function CursorTracker() {
  const { viewport } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      velocityRef.current.x = x - lastPosRef.current.x;
      velocityRef.current.y = y - lastPosRef.current.y;
      lastPosRef.current = { x, y };
      mouseRef.current = { x, y };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return null;
}

function WarpSpeedEffect() {
  const { scrollYProgress } = useScroll();
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(8000 * 3);
    const colors = new Float32Array(8000 * 3);
    for (let i = 0; i < 8000; i++) {
      const i3 = i * 3;
      const radius = 5 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi) - 20;

      const colorChoice = Math.random();
      if (colorChoice < 0.2) {
        colors[i3] = 1; colors[i3 + 1] = 0; colors[i3 + 2] = 1;
      } else if (colorChoice < 0.4) {
        colors[i3] = 0; colors[i3 + 1] = 1; colors[i3 + 2] = 1;
      } else if (colorChoice < 0.6) {
        colors[i3] = 0.22; colors[i3 + 1] = 1; colors[i3 + 2] = 0.08;
      } else if (colorChoice < 0.8) {
        colors[i3] = 1; colors[i3 + 1] = 1; colors[i3 + 2] = 0;
      } else {
        colors[i3] = 1; colors[i3 + 1] = 0.4; colors[i3 + 2] = 0;
      }
    }
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      const scroll = scrollYProgress.get();
      const time = state.clock.elapsedTime;

      pointsRef.current.rotation.z = time * 0.02;
      pointsRef.current.rotation.x = scroll * Math.PI * 4;

      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 8000; i++) {
        const i3 = i * 3;
        positions[i3 + 2] += 0.5 + scroll * 2;
        if (positions[i3 + 2] > 30) {
          positions[i3 + 2] = -30;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={8000} array={particles.positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={8000} array={particles.colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} vertexColors transparent opacity={0.9} sizeAttenuation />
    </points>
  );
}

function NebulaCloud({ color, position, scale, speed }: {
  color: string;
  position: [number, number, number];
  scale: number;
  speed: number;
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
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.15;
      meshRef.current.position.x = position[0] + mousePos.x * 3;
      meshRef.current.position.y = position[1] + mousePos.y * 3;
    }
  });

  return (
    <Float speed={speed * 0.5} rotationIntensity={0.5} floatIntensity={2}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          distort={0.8}
          speed={speed * 2}
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}

function GiantPortal({ color, position }: { color: string; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
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
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.position.x = position[0] + mousePos.x * 2;
      meshRef.current.position.y = position[1] + mousePos.y * 2;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -state.clock.elapsedTime * 0.8;
    }
  });

  return (
    <group position={position}>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <mesh ref={meshRef} scale={2.5}>
          <torusGeometry args={[1.2, 0.4, 32, 100]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1}
            metalness={0.9}
            roughness={0.1}
            wireframe
          />
        </mesh>
      </Float>
      <mesh ref={ringRef} scale={2.2} position={[0, 0, 0]}>
        <torusGeometry args={[1.5, 0.1, 16, 100]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={color}
          emissiveIntensity={2}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

function MorphingCrystal({ color, position }: { color: string; position: [number, number, number] }) {
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
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.7;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.3;
      meshRef.current.position.x = position[0] + mousePos.x * 3;
      meshRef.current.position.y = position[1] + mousePos.y * 3;
      const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.3;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={3}>
      <mesh ref={meshRef} position={position}>
        <octahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>
    </Float>
  );
}

function CosmicDust() {
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
    const positions = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02 + mousePos.x * 0.3;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01 + mousePos.y * 0.3;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={3000} array={particles} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function EnergyRings() {
  const groupRef = useRef<THREE.Group>(null);
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
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      groupRef.current.rotation.x = mousePos.y * 0.5;
      groupRef.current.rotation.z = mousePos.x * 0.5;
    }
  });

  const colors = ['#ff00ff', '#00ffff', '#39ff14', '#ffff00', '#ff6600'];

  return (
    <group ref={groupRef} position={[8, 0, -15]}>
      {colors.map((color, i) => (
        <mesh key={i} rotation={[i * 0.3, 0, i * 0.5]} scale={1.5 + i * 0.3}>
          <torusGeometry args={[1 + i * 0.3, 0.02, 16, 100]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function SpiralGalaxy() {
  const pointsRef = useRef<THREE.Points>(null);
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
    const colors = new Float32Array(5000 * 3);

    for (let i = 0; i < 5000; i++) {
      const angle = i * 0.1;
      const radius = 0.5 + i * 0.01;
      const spread = (Math.random() - 0.5) * 0.5;

      positions[i * 3] = Math.cos(angle) * radius + spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 2;
      positions[i * 3 + 2] = Math.sin(angle) * radius + spread;

      const hue = (i / 5000 + Math.random() * 0.1) % 1;
      const color = new THREE.Color().setHSL(hue, 1, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.z = state.clock.elapsedTime * 0.1;
      pointsRef.current.rotation.x = mousePos.y * 0.5;
    }
  });

  return (
    <points ref={pointsRef} position={[-10, 5, -20]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={5000} array={particles.positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={5000} array={particles.colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.1} vertexColors transparent opacity={0.9} sizeAttenuation />
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
      <ambientLight intensity={0.15} />
      <pointLight position={[15, 15, 15]} intensity={3} color="#ff00ff" />
      <pointLight position={[-15, -15, -15]} intensity={3} color="#00ffff" />
      <pointLight position={[0, 0, 10]} intensity={2} color="#39ff14" />
      <pointLight position={[10, -10, 5]} intensity={2} color="#ffff00" />
      <pointLight position={[-10, 10, 5]} intensity={2} color="#ff6600" />
      <pointLight position={[0, -15, -10]} intensity={2} color="#bf00ff" />

      <Stars radius={100} depth={50} count={10000} factor={4} saturation={0} fade speed={2} />

      <NebulaCloud color={neonColors[0]} position={[-8, 4, -8]} scale={4} speed={0.8} />
      <NebulaCloud color={neonColors[1]} position={[8, -3, -6]} scale={3.5} speed={0.6} />
      <NebulaCloud color={neonColors[2]} position={[0, 5, -10]} scale={4.5} speed={1} />
      <NebulaCloud color={neonColors[3]} position={[-5, -4, -7]} scale={3} speed={0.5} />
      <NebulaCloud color={neonColors[4]} position={[6, 3, -9]} scale={3.8} speed={0.7} />
      <NebulaCloud color={neonColors[5]} position={[0, -5, -8]} scale={3.2} speed={0.9} />

      <GiantPortal color="#ff00ff" position={[-10, 0, -15]} />
      <GiantPortal color="#00ffff" position={[10, 0, -15]} />

      <MorphingCrystal color="#39ff14" position={[-7, 6, -12]} />
      <MorphingCrystal color="#ffff00" position={[7, -6, -12]} />
      <MorphingCrystal color="#ff6600" position={[0, -8, -14]} />

      <CosmicDust />
      <EnergyRings />
      <SpiralGalaxy />
      <WarpSpeedEffect />
      <CursorTracker />
    </>
  );
}

export default function PsychedelicBackground() {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.8]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 180]);

  return (
    <motion.div style={{ scale, rotate }} className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: 'none' }}
      >
        <Scene />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950/50 via-dark-950/30 to-dark-950/60 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(15, 23, 42, 0.6) 50%, rgba(15, 23, 42, 0.9) 100%)'
      }} />
    </motion.div>
  );
}
