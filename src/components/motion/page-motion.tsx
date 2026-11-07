'use client';

import { usePathname } from 'next/navigation';
import { FULL_MOTION, gsap, ScrollTrigger, SplitText, useGSAP } from './gsap';
import { useMotionLevel } from './motion-provider';

const HIDDEN_UNTIL_ANIMATED = '[data-lines],[data-fade],[data-stagger],[data-media],[data-load]';
const NUMBER = /^([^\d]*)(\d[\d,]*\.?\d*)(.{0,3})$/;

function animateCount(element: HTMLElement) {
  const match = NUMBER.exec(element.textContent?.trim() ?? '');
  if (!match) return;
  const [, prefix, digits, suffix] = match;
  const target = Number(digits.replace(/,/g, ''));
  const decimals = digits.includes('.') ? digits.split('.')[1].length : 0;
  const grouped = digits.includes(',');
  const state = { value: 0 };
  const format = (value: number) => {
    const fixed = value.toFixed(decimals);
    return grouped ? Number(fixed).toLocaleString('en') : fixed;
  };
  gsap.to(state, {
    value: target,
    duration: 1.8,
    ease: 'expo.out',
    onUpdate: () => {
      element.textContent = `${prefix}${format(state.value)}${suffix}`;
    },
    scrollTrigger: { trigger: element, start: 'top 90%', once: true },
  });
  element.textContent = `${prefix}${format(0)}${suffix}`;
}

/**
 * The shared vocabulary of motion. Server-rendered markup opts in with data attributes:
 * data-lines (mask-reveal text by line), data-fade, data-stagger (children in sequence),
 * data-media (image wipes open), data-parallax, data-rule (a hairline draws itself),
 * data-count (numbers run up), data-magnetic (buttons lean toward the pointer).
 */
export function PageMotion() {
  const level = useMotionLevel();
  const pathname = usePathname();

  useGSAP(
    () => {
      if (level === 'off') {
        gsap.set(HIDDEN_UNTIL_ANIMATED, { autoAlpha: 1 });
        return;
      }

      const full = level === 'full';
      const media = gsap.matchMedia();

      media.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(HIDDEN_UNTIL_ANIMATED, { autoAlpha: 1 });
      });

      media.add(FULL_MOTION, () => {
        gsap.utils.toArray<HTMLElement>('[data-lines]').forEach((element) => {
          const onLoad = element.dataset.lines === 'load';
          const delay = Number(element.dataset.delay ?? 0);
          SplitText.create(element, {
            type: 'lines',
            autoSplit: true,
            onSplit(self) {
              gsap.set(element, { autoAlpha: 1 });
              return gsap.from(self.lines, {
                autoAlpha: 0,
                filter: 'blur(18px)',
                y: 34,
                duration: full ? 1.4 : 0.7,
                stagger: 0.12,
                delay,
                ease: 'expo.out',
                clearProps: 'filter',
                scrollTrigger: onLoad ? undefined : { trigger: element, start: 'top 90%', once: true },
              });
            },
          });
        });

        gsap.utils.toArray<HTMLElement>('[data-load]').forEach((element) => {
          gsap.fromTo(
            element,
            { autoAlpha: 0, y: 26 },
            { autoAlpha: 1, y: 0, duration: 1.2, delay: Number(element.dataset.load || 0.5) },
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-fade]').forEach((element) => {
          gsap.fromTo(
            element,
            { autoAlpha: 0, y: 36, filter: 'blur(14px)' },
            {
              autoAlpha: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 1.25,
              delay: Number(element.dataset.delay ?? 0),
              clearProps: 'filter',
              scrollTrigger: { trigger: element, start: 'top 92%', once: true },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((element) => {
          gsap.set(element, { autoAlpha: 1 });
          gsap.from(element.children, {
            autoAlpha: 0,
            y: 34,
            filter: 'blur(12px)',
            duration: 1.15,
            stagger: 0.09,
            clearProps: 'filter',
            scrollTrigger: { trigger: element, start: 'top 90%', once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>('[data-count]').forEach(animateCount);

        gsap.utils.toArray<HTMLElement>('[data-rule]').forEach((element) => {
          gsap.from(element, {
            scaleX: 0,
            transformOrigin: '0 50%',
            duration: 1.5,
            scrollTrigger: { trigger: element, start: 'top 94%', once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>('[data-media]').forEach((element) => {
          gsap.set(element, { autoAlpha: 1 });
          const inner = element.firstElementChild;
          const timeline = gsap.timeline({ scrollTrigger: { trigger: element, start: 'top 86%', once: true } });
          timeline.fromTo(
            element,
            { clipPath: 'inset(14% 8% 14% 8% round 28px)' },
            { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.5, ease: 'expo.out', clearProps: 'clipPath' },
          );
          if (inner) timeline.fromTo(inner, { scale: 1.14 }, { scale: 1, duration: 1.7, ease: 'expo.out' }, 0);
        });

        if (!full) return;

        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((element) => {
          const amount = Number(element.dataset.parallax ?? 12);
          gsap.fromTo(
            element,
            { yPercent: amount },
            {
              yPercent: -amount,
              ease: 'none',
              scrollTrigger: { trigger: element.parentElement ?? element, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          );
        });

        const cleanups: Array<() => void> = [];
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          gsap.utils.toArray<HTMLElement>('[data-magnetic]').forEach((element) => {
            const toX = gsap.quickTo(element, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.45)' });
            const toY = gsap.quickTo(element, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.45)' });
            const onMove = (event: PointerEvent) => {
              const box = element.getBoundingClientRect();
              toX((event.clientX - box.left - box.width / 2) * 0.28);
              toY((event.clientY - box.top - box.height / 2) * 0.28);
            };
            const onLeave = () => {
              toX(0);
              toY(0);
            };
            element.addEventListener('pointermove', onMove);
            element.addEventListener('pointerleave', onLeave);
            cleanups.push(() => {
              element.removeEventListener('pointermove', onMove);
              element.removeEventListener('pointerleave', onLeave);
            });
          });
        }
        return () => cleanups.forEach((cleanup) => cleanup());
      });

      // Late-loading images change the page height, which moves every scene's start and end points.
      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh);
      window.addEventListener('load', refresh);

      return () => {
        window.removeEventListener('load', refresh);
        media.revert();
      };
    },
    { dependencies: [pathname, level], revertOnUpdate: true },
  );

  return null;
}
