/**
 * The single place GSAP plugins are registered. Import `gsap` and the plugins
 * from here, never from 'gsap' directly, so registration cannot be forgotten
 * and cannot happen twice.
 *
 * As of GSAP 3.13 the whole plugin set is free — no bonus files, no auth token.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { Observer } from 'gsap/Observer';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger, Flip, Observer);
}

export { gsap, ScrollTrigger, Flip, Observer, useGSAP };
