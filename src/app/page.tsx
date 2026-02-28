'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import PsychedelicBackground from '@/components/landing/PsychedelicBackground';
import FloatingShapes from '@/components/landing/FloatingShapes';
import ScrollReveal from '@/components/landing/ScrollReveal';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';

function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 700 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

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
        x: cursorX,
        y: cursorY,
        backgroundColor: isHovering ? '#ff00ff' : '#00ffff',
        scale: isHovering ? 2 : 1,
      }}
    />
  );
}

function AnimatedGradientBackground() {
  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.5, 1]);

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-0"
      style={{ rotate, scale }}
    >
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-pink/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-neon-purple/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-neon-cyan/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-2/3 right-1/3 w-64 h-64 bg-neon-green/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
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

  const handleApplyClick = () => {
    router.push('/apply');
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-dark-950 relative overflow-x-hidden">
      <CustomCursor />
      <AnimatedGradientBackground />
      <PsychedelicBackground />
      <div className="noise-overlay" />

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/10 backdrop-blur-md bg-dark-950/30">
        <div className="container-custom">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <Logo size="xl" />
                <div className="absolute inset-0 bg-neon-pink/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <button
                onClick={handleLoginClick}
                className="px-5 py-2 text-white/80 hover:text-white transition-all duration-300 hover:neon-text cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={handleApplyClick}
                className="relative px-6 py-3 text-white font-semibold overflow-hidden rounded-full group cursor-pointer"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan opacity-80 group-hover:opacity-100 transition-opacity" />
                <span className="absolute inset-0 bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="relative">Apply Now</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[90vh] flex items-center justify-center">
        <FloatingShapes className="opacity-40" />
        <div className="container-custom text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-10 cursor-default">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="text-white/80">The future of startup fundraising</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-8 tracking-tight leading-tight cursor-default">
              <span className="block animate-float bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan bg-clip-text text-transparent">
                Where
              </span>
              <span className="block animate-float bg-gradient-to-r from-neon-cyan via-neon-green to-neon-yellow bg-clip-text text-transparent" style={{ animationDelay: '0.5s' }}>
                Visionary
              </span>
              <span className="block animate-float bg-gradient-to-r from-neon-yellow via-neon-orange to-neon-pink bg-clip-text text-transparent" style={{ animationDelay: '1s' }}>
                Founders
              </span>
              <span className="block mt-4 text-4xl md:text-6xl">
                Meet Their <span className="neon-text text-neon-purple">Investors</span>
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed cursor-default">
              Connect with the right investors through our curated dealroom platform.
              Every connection is meaningful, every deal is crafted for success.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={handleApplyClick}
                className="group relative px-10 py-5 text-lg font-bold text-white overflow-hidden rounded-full cursor-pointer"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-neon-pink to-neon-purple" />
                <span className="absolute inset-0 bg-gradient-to-r from-neon-pink to-neon-purple blur-lg opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative">Apply as Startup</span>
              </button>
              <button
                onClick={handleLoginClick}
                className="px-10 py-5 text-lg font-medium text-white border border-white/20 rounded-full hover:border-neon-cyan hover:text-neon-cyan hover:neon-text transition-all duration-300 backdrop-blur-sm cursor-pointer"
              >
                Investor Login
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32">
        <div className="container-custom">
          <ScrollReveal>
            <h2 className="text-4xl md:text-6xl font-bold text-white text-center mb-20 cursor-default">
              Everything You <span className="neon-text text-neon-pink">Need</span>
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'For Founders',
                description: 'Apply in minutes, not hours. Track your application status in real-time and connect directly with investors who align with your vision.',
                color: 'neon-pink',
              },
              {
                icon: '📊',
                title: 'For Investors',
                description: 'Access curated opportunities, discover hidden gems, and make data-driven investment decisions with our intelligent matching system.',
                color: 'neon-cyan',
              },
              {
                icon: '🌟',
                title: 'Community',
                description: 'Join a network of founders and investors who trust Capital Call to facilitate meaningful connections that drive innovation.',
                color: 'neon-green',
              },
            ].map((feature, i) => (
              <ScrollReveal key={i} delay={i * 0.15} direction={i % 2 === 0 ? 'left' : 'right'}>
                <div className="group glass-neon p-8 rounded-2xl hover:scale-110 hover:rotate-1 transition-all duration-500 cursor-pointer">
                  <div className="relative mb-6">
                    <div className={`absolute inset-0 bg-${feature.color}/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className={`relative w-16 h-16 rounded-xl bg-${feature.color}/20 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500`}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className={`text-2xl font-semibold text-${feature.color} mb-4 group-hover:neon-text transition-all duration-300`}>
                    {feature.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-32">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '$2B+', label: 'Capital Deployed', color: 'neon-pink' },
              { value: '500+', label: 'Startups Funded', color: 'neon-purple' },
              { value: '200+', label: 'Active Investors', color: 'neon-cyan' },
              { value: '95%', label: 'Match Rate', color: 'neon-green' },
            ].map((stat, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="text-center group cursor-default">
                  <motion.div
                    className={`text-5xl md:text-7xl font-bold text-${stat.color} mb-2`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-white/60 text-lg">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32">
        <div className="container-custom">
          <ScrollReveal>
            <div className="relative p-12 md:p-20 text-center rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-pink/20 via-neon-purple/20 to-neon-cyan/20 animate-pulse-slow" />
              <div className="absolute inset-0 bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan opacity-0 hover:opacity-20 transition-opacity duration-500" />

              <div className="absolute inset-0 rounded-3xl animate-morph">
                <div className="absolute inset-0 rounded-3xl border-2 border-neon-pink/50 animate-pulse" />
              </div>

              <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 cursor-default">
                  Ready to <span className="neon-text text-neon-pink">Get Started?</span>
                </h2>
                <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 cursor-default">
                  Join hundreds of startups and investors already using Capital Call to close their next big deal.
                </p>
                <button
                  onClick={handleApplyClick}
                  className="group relative px-12 py-6 text-xl font-bold text-white overflow-hidden rounded-full cursor-pointer"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-neon-green to-neon-cyan" />
                  <span className="absolute inset-0 bg-gradient-to-r from-neon-green to-neon-cyan blur-lg opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-pink opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative">Apply as Startup</span>
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/10">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Logo size="md" />
            </div>
            <p className="text-white/40 text-sm">
              © 2026 Capital Call. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan z-[100]"
        style={{ scaleX: scrollYProgress, transformOrigin: '0%' }}
      />
    </div>
  );
}
