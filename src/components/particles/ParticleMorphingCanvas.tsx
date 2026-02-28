'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface ShapePoint {
  x: number;
  y: number;
  z: number;
}

// Generate points for different shapes
function generateSpherePoints(count: number, radius: number): ShapePoint[] {
  const points: ShapePoint[] = [];
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    points.push({
      x: radius * Math.cos(theta) * Math.sin(phi),
      y: radius * Math.sin(theta) * Math.sin(phi),
      z: radius * Math.cos(phi),
    });
  }
  return points;
}

function generateTorusPoints(count: number, R: number, r: number): ShapePoint[] {
  const points: ShapePoint[] = [];
  for (let i = 0; i < count; i++) {
    const u = (i / count) * Math.PI * 2;
    points.push({
      x: (R + r * Math.cos(u)) * Math.cos(u * 3),
      y: (R + r * Math.cos(u)) * Math.sin(u * 3),
      z: r * Math.sin(u * 3),
    });
  }
  return points;
}

function generateBrainPoints(count: number): ShapePoint[] {
  const points: ShapePoint[] = [];
  // Create brain-like folded surface
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 4;
    const x = Math.sin(t) * (1 + 0.3 * Math.sin(t * 3));
    const y = Math.cos(t * 2) * 0.8;
    const z = Math.sin(t * 3) * 0.5;
    points.push({ x: x * 1.5, y: y * 1.5, z: z * 1.5 });
  }
  return points;
}

function generateUnicornPoints(count: number): ShapePoint[] {
  const points: ShapePoint[] = [];
  // Simplified unicorn silhouette
  for (let i = 0; i < count; i++) {
    const t = i / count;
    let x, y, z;
    if (t < 0.3) {
      // Body
      x = Math.sin(t * Math.PI * 3) * 0.5;
      y = t * 2 - 0.5;
      z = Math.cos(t * Math.PI * 3) * 0.3;
    } else if (t < 0.5) {
      // Neck
      const nt = (t - 0.3) / 0.2;
      x = Math.sin(nt * Math.PI * 0.5) * 0.3;
      y = nt * 1.5;
      z = 0;
    } else if (t < 0.6) {
      // Head
      const ht = (t - 0.5) / 0.1;
      x = 0.3 + ht * 0.2;
      y = 2 - ht * 0.3;
      z = Math.sin(ht * Math.PI) * 0.2;
    } else {
      // Horn
      const ht = (t - 0.6) / 0.4;
      x = 0.5 + ht * 0.1;
      y = 1.7 + ht * 1.5;
      z = 0;
    }
    points.push({ x: x * 1.2, y: y * 0.8 - 0.8, z: z * 1.2 });
  }
  return points;
}

function generateStarPoints(count: number): ShapePoint[] {
  const points: ShapePoint[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 1 + 0.5 * Math.sin(angle * 5);
    points.push({
      x: Math.cos(angle) * radius * 1.5,
      y: Math.sin(angle) * radius * 1.5,
      z: (Math.random() - 0.5) * 0.5,
    });
  }
  return points;
}

function generateLightbulbPoints(count: number): ShapePoint[] {
  const points: ShapePoint[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / count;
    let x, y, z;
    if (t < 0.7) {
      // Bulb
      const angle = (t / 0.7) * Math.PI * 2;
      const r = 1 * Math.sin((t / 0.7) * Math.PI);
      x = Math.cos(angle) * r;
      y = Math.sin(angle) * r + 0.5;
      z = (Math.random() - 0.5) * 0.3;
    } else {
      // Base
      const bt = (t - 0.7) / 0.3;
      x = Math.cos(bt * Math.PI * 8) * 0.3;
      y = -0.5 - bt * 0.5;
      z = Math.sin(bt * Math.PI * 8) * 0.3;
    }
    points.push({ x: x * 1.2, y: y * 1.2, z: z * 1.2 });
  }
  return points;
}

const SHAPES = {
  sphere: generateSpherePoints(8000, 2),
  torus: generateTorusPoints(8000, 1.5, 0.5),
  brain: generateBrainPoints(8000),
  unicorn: generateUnicornPoints(8000),
  star: generateStarPoints(8000),
  lightbulb: generateLightbulbPoints(8000),
};

type ShapeType = keyof typeof SHAPES;

interface ParticleMorphProps {
  activeShape: ShapeType;
  mousePosition: { x: number; y: number };
}

function ParticleCloud({ activeShape, mousePosition }: ParticleMorphProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const [hoveredShape, setHoveredShape] = useState<ShapeType | null>(null);

  const targetShape = SHAPES[hoveredShape || activeShape];
  const particles = useMemo(() => {
    return targetShape.map((p, i) => new THREE.Vector3(p.x, p.y, p.z));
  }, [targetShape]);

  const [currentPositions, setCurrentPositions] = useState(() =>
    particles.map(p => p.clone())
  );

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const time = state.clock.elapsedTime;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

    // Morph towards target shape
    for (let i = 0; i < particles.length; i++) {
      const target = particles[i];
      const current = currentPositions[i];

      // Lerp towards target
      current.lerp(target, delta * 2);

      // Add some noise/wave motion
      const noiseX = Math.sin(time * 0.5 + i * 0.01) * 0.05;
      const noiseY = Math.cos(time * 0.3 + i * 0.01) * 0.05;
      const noiseZ = Math.sin(time * 0.4 + i * 0.02) * 0.05;

      // Mouse interaction - particles react to cursor
      const mouseInfluence = 0.3;
      const mx = (mousePosition.x * 3 - positions[i * 3]) * mouseInfluence * 0.1;
      const my = (mousePosition.y * 3 - positions[i * 3 + 1]) * mouseInfluence * 0.1;

      positions[i * 3] = current.x + noiseX + mx;
      positions[i * 3 + 1] = current.y + noiseY + my;
      positions[i * 3 + 2] = current.z + noiseZ;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Rotate entire system slowly
    pointsRef.current.rotation.y = time * 0.1;
    pointsRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
  });

  const colors = useMemo(() => {
    const colorArray = new Float32Array(particles.length * 3);
    const baseColor = new THREE.Color();

    // Different colors for different shapes
    const shapeColors: Record<ShapeType, string> = {
      sphere: '#7c3aed', // Purple
      torus: '#06b6d4', // Cyan
      brain: '#ec4899', // Pink
      unicorn: '#f59e0b', // Gold
      star: '#ffffff', // White
      lightbulb: '#fbbf24', // Yellow
    };

    baseColor.set(shapeColors[activeShape]);

    for (let i = 0; i < particles.length; i++) {
      const hueShift = (Math.random() - 0.5) * 0.1;
      const color = baseColor.clone().offsetHSL(hueShift, 0, (Math.random() - 0.5) * 0.2);
      colorArray[i * 3] = color.r;
      colorArray[i * 3 + 1] = color.g;
      colorArray[i * 3 + 2] = color.b;
    }
    return colorArray;
  }, [particles.length, activeShape]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length}
          array={new Float32Array(particles.length * 3)}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.length}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial
        transparent
        vertexColors
        size={0.015}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Scene({ activeShape, mousePosition }: { activeShape: ShapeType; mousePosition: { x: number; y: number } }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <ParticleCloud activeShape={activeShape} mousePosition={mousePosition} />
    </>
  );
}

interface ParticleMorphingCanvasProps {
  onShapeChange?: (shape: ShapeType) => void;
}

export default function ParticleMorphingCanvas({ onShapeChange }: ParticleMorphingCanvasProps) {
  const [activeShape, setActiveShape] = useState<ShapeType>('sphere');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const shapes: ShapeType[] = ['sphere', 'torus', 'brain', 'unicorn', 'star', 'lightbulb'];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-cycle shapes
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveShape((prev) => {
        const currentIndex = shapes.indexOf(prev);
        const nextIndex = (currentIndex + 1) % shapes.length;
        return shapes[nextIndex];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <Scene activeShape={activeShape} mousePosition={mousePosition} />
      </Canvas>

      {/* Shape selector buttons */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {shapes.map((shape) => (
          <motion.button
            key={shape}
            onClick={() => {
              setActiveShape(shape);
              onShapeChange?.(shape);
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeShape === shape
                ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20 backdrop-blur-sm'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {shape.charAt(0).toUpperCase() + shape.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Current shape indicator */}
      <motion.div
        key={activeShape}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 left-1/2 -translate-x-1/2 text-white/80 text-lg font-medium"
      >
        {activeShape === 'sphere' && 'Global Network'}
        {activeShape === 'torus' && 'Infinite Loop'}
        {activeShape === 'brain' && 'Innovation'}
        {activeShape === 'unicorn' && 'Unicorn Potential'}
        {activeShape === 'star' && 'Bright Ideas'}
        {activeShape === 'lightbulb' && 'Eureka Moment'}
      </motion.div>
    </div>
  );
}
