'use client';

import { useEffect, useRef, type VideoHTMLAttributes } from 'react';

/**
 * A muted looping clip that plays only while it's on screen and motion is allowed. It has no
 * autoPlay attribute, so visitors who've asked for less motion fetch metadata only. Its cleanup
 * also pauses it when a route is hidden but kept mounted.
 */
export function LoopVideo(props: VideoHTMLAttributes<HTMLVideoElement>) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;

    const sync = () => {
      const allowed = !reduced.matches && !video.closest('[data-motion="off"]');
      if (visible && allowed) void video.play().catch(() => {});
      else video.pause();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(video);
    reduced.addEventListener('change', sync);

    return () => {
      observer.disconnect();
      reduced.removeEventListener('change', sync);
      video.pause();
    };
  }, []);

  return <video ref={ref} muted loop playsInline preload="metadata" {...props} />;
}
