import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion, useIsTouch, onAppReady } from "@/lib/motion";
import { HeroVisual } from "./HeroVisual";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const touch = useIsTouch();

  // The entrance stays paused until the loader hands off (see markAppReady in
  // lib/motion) — built, not just played, so it starts while the loader
  // surface is still lifting rather than after it's already gone.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let cancelled = false;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set("[data-hero]", { yPercent: 0, opacity: 1 });
        return;
      }
      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      tl.fromTo(
        "[data-hero]",
        { yPercent: 115, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.4, stagger: 0.09 },
      ).fromTo(
        "[data-hero-fade]",
        { opacity: 0 },
        { opacity: 1, duration: 1, stagger: 0.1 },
        "-=0.8",
      );
      onAppReady(() => {
        if (!cancelled) tl.play();
      });
    }, el);
    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el || touch || prefersReducedMotion()) return;
    const layers = el.querySelectorAll<HTMLElement>("[data-depth]");
    const move = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      layers.forEach((layer) => {
        const d = Number(layer.dataset["depth"] ?? 1);
        gsap.to(layer, { x: x * 22 * d, y: y * 14 * d, duration: 1.2, ease: "power3.out" });
      });
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [touch]);

  return (
    <section
      ref={root}
      id="top"
      className="relative flex min-h-svh flex-col justify-between overflow-hidden px-5 pb-8 pt-28 md:px-10 md:pb-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[70vh] w-[80vw] -translate-x-1/2 rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 14%, transparent), transparent)",
        }}
      />

      <HeroVisual />

      <div className="flex items-start justify-between">
        <p className="meta" data-hero-fade>
          Almaty / Kazakhstan
        </p>
        <p className="meta" data-hero-fade>
          2026
        </p>
      </div>

      <div className="py-10">
        <div data-depth="0.4">
          <span className="line-mask">
            <span className="meta block" data-hero>
              Dima
            </span>
          </span>
        </div>
        <h1 className="display-xl mt-4" data-depth="1">
          <span className="line-mask">
            <span className="block" data-hero>
              I BUILD
            </span>
          </span>
          <span className="line-mask">
            <span className="block text-muted-foreground" data-hero>
              THINGS.
            </span>
          </span>
        </h1>
        <div className="mt-8 max-w-md" data-depth="0.6">
          <span className="line-mask">
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base" data-hero>
              Developer · Creative Technologist · Builder
            </p>
          </span>
        </div>
      </div>

      <div className="hairline-t flex items-end justify-between pt-5">
        <a href="#about" className="meta text-foreground/80 hover:text-primary" data-hero-fade>
          Scroll to explore ↓
        </a>
        <p className="meta hidden md:block" data-hero-fade>
          Portfolio — Vol. 01
        </p>
      </div>
    </section>
  );
}
