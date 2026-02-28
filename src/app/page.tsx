'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import ParticleMorphingCanvas from '@/components/particles/ParticleMorphingCanvas';
import TypingHeadline from '@/components/typography/TypingHeadline';
import SmoothScroll from '@/components/scroll/SmoothScroll';
import BrainNeurons from '@/components/effects/BrainNeurons';
import HoneycombGrid from '@/components/grid/HoneycombGrid';
import InteractiveGlobe from '@/components/effects/InteractiveGlobe';
import InfinityLoop from '@/components/effects/InfinityLoop';
import { GradientText, Spotlight, GrainOverlay } from '@/components/gradients/GradientBackground';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';

function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 16);
      mouseY.set(e.clientY - 16);
      setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [mouseX, mouseY]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] mix-blend-difference"
      style={{
        x: mouseX,
        y: mouseY,
      }}
      animate={{
        scale: isHovering ? 2.5 : 1,
        backgroundColor: isHovering ? '#ff00ff' : '#00ffff',
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
    />
  );
}

function AnimatedBackground() {
  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-0"
      style={{ rotate, opacity: 0.6 }}
    >
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px]" />
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-pink-600/20 rounded-full blur-[150px]" />
    </motion.div>
  );
}

function StatsCounter({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="text-4xl md:text-6xl font-bold">
        <GradientText>{value}</GradientText>
      </div>
      <div className="text-white/60 mt-2">{label}</div>
    </motion.div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role === 'ADMIN') router.push('/admin');
      else if (session?.user?.role === 'STARTUP') router.push('/startup');
      else if (session?.user?.role === 'INVESTOR') router.push('/investor');
    }
  }, [session, status, router]);

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.2]);

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-dark-950 relative overflow-x-hidden">
        <CustomCursor />
        <AnimatedBackground />
        <Spotlight />
        <GrainOverlay />

        {/* Navigation */}
        <motion.nav
          className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-dark-950/80 border-b border-white/10"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container-custom">
            <div className="flex items-center justify-between h-20">
              <Link href="/" className="flex items-center gap-3 group">
                <Logo size="lg" />
              </Link>

              <div className="flex items-center gap-6">
                <Link href="/login" className="text-white/80 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/apply"
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section with Particle Morphing */}
        <section className="relative z-10 min-h-screen flex items-center justify-center pt-20">
          <div className="absolute inset-0 z-0">
            <ParticleMorphingCanvas />
          </div>

          <motion.div
            className="relative z-10 container-custom text-center"
            style={{ opacity: heroOpacity, scale: heroScale }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-white/80">The Future of Startup Fundraising</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight"
            >
              Where
              <br />
              <TypingHeadline
                words={['Founders', 'Investors', 'Visionaries', 'Dreamers']}
                className="inline-flex"
              />
              <br />
              Connect
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-white/70 max-w-2xl mx-auto mb-12"
            >
              Experience the next generation of startup fundraising.
              Connect, pitch, and grow with our award-winning platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link
                href="/apply"
                className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-bold text-lg hover:scale-105 transition-transform"
              >
                Apply as Startup
              </Link>
              <Link
                href="/login"
                className="px-10 py-4 border border-white/20 rounded-full text-white font-medium hover:bg-white/10 transition-colors"
              >
                Investor Login
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <motion.div
                className="w-1 h-2 bg-white/60 rounded-full"
                animate={{ opacity: [1, 0, 1], y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
          </motion.div>
        </section>

        {/* Brain Neurons Section */}
        <section className="relative z-10 py-32">
          <BrainNeurons />
        </section>

        {/* For Founders - Honeycomb */}
        <section className="relative z-10 py-32 bg-dark-900/50">
          <HoneycombGrid />
        </section>

        {/* For Investors - Globe */}
        <section className="relative z-10 py-32">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Global <GradientText>Investment Network</GradientText>
              </h2>
              <p className="text-white/60 max-w-xl mx-auto">
                Connect with investors from major startup hubs around the world
              </p>
            </div>
            <InteractiveGlobe />
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative z-10 py-32 bg-dark-900/50">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              <StatsCounter value="$2B+" label="Capital Deployed" delay={0} />
              <StatsCounter value="500+" label="Startups Funded" delay={0.1} />
              <StatsCounter value="200+" label="Active Investors" delay={0.2} />
              <StatsCounter value="95%" label="Match Rate" delay={0.3} />
            </div>
          </div>
        </section>

        {/* Community - Infinity Loop */}
        <section className="relative z-10 py-32">
          <InfinityLoop />
        </section>

        {/* CTA Section */}
        <section className="relative z-10 py-32">
          <div className="container-custom">
            <motion.div
              className="relative p-12 md:p-20 text-center rounded-3xl overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-cyan-600/20 to-pink-600/20" />

              <div className="absolute inset-0">
                <div className="absolute inset-0 border-2 border-transparent rounded-3xl bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500 opacity-30" style={{ padding: '2px' }}>
                  <div className="w-full h-full bg-dark-950 rounded-[10px]" />
                </div>
              </div>

              <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                  Ready to <GradientText>Get Started?</GradientText>
                </h2>
                <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
                  Join hundreds of startups and investors already using Capital Call to close their next big deal.
                </p>
                <Link
                  href="/apply"
                  className="inline-block px-12 py-5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full text-xl font-bold text-white hover:scale-105 transition-transform"
                >
                  Apply as Startup
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-12 border-t border-white/10 bg-dark-950/80">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <Logo size="md" />
              <p className="text-white/40 text-sm">
                © 2026 Capital Call. All rights reserved.
              </p>
            </div>
          </div>
        </footer>

        {/* Scroll progress bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500 z-[100]"
          style={{ scaleX: scrollYProgress, transformOrigin: '0%' }}
        />
      </div>
    </SmoothScroll>
  );
}
