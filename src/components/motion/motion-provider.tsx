'use client';

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import type { Theme } from '@/lib/content/schema';
import { CustomCursor } from './custom-cursor';
import { gsap, ScrollTrigger, scrollState } from './gsap';

const MotionLevel = createContext<Theme['motion']>('full');
export const useMotionLevel = () => useContext(MotionLevel);

/** Smooth scrolling, tied to GSAP's clock so scroll-driven scenes and the page never disagree. */
export function MotionProvider({ level, children }: { level: Theme['motion']; children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (level !== 'full' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, anchors: { offset: -72 } });
    lenisRef.current = lenis;
    lenis.on('scroll', (instance: Lenis) => {
      scrollState.velocity = instance.velocity;
      ScrollTrigger.update();
    });

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [level]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      lenisRef.current?.scrollTo(hash, { immediate: true, offset: -72 });
    } else {
      lenisRef.current?.scrollTo(0, { immediate: true });
    }
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return (
    <MotionLevel.Provider value={level}>
      {children}
      {level === 'full' ? <CustomCursor /> : null}
    </MotionLevel.Provider>
  );
}
