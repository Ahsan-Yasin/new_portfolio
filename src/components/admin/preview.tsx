'use client';

import { ExternalLink, LoaderCircle, Monitor, RotateCw, Smartphone, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { IconButton, Segmented, spring, useMediaQuery } from './ui';

const DESKTOP_WIDTH = 1280;
const PHONE_WIDTH = 390;
const DEVICES = [
  { value: 'desktop', label: 'Desktop', icon: Monitor },
  { value: 'phone', label: 'Phone', icon: Smartphone },
] as const;

type Device = (typeof DEVICES)[number]['value'];

/**
 * Loads each update in a hidden frame and swaps it in once ready, with the scroll
 * position carried over, so a save doesn't flash the preview white.
 */
function PreviewFrames({ src, nonce, reloadCount }: { src: string; nonce: number; reloadCount: number }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLIFrameElement | null>(null);
  const pendingRef = useRef<HTMLIFrameElement | null>(null);

  const load = useCallback((url: string, keepScroll: boolean) => {
    const host = hostRef.current;
    if (!host) return;
    pendingRef.current?.remove();

    const frame = document.createElement('iframe');
    frame.title = 'Preview of your draft';
    frame.className = 'a-frame is-loading';
    frame.src = url;
    frame.addEventListener(
      'load',
      () => {
        const previous = activeRef.current;
        let top = 0;
        try {
          if (keepScroll) {
            top = previous?.contentWindow?.scrollY ?? 0;
            frame.contentWindow?.scrollTo({ top, behavior: 'instant' });
          }
        } catch {
          // A frame that navigated off this site can't be scrolled, which is fine.
        }
        frame.classList.remove('is-loading');
        activeRef.current = frame;
        if (pendingRef.current === frame) pendingRef.current = null;
        previous?.remove();
        if (top) {
          // Images can still change the height just after load, so settle once more.
          setTimeout(() => {
            try {
              if (activeRef.current === frame) frame.contentWindow?.scrollTo({ top, behavior: 'instant' });
            } catch {
              // As above.
            }
          }, 200);
        }
      },
      { once: true },
    );
    pendingRef.current = frame;
    host.appendChild(frame);
  }, []);

  const last = useRef<{ src: string | null; nonce: number; reloadCount: number }>({ src: null, nonce, reloadCount });
  useEffect(() => {
    const previous = last.current;
    last.current = { src, nonce, reloadCount };

    // Editing something else moves the preview to that page.
    if (previous.src !== src) {
      load(src, false);
      return;
    }
    if (previous.nonce === nonce && previous.reloadCount === reloadCount) return;

    // A save reloads whichever page is showing, even one reached by clicking a link inside the preview.
    let current = src;
    try {
      current = activeRef.current?.contentWindow?.location.href ?? src;
    } catch {
      current = src;
    }
    load(current, true);
  }, [src, nonce, reloadCount, load]);

  return <div ref={hostRef} className="a-frame-host" />;
}

function PreviewStage({
  src,
  nonce,
  device,
  reloadCount,
}: {
  src: string;
  nonce: number;
  device: Device;
  reloadCount: number;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const frameWidth = device === 'phone' ? PHONE_WIDTH : DESKTOP_WIDTH;
  const scale = size.width ? Math.min(1, size.width / frameWidth) : 1;

  return (
    <div ref={stageRef} className="a-preview-stage">
      <div className="a-preview-loading">
        <LoaderCircle size={20} className="a-spin" aria-hidden />
      </div>
      <div
        className="a-preview-canvas"
        data-device={device}
        style={
          {
            '--frame-w': `${frameWidth}px`,
            '--frame-scale': scale,
            width: frameWidth * scale,
          } as React.CSSProperties
        }
      >
        <PreviewFrames src={src} nonce={nonce} reloadCount={reloadCount} />
      </div>
    </div>
  );
}

export function PreviewPane({
  open,
  onClose,
  src,
  nonce,
}: {
  open: boolean;
  onClose: () => void;
  src: string;
  nonce: number;
}) {
  const isSmall = useMediaQuery('(max-width: 1100px)');
  const [device, setDevice] = useState<Device>('desktop');
  const [reloadCount, setReloadCount] = useState(0);
  const offscreen = isSmall ? { y: '100%' } : { x: '100%' };

  return (
    <aside className="a-preview-slot" aria-label="Preview">
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="preview"
            className="a-preview"
            initial={offscreen}
            animate={{ x: 0, y: 0 }}
            exit={offscreen}
            transition={spring}
          >
            <div className="a-preview-bar">
              <IconButton icon={X} label="Close preview" onClick={onClose} />
              <Segmented label="Device width" value={device} onChange={setDevice} options={DEVICES} />
              <span className="a-preview-tools">
                <IconButton icon={RotateCw} label="Reload preview" onClick={() => setReloadCount((count) => count + 1)} />
                <a
                  className="a-icon-button"
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open preview in a new tab"
                  title="Open preview in a new tab"
                >
                  <ExternalLink size={16} aria-hidden />
                </a>
              </span>
            </div>
            <PreviewStage src={src} nonce={nonce} device={device} reloadCount={reloadCount} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </aside>
  );
}
