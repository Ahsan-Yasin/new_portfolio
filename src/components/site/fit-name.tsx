'use client';

import { useEffect, useRef } from 'react';

/** Scales a single line of type so it runs exactly from gutter to gutter, whatever the name's length. */
export function FitName({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element?.parentElement) return;
    const parent = element.parentElement;

    const fit = () => {
      element.style.fontSize = '100px';
      const measured = element.scrollWidth;
      const style = getComputedStyle(parent);
      const available = parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      if (measured > 0) element.style.fontSize = `${(100 * available) / measured}px`;
    };

    fit();
    document.fonts?.ready.then(fit);
    const observer = new ResizeObserver(fit);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [text]);

  return (
    <p ref={ref} aria-hidden className={`t-mega w-max whitespace-nowrap ${className}`} style={{ fontSize: '13vw', lineHeight: 0.86 }}>
      {text}
    </p>
  );
}
