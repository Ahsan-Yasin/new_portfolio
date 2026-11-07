'use client';

import { useEffect, useRef } from 'react';
import { gsap } from './gsap';

/**
 * A glowing dot that trails the pointer, swells over anything clickable, and opens up
 * into a labelled disc over elements marked data-cursor. The system cursor stays visible.
 */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = dot.current;
    const text = label.current;
    if (!element || !text) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const toX = gsap.quickTo(element, 'x', { duration: 0.42, ease: 'power3' });
    const toY = gsap.quickTo(element, 'y', { duration: 0.42, ease: 'power3' });
    let shown = false;

    const onMove = (event: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.set(element, { x: event.clientX, y: event.clientY });
        gsap.to(element, { autoAlpha: 1, duration: 0.3 });
      }
      toX(event.clientX);
      toY(event.clientY);
    };

    let currentLabel = '';
    const onOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      const labelled = target.closest<HTMLElement>('[data-cursor]');
      const clickable = target.closest('a, button, input, textarea, [role="button"]');
      const next = labelled?.dataset.cursor ?? '';
      if (next !== currentLabel) {
        currentLabel = next;
        if (next) text.textContent = next;
      }
      gsap.to(element, {
        scale: next ? 1 : clickable ? 0.5 : 0.16,
        // Over a control the disc turns translucent, so it never hides what's being clicked.
        opacity: !next && clickable ? 0.28 : 1,
        duration: 0.5,
        ease: 'expo.out',
      });
      gsap.to(text, { autoAlpha: next ? 1 : 0, duration: 0.25 });
    };

    const onLeaveWindow = () => {
      shown = false;
      gsap.to(element, { autoAlpha: 0, duration: 0.25 });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeaveWindow);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('pointerleave', onLeaveWindow);
    };
  }, []);

  return (
    <div
      ref={dot}
      aria-hidden
      className="no-print pointer-events-none invisible fixed left-0 top-0 z-[90] -ml-[52px] -mt-[52px] grid h-[104px] w-[104px] scale-[.16] place-items-center rounded-full bg-accent text-center text-[0.8125rem] font-semibold leading-tight text-on-accent shadow-[0_0_40px_color-mix(in_srgb,var(--accent)_55%,transparent)]"
    >
      <span ref={label} className="invisible max-w-[80px]" />
    </div>
  );
}
