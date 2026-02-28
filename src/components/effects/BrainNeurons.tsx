'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScroll } from 'framer-motion';

interface NeuronProps {
  position: [number, number, number];
  connections: number[];
}

function Neuron({ position, connections }: NeuronProps) {
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

function Synapse({ start, end, scrollProgress }: { start: THREE.Vector3; end: THREE.Vector3; scrollProgress: number }) {
  const lineRef = useRef<THREE.Line>(null);

  const points = useMemo(() => {
    const midPoint = new THREE.Vector3().lerpVectors(start, end, 0.5);
    midPoint.y += (Math.random() - 0.5) * 0.5;
    midPoint.x += (Math.random() - 0.5) * 0.3;

    const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
    return curve.getPoints(20);
  }, [start, end]);

  useFrame(() => {
    if (lineRef.current) {
      const positions = lineRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < points.length; i++) {
        const wave = Math.sin(i * 0.5 + scrollProgress * Math.PI * 2) * 0.1 * scrollProgress;
        positions[i * 3] = points[i].x + wave;
        positions[i * 3 + 1] = points[i].y + wave;
        positions[i * 3 + 2] = points[i].z;
      }
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.length * 3)}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#06b6d4"
        transparent
        opacity={0.4 * (1 - scrollProgress * 0.5)}
      />
    </line>
  );
}

function BrainNetwork({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);

  // Generate random neuron positions
  const neurons = useMemo(() => {
    const neuronPositions: NeuronProps[] = [];
    const neuronCount = 40;

    for (let i = 0; i < neuronCount; i++) {
      const position: [number, number, number] = [
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4 - 2,
      ];

      // Random connections to other neurons
      const connectionCount = Math.floor(Math.random() * 4) + 1;
      const neuronConnections: number[] = [];
      for (let j = 0; j < connectionCount; j++) {
        neuronConnections.push(Math.floor(Math.random() * neuronCount));
      }

      neuronPositions.push({ position, connections: neuronConnections });
    }

    return neuronPositions;
  }, []);

  // Create connection lines
  const synapses = useMemo(() => {
    const synaps: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];

    neurons.forEach((neuron, i) => {
      neuron.connections.forEach((connIndex) => {
        if (connIndex !== i && connIndex < neurons.length) {
          synaps.push({
            start: new THREE.Vector3(...neuron.position),
            end: new THREE.Vector3(...neurons[connIndex].position),
          });
        }
      });
    });

    return synaps;
  }, [neurons]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      groupRef.current.rotation.x = scrollProgress * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {neurons.map((neuron, i) => (
        <Neuron key={i} position={neuron.position} connections={neuron.connections} />
      ))}
      {synapses.map((synapse, i) => (
        <Synapse key={i} start={synapse.start} end={synapse.end} scrollProgress={scrollProgress} />
      ))}
    </group>
  );
}

export default function BrainNeurons() {
  const { scrollYProgress } = useScroll();
  const scrollValue = scrollYProgress.get();

  return (
    <div className="w-full h-[600px] relative">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#7c3aed" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#06b6d4" />
        <BrainNetwork scrollProgress={scrollValue} />
      </Canvas>

      {/* Overlay text */}
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
