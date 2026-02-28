'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface HoneycombCell {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const cells: HoneycombCell[] = [
  { id: 1, title: 'Founders', description: 'Pitch your vision to top investors', icon: '🚀', color: 'from-purple-500 to-pink-500' },
  { id: 2, title: 'VCs', description: 'Discover promising startups', icon: '💎', color: 'from-cyan-500 to-blue-500' },
  { id: 3, title: 'Angels', description: 'Connect with innovation early', icon: '👼', color: 'from-yellow-500 to-orange-500' },
  { id: 4, title: 'LPs', description: 'Explore emerging opportunities', icon: '🌟', color: 'from-green-500 to-teal-500' },
  { id: 5, title: 'Demo Days', description: 'Live pitch events', icon: '🎬', color: 'from-red-500 to-pink-500' },
  { id: 6, title: 'Network', description: 'Global community', icon: '🌐', color: 'from-indigo-500 to-purple-500' },
  { id: 7, title: 'Mentors', description: 'Expert guidance', icon: '🧙', color: 'from-amber-500 to-yellow-500' },
  { id: 8, title: 'Funding', description: 'Capital for growth', icon: '💰', color: 'from-emerald-500 to-green-500' },
  { id: 9, title: 'Growth', description: 'Scale your startup', icon: '📈', color: 'from-blue-500 to-cyan-500' },
];

interface HoneycombGridProps {
  className?: string;
}

export default function HoneycombGrid({ className = '' }: HoneycombGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [expandedCell, setExpandedCell] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Hexagon calculations
  const hexWidth = 180;
  const hexHeight = 156;
  const gap = 8;

  const getHexPosition = (row: number, col: number) => {
    const x = col * (hexWidth * 0.75 + gap);
    const y = row * (hexHeight * 0.5 + gap);
    return { x, y: row % 2 === 0 ? y : y + hexHeight * 0.25 + gap * 0.5 };
  };

  return (
    <div ref={containerRef} className={`relative py-20 ${className}`}>
      <motion.div style={{ y, opacity }} className="relative">
        {/* Honeycomb grid */}
        <div className="flex flex-wrap justify-center items-center gap-4 max-w-6xl mx-auto px-4">
          {cells.map((cell, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            const offset = row % 2 === 1 ? hexWidth * 0.375 : 0;

            return (
              <motion.div
                key={cell.id}
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                style={{
                  transform: `translateX(${offset}px)`,
                }}
                onHoverStart={() => setHoveredCell(cell.id)}
                onHoverEnd={() => setHoveredCell(null)}
                onClick={() => setExpandedCell(expandedCell === cell.id ? null : cell.id)}
              >
                <motion.div
                  className={`relative w-[${hexWidth}px] h-[${hexHeight}px] cursor-pointer`}
                  whileHover={{ scale: 1.05 }}
                  animate={{
                    scale: expandedCell === cell.id ? 1.1 : 1,
                  }}
                >
                  {/* Hexagon shape */}
                  <svg
                    viewBox="0 0 180 156"
                    className="w-full h-full"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id={`gradient-${cell.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={cell.color.split(' ')[0].replace('from-', '').replace('-500', '')} />
                        <stop offset="100%" stopColor={cell.color.split(' ')[1].replace('to-', '').replace('-500', '')} />
                      </linearGradient>
                    </defs>
                    <path
                      d="M90 0 L180 26 L180 78 L90 104 L0 78 L0 26 Z"
                      fill="url(#gradient-honeycomb)"
                      className={`bg-gradient-to-br ${cell.color}`}
                      fillOpacity={hoveredCell === cell.id ? 0.9 : 0.7}
                    />
                    {/* Inner hexagon for depth */}
                    <path
                      d="M90 10 L170 33 L170 78 L90 98 L10 78 L10 33 Z"
                      fill="none"
                      stroke="white"
                      strokeWidth="1"
                      strokeOpacity="0.2"
                    />
                  </svg>

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-3xl mb-2">{cell.icon}</span>
                    <h3 className="text-white font-bold text-sm md:text-base">{cell.title}</h3>
                    <p className="text-white/70 text-xs mt-1 hidden md:block">{cell.description}</p>
                  </div>

                  {/* Glow effect on hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${cell.color} rounded-full blur-xl opacity-0`}
                    animate={{ opacity: hoveredCell === cell.id ? 0.5 : 0 }}
                  />
                </motion.div>

                {/* Expanded content */}
                <AnimatePresence>
                  {expandedCell === cell.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute top-full left-0 right-0 mt-4 p-4 bg-dark-900/90 backdrop-blur-lg rounded-xl z-20"
                    >
                      <p className="text-white/80 text-sm">{cell.description}</p>
                      <button className={`mt-3 px-4 py-2 bg-gradient-to-r ${cell.color} rounded-full text-white text-sm font-medium`}>
                        Learn More
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Section title */}
      <div className="text-center mt-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Everything You <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Need</span>
        </h2>
        <p className="text-white/60 max-w-xl mx-auto">
          Our platform brings together all the tools and connections you need to succeed
        </p>
      </div>
    </div>
  );
}

// Simple fallback for AnimatePresence if not imported
function AnimatePresence({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
