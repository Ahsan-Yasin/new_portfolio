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

  // Browser Back and Forward should return to where the visitor was, not to the top.
  const cameFromHistory = useRef(false);
  useEffect(() => {
    const onPopState = () => {
      cameFromHistory.current = true;
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const fromHistory = cameFromHistory.current;
    cameFromHistory.current = false;

    if (!fromHistory) {
      const hash = window.location.hash;
      if (hash) {
        lenisRef.current?.scrollTo(hash, { immediate: true, force: true, offset: -72 });
      } else {
        // Moves the page natively too: Lenis skips a scroll to where it believes it already is,
        // and that belief can be out of date after the browser restores a position.
        window.scrollTo({ top: 0, behavior: 'instant' });
        lenisRef.current?.scrollTo(0, { immediate: true, force: true });
      }
    }

    const id = window.setTimeout(() => {
      // After Back or Forward, tell Lenis where the browser put the page, so the next wheel tick doesn't jump.
      if (fromHistory) lenisRef.current?.scrollTo(window.scrollY, { immediate: true, force: true });
      ScrollTrigger.refresh();
    }, 120);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return (
    <MotionLevel.Provider value={level}>
      {children}
      {level === 'full' ? <CustomCursor /> : null}
    </MotionLevel.Provider>
  );
}
