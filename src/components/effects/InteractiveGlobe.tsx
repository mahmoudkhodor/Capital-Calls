'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface GlobeMarker {
  position: [number, number, number];
  label: string;
  color: string;
}

function Globe({ markers }: { markers: GlobeMarker[] }) {
  const globeRef = useRef<THREE.Mesh>(null);
  const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      globeRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1 + mousePos.y * 0.1;
    }
  });

  // Create globe surface with custom shader
  const globeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1a1a2e',
      emissive: '#0f0f1a',
      emissiveIntensity: 0.2,
      metalness: 0.8,
      roughness: 0.4,
      wireframe: false,
    });
  }, []);

  // Create connection lines between markers
  const connections = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    for (let i = 0; i < markers.length; i++) {
      for (let j = i + 1; j < markers.length; j++) {
        lines.push([
          new THREE.Vector3(...markers[i].position),
          new THREE.Vector3(...markers[j].position),
        ]);
      }
    }
    return lines;
  }, [markers]);

  return (
    <group>
      {/* Main globe */}
      <mesh ref={globeRef} material={globeMaterial}>
        <sphereGeometry args={[2, 64, 64]} />

        {/* Wireframe overlay */}
        <mesh>
          <sphereGeometry args={[2.01, 32, 32]} />
          <meshBasicMaterial
            color="#7c3aed"
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>
      </mesh>

      {/* Latitude/longitude lines */}
      {[...Array(5)].map((_, i) => (
        <mesh key={`lat-${i}`} rotation={[0, 0, (i / 5) * Math.PI - Math.PI / 2]}>
          <torusGeometry args={[2 * Math.cos((i / 5 - 0.5) * Math.PI), 0.01, 8, 64]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.2} />
        </mesh>
      ))}
      {[...Array(8)].map((_, i) => (
        <mesh key={`lon-${i}`} rotation={[0, (i / 8) * Math.PI * 2, Math.PI / 2]}>
          <torusGeometry args={[2, 0.01, 8, 64]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.2} />
        </mesh>
      ))}

      {/* Connection lines */}
      {connections.map((line, i) => {
        const midPoint = new THREE.Vector3().lerpVectors(line[0], line[1], 0.5);
        const distance = line[0].distanceTo(line[1]);

        return (
          <mesh
            key={i}
            position={[midPoint.x * 1.01, midPoint.y * 1.01, midPoint.z * 1.01]}
            rotation={[0, Math.atan2(line[1].x - line[0].x, line[1].z - line[0].z), 0]}
          >
            <cylinderGeometry args={[0.01, 0.01, distance, 8]} />
            <meshBasicMaterial color="#7c3aed" transparent opacity={0.4} />
          </mesh>
        );
      })}

      {/* Markers */}
      {markers.map((marker, i) => (
        <group key={i} position={marker.position}>
          {/* Pulsing ring */}
          <mesh>
            <ringGeometry args={[0.15, 0.2, 32]} />
            <meshBasicMaterial
              color={marker.color}
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Center dot */}
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color={marker.color}
              emissive={marker.color}
              emissiveIntensity={1}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Scene() {
  const markers: GlobeMarker[] = useMemo(() => [
    { position: [1.5, 0.5, 0.8], label: 'New York', color: '#7c3aed' },
    { position: [-1.2, 0.8, 1], label: 'London', color: '#06b6d4' },
    { position: [0.3, 1.5, 1.2], label: 'San Francisco', color: '#ec4899' },
    { position: [-0.8, -0.5, 1.7], label: 'Berlin', color: '#f59e0b' },
    { position: [1.7, -0.3, 0.5], label: 'Singapore', color: '#10b981' },
    { position: [-1.5, 1.2, -0.5], label: 'Tokyo', color: '#ef4444' },
    { position: [0.5, -1.3, 1.2], label: 'Sydney', color: '#8b5cf6' },
    { position: [-0.3, 0.3, -1.9], label: 'Dubai', color: '#14b8a6' },
  ], []);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#7c3aed" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#06b6d4" />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#ffffff" />

      <Globe markers={markers} />
    </>
  );
}

export default function InteractiveGlobe() {
  return (
    <div className="relative w-full h-[600px]">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <Scene />
      </Canvas>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-dark-900/80 backdrop-blur-lg rounded-xl p-4">
        <h4 className="text-white font-semibold mb-2">Global Network</h4>
        <div className="space-y-1 text-xs text-white/60">
          <p>8 Cities Connected</p>
          <p>500+ Active Investors</p>
          <p>200+ Startups Funded</p>
        </div>
      </div>
    </div>
  );
}
