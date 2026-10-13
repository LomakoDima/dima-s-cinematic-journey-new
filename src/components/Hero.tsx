import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, useIsTouch, useGsap, onAppReady, EASE } from "@/lib/motion";
import { HeroVisual } from "./HeroVisual";

/**
 * One letter per inline-block so each can rise on its own. The word keeps its
 * visual text for assistive tech through the parent's aria-label — the
 * individual glyphs are hidden from the accessibility tree.
 */
function Chars({ text }: { text: string }) {
  return (
    <>
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          aria-hidden
          data-hero-char
          className="inline-block transition-colors duration-700 hover:text-primary hover:duration-100"
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </>
  );
}

/** Almaty wall-clock. Resolved after mount so server and client markup match. */
function LocalTime() {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Almaty",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <p className="meta hidden items-center gap-3 md:flex" data-hero-fade>
      <span aria-hidden className="hero-live-dot size-1 rounded-full bg-primary" />
      <span className="tabular-nums">Local {time}</span>
    </p>
  );
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const touch = useIsTouch();
  useGsap();

  // The entrance stays paused until the loader hands off (see markAppReady in
  // lib/motion) — built, not just played, so it starts while the loader
  // surface is still lifting rather than after it's already gone.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let cancelled = false;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set(
          "[data-hero-eyebrow], [data-hero-char], [data-hero-sub], [data-hero-fade], [data-hero-rule]",
          { yPercent: 0, opacity: 1, scaleX: 1 },
        );
        return;
      }

      const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.out } });
      tl.fromTo(
        "[data-hero-eyebrow]",
        { yPercent: 115, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.2 },
        0,
      )
        .fromTo(
          "[data-hero-char]",
          { yPercent: 115, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1.5, stagger: 0.035 },
          0.1,
        )
        .fromTo(
          "[data-hero-sub]",
          { yPercent: 115, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1.3 },
          0.95,
        )
        .fromTo(
          "[data-hero-rule]",
          { scaleX: 0 },
          { scaleX: 1, duration: 1.8, ease: "power3.inOut" },
          0.5,
        )
        .fromTo("[data-hero-fade]", { opacity: 0 }, { opacity: 1, duration: 1, stagger: 0.1 }, 0.9);

      // The closing full stop breathes once the sentence has landed — a cursor
      // waiting for the next line.
      tl.eventCallback("onComplete", () => {
        gsap.to("[data-hero-period]", {
          opacity: 0.25,
          duration: 1.1,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });

      onAppReady(() => {
        if (!cancelled) tl.play();
      });

      // Leaving the hero: the copy drifts up and dims while the page scrolls
      // over it. Applied to the wrapper only — the children own the pointer
      // parallax, so the two never touch the same element.
      gsap.to("[data-hero-content]", {
        yPercent: -12,
        opacity: 0.1,
        ease: EASE.none,
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, el);
    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, []);

  // Pointer: depth parallax on the copy, and a spotlight that trails the cursor.
  useEffect(() => {
    const el = root.current;
    if (!el || touch || prefersReducedMotion()) return;
    const layers = el.querySelectorAll<HTMLElement>("[data-depth]");
    const spot = el.querySelector<HTMLElement>("[data-hero-spot]");
    const spotX = spot ? gsap.quickTo(spot, "x", { duration: 1.8, ease: "power3.out" }) : null;
    const spotY = spot ? gsap.quickTo(spot, "y", { duration: 1.8, ease: "power3.out" }) : null;

    const move = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      layers.forEach((layer) => {
        const d = Number(layer.dataset["depth"] ?? 1);
        gsap.to(layer, { x: x * 22 * d, y: y * 14 * d, duration: 1.2, ease: "power3.out" });
      });
      spotX?.(x * window.innerWidth * 0.55);
      spotY?.(y * window.innerHeight * 0.45);
    };
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      if (spot) gsap.set(spot, { clearProps: "x,y" });
    };
  }, [touch]);

  return (
    <section
      ref={root}
      id="top"
      className="relative flex min-h-svh flex-col justify-between overflow-hidden px-5 pb-8 pt-28 md:px-10 md:pb-10"
    >
      <div
        aria-hidden
        data-hero-spot
        className="pointer-events-none absolute left-1/2 top-[38%] -z-10 aspect-square w-[min(90vw,90vh)] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 16%, transparent), color-mix(in oklab, var(--primary) 4%, transparent) 55%, transparent)",
        }}
      />

      <HeroVisual />

      <div className="flex items-start justify-between">
        <p className="meta" data-hero-fade>
          Almaty / Kazakhstan
        </p>
        <LocalTime />
        <p className="meta" data-hero-fade>
          2026
        </p>
      </div>

      <div className="py-10" data-hero-content>
        <div data-depth="0.4">
          <span className="line-mask">
            <span className="meta block" data-hero-eyebrow>
              Dima
            </span>
          </span>
        </div>
        <h1 className="display-xl mt-4" data-depth="1" aria-label="I BUILD THINGS.">
          <span className="line-mask">
            <span className="block">
              <Chars text="I BUILD" />
            </span>
          </span>
          <span className="line-mask">
            <span className="block text-muted-foreground">
              <Chars text="THINGS" />
              <span
                aria-hidden
                data-hero-char
                data-hero-period
                className="inline-block text-primary"
                style={{
                  textShadow: "0 0 0.35em color-mix(in oklab, var(--primary) 55%, transparent)",
                }}
              >
                .
              </span>
            </span>
          </span>
        </h1>
        <div className="mt-8 max-w-md" data-depth="0.6">
          <span className="line-mask">
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base" data-hero-sub>
              Developer
              <span aria-hidden className="mx-2.5 text-primary">
                ·
              </span>
              Creative Technologist
              <span aria-hidden className="mx-2.5 text-primary">
                ·
              </span>
              Builder
            </p>
          </span>
        </div>
      </div>

      <div>
        <div
          aria-hidden
          data-hero-rule
          className="h-px origin-left"
          style={{ background: "var(--hairline)" }}
        />
        <div className="flex items-end justify-between pt-5">
          <a
            href="#about"
            className="meta group flex items-center gap-4 text-foreground/80 hover:text-primary"
            data-hero-fade
          >
            <span aria-hidden className="hero-scroll-cue" />
            Scroll to explore
          </a>
          <p className="meta hidden md:block" data-hero-fade>
            Portfolio — Vol. 01
          </p>
        </div>
      </div>
    </section>
  );
}
