'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useScroll } from 'framer-motion';

function GiantTorusKnot({ color, scrollY }: { color: string; scrollY: number }) {
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
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.4 + scrollY * Math.PI;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 + scrollY * Math.PI * 2;
      meshRef.current.position.x = mousePos.x * 0.5 + Math.sin(scrollY * 10) * 2;
      meshRef.current.position.y = mousePos.y * 0.5 + Math.cos(scrollY * 10) * 2;
      const scale = 1.2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={2} floatIntensity={3}>
      <mesh ref={meshRef} scale={1.2}>
        <torusKnotGeometry args={[1, 0.35, 256, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>
    </Float>
  );
}

function GiantIcosahedron({ color }: { color: string }) {
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
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.4;
      meshRef.current.position.x = mousePos.x * 0.3;
      meshRef.current.position.y = mousePos.y * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh ref={meshRef} scale={1.5}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.1}
          wireframe
        />
      </mesh>
    </Float>
  );
}

function GiantOctahedron({ color }: { color: string }) {
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
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.6;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.position.x = mousePos.x * 0.4;
      meshRef.current.position.y = mousePos.y * 0.4;
    }
  });

  return (
    <Float speed={2.2} rotationIntensity={1.8} floatIntensity={2.5}>
      <mesh ref={meshRef} scale={1.3}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>
    </Float>
  );
}

function GiantTorus({ color }: { color: string }) {
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
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.position.x = mousePos.x * 0.6;
      meshRef.current.position.y = mousePos.y * 0.6;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={1.2} floatIntensity={2}>
      <mesh ref={meshRef} scale={1.4}>
        <torusGeometry args={[1, 0.3, 64, 128]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </Float>
  );
}

function MorphingOrb() {
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
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.position.x = mousePos.x * 1;
      meshRef.current.position.y = mousePos.y * 1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} scale={0.8}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color="#ff00ff"
          distort={0.6}
          speed={3}
          roughness={0.2}
          metalness={0.8}
          emissive="#ff00ff"
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  const { scrollYProgress } = useScroll();
  const scrollY = scrollYProgress.get();

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ff00ff" />
      <pointLight position={[-10, -10, -10]} intensity={1.5} color="#00ffff" />
      <pointLight position={[0, 0, 8]} intensity={1} color="#39ff14" />

      <GiantTorusKnot color="#ff00ff" scrollY={scrollY} />
      <GiantIcosahedron color="#00ffff" />
      <GiantOctahedron color="#39ff14" />
      <GiantTorus color="#ffff00" />
      <MorphingOrb />
    </>
  );
}

interface FloatingShapesProps {
  className?: string;
}

export default function FloatingShapes({ className = '' }: FloatingShapesProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} style={{ zIndex: 5 }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ pointerEvents: 'none' }}>
        <Scene />
      </Canvas>
    </div>
  );
}
