'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
gsap.defaults({ ease: 'expo.out' });
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText, useGSAP };

/** Runs only when the visitor hasn't asked for reduced motion. Separate setups for large and small screens. */
export const FULL_MOTION = '(prefers-reduced-motion: no-preference)';
export const LARGE = '(prefers-reduced-motion: no-preference) and (min-width: 900px)';
export const SMALL = '(prefers-reduced-motion: no-preference) and (max-width: 899.98px)';

/** Latest scroll speed in pixels per frame, shared with anything that reacts to scrolling. */
export const scrollState = { velocity: 0 };
