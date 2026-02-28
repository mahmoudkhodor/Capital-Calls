'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProps {
  children: React.ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return <>{children}</>;
}

// Hook for scroll-triggered animations
export function useScrollAnimation(
  animation: gsap.core.Tween,
  triggerRef: React.RefObject<HTMLElement>,
  options?: {
    start?: string;
    end?: string;
    scrub?: boolean | number;
    markers?: boolean;
  }
) {
  const { start = 'top 80%', end = 'bottom 20%', scrub = false, markers = false } = options || {};

  useEffect(() => {
    if (!triggerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(animation.targets(), {
        scrollTrigger: {
          trigger: triggerRef.current,
          start,
          end,
          scrub,
          markers,
        },
        ...animation.vars,
      });
    });

    return () => ctx.revert();
  }, [animation, triggerRef, start, end, scrub, markers]);
}
