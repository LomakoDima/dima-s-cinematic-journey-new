import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

let registered = false;
export function useGsap() {
  if (typeof window !== "undefined" && !registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}

/**
 * Media queries shared between JS and CSS. `desktop`/`mobile` must stay in sync
 * with Tailwind's `md` breakpoint (768px) — a mismatch leaves a dead band where
 * the layout says one thing and the animation says another.
 */
export const MEDIA = {
  desktop: "(min-width: 768px)",
  mobile: "(max-width: 767.98px)",
  motionOk: "(prefers-reduced-motion: no-preference)",
  hoverFine: "(hover: hover) and (pointer: fine)",
} as const;

/** The site's easing vocabulary. Entrances are expo.out; scrubs are linear. */
export const EASE = {
  out: "expo.out",
  softOut: "power3.out",
  inOut: "power2.inOut",
  in: "power2.in",
  none: "none",
} as const;

export function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useIsTouch() {
  const [touch, setTouch] = useState(true);
  useEffect(() => {
    setTouch(!window.matchMedia(MEDIA.hoverFine).matches);
  }, []);
  return touch;
}

let lenisInstance: Lenis | null = null;

/** The active Lenis instance, or null when smooth scrolling is off. */
export function getLenis() {
  return lenisInstance;
}

/** Scroll to the top through Lenis when it's running, natively otherwise. */
export function scrollToTop() {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { duration: 1.2 });
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/** Lenis smooth scrolling wired into GSAP's ticker + ScrollTrigger. */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    void (async () => {
      const { default: Lenis } = await import("lenis");
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const l = new Lenis({ duration: 1.1, smoothWheel: true });
      lenisInstance = l;
      l.on("scroll", ScrollTrigger.update);

      const raf = (time: number) => l.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      ScrollTrigger.refresh();
      // Google Fonts swap in after first paint and change heading heights, which
      // moves every pinned section's start. Re-measure once they land.
      void document.fonts?.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });

      cleanup = () => {
        gsap.ticker.remove(raf);
        l.destroy();
        if (lenisInstance === l) lenisInstance = null;
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);
}

let appReady = false;
const readyCallbacks: Array<() => void> = [];

/**
 * Marks the loader sequence as finished. Idempotent — the loader calls this
 * once, right as it starts lifting away, so gated entrances (the hero
 * typography) begin while the surface is still mid-motion rather than after
 * it's gone, which is what makes the hand-off read as one continuous scene.
 */
export function markAppReady() {
  if (appReady) return;
  appReady = true;
  readyCallbacks.splice(0).forEach((cb) => cb());
}

/** Runs `cb` once the loader has finished — immediately if it already has. */
export function onAppReady(cb: () => void) {
  if (appReady) {
    cb();
    return;
  }
  readyCallbacks.push(cb);
}

/** Staggered mask reveal for elements marked with [data-reveal] inside the ref. */
export function useReveal<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T>(null);
  useGsap();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!targets.length) return;
    if (prefersReducedMotion()) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.1,
          ease: EASE.out,
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 78%" },
        },
      );
    }, el);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

export { gsap, ScrollTrigger };
