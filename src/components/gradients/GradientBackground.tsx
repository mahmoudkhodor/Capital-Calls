'use client';

import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface MeshGradientProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent';
}

const gradientConfigs = {
  primary: {
    colors: ['#7c3aed', '#06b6d4', '#ec4899', '#f59e0b'],
    direction: '135deg',
  },
  secondary: {
    colors: ['#0f172a', '#1e1b4b', '#312e81', '#4c1d95'],
    direction: '180deg',
  },
  accent: {
    colors: ['#06b6d4', '#10b981', '#3b82f6', '#8b5cf6'],
    direction: '45deg',
  },
};

export default function MeshGradient({ className = '', variant = 'primary' }: MeshGradientProps) {
  const config = gradientConfigs[variant];

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(${config.direction}, ${config.colors.join(', ')})`,
      }}
    >
      {/* Animated blobs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-30"
          style={{
            background: config.colors[i % config.colors.length],
            width: `${200 + i * 100}px`,
            height: `${200 + i * 100}px`,
            left: `${10 + i * 15}%`,
            top: `${10 + i * 20}%`,
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

// Animated gradient text
interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string[];
}

export function GradientText({ children, className = '', gradient }: GradientTextProps) {
  const colors = gradient || ['#c084fc', '#22d3ee', '#f472b6'];

  return (
    <span
      className={`bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})`,
        backgroundSize: '200% auto',
      }}
    >
      {children}
    </span>
  );
}

// Animated border
interface AnimatedBorderProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedBorder({ children, className = '' }: AnimatedBorderProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500 animate-gradient-xy" />
      <div className="absolute inset-[2px] rounded-xl bg-dark-900" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// Spotlight effect
interface SpotlightProps {
  className?: string;
}

export function Spotlight({ className = '' }: SpotlightProps) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.3]);

  return (
    <motion.div
      className={`absolute w-[600px] h-[600px] rounded-full pointer-events-none ${className}`}
      style={{
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, transparent 70%)',
        y,
        opacity,
      }}
    />
  );
}

// Grain overlay
export function GrainOverlay({ className = '' }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        opacity: 0.03,
      }}
    />
  );
}
