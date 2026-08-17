import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, useIsTouch, useReveal, EASE } from "@/lib/motion";
import { SectionLabel } from "./SectionLabel";
import portrait from "@/assets/portrait.jpg";

export function AboutSection() {
  const ref = useReveal<HTMLElement>();
  const mask = useRef<HTMLDivElement>(null);
  const plateA = useRef<HTMLDivElement>(null);
  const plateB = useRef<HTMLDivElement>(null);
  const reveal = useRef<HTMLDivElement>(null);

  const touch = useIsTouch();
  // Resolved after mount: prefersReducedMotion() returns true on the server, so
  // gating JSX on it directly would desync hydration.
  const [colourLayer, setColourLayer] = useState(false);
  const [tapped, setTapped] = useState(false);

  useEffect(() => {
    setColourLayer(!prefersReducedMotion());
  }, []);

  // Entrance wipe + parallax. One tween drives BOTH plates so they can never
  // drift apart; the masked layer itself is deliberately left untransformed.
  useEffect(() => {
    const m = mask.current;
    const a = plateA.current;
    if (!m || !a || prefersReducedMotion()) return;

    const plates: HTMLElement[] = plateB.current ? [a, plateB.current] : [a];

    const ctx = gsap.context(() => {
      gsap.fromTo(
        m,
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.6,
          ease: EASE.out,
          scrollTrigger: { trigger: m, start: "top 80%" },
        },
      );
      // scale 1.18 gives 9% bleed per edge against 7% of travel. The previous
      // 1.12/8 combination left a visible empty strip at the extremes.
      gsap.fromTo(
        plates,
        { yPercent: -7, scale: 1.18 },
        {
          yPercent: 7,
          scale: 1.18,
          ease: EASE.none,
          scrollTrigger: { trigger: m, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    });
    return () => ctx.revert();
  }, [colourLayer]);

  // Cursor-tracked colour reveal (fine pointers only).
  //
  // The listeners MUST live on the outer wrapper, not on the reveal layer
  // itself: the reveal layer rests at visibility:hidden (see .portrait-reveal
  // in styles.css), and a hidden element never receives pointer events — so a
  // listener bound to it can never fire the enter event that's supposed to
  // reveal it. The wrapper is always visible and hit-testable, and shares the
  // reveal layer's exact box (both are inset-0 inside the same relative
  // parent), so the coordinate math is unchanged.
  useEffect(() => {
    const m = mask.current;
    const r = reveal.current;
    if (!m || !r || !colourLayer || touch) return;

    const setX = gsap.quickSetter(r, "--rx");
    const setY = gsap.quickSetter(r, "--ry");
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    // A critically damped follow — this lag is what makes it feel physical.
    const tick = () => {
      const dx = tx - cx;
      const dy = ty - cy;
      if (Math.abs(dx) < 0.25 && Math.abs(dy) < 0.25) return;
      const f = 1 - Math.pow(1 - 0.16, gsap.ticker.deltaRatio());
      cx += dx * f;
      cy += dy * f;
      setX(cx);
      setY(cy);
    };

    const onEnter = (e: PointerEvent) => {
      const b = m.getBoundingClientRect();
      cx = tx = e.clientX - b.left;
      cy = ty = e.clientY - b.top;
      setX(cx);
      setY(cy);
      gsap.ticker.add(tick);
      gsap.to(r, {
        autoAlpha: 1,
        "--r": Math.round(Math.min(b.width, b.height) * 0.55),
        duration: 0.7,
        ease: EASE.out,
        overwrite: true,
      });
    };

    const onMove = (e: PointerEvent) => {
      const b = m.getBoundingClientRect();
      tx = e.clientX - b.left;
      ty = e.clientY - b.top;
    };

    const onLeave = () => {
      gsap.to(r, {
        autoAlpha: 0,
        "--r": 0,
        duration: 0.5,
        ease: EASE.inOut,
        overwrite: true,
        onComplete: () => gsap.ticker.remove(tick),
      });
    };

    m.addEventListener("pointerenter", onEnter);
    m.addEventListener("pointermove", onMove);
    m.addEventListener("pointerleave", onLeave);

    return () => {
      m.removeEventListener("pointerenter", onEnter);
      m.removeEventListener("pointermove", onMove);
      m.removeEventListener("pointerleave", onLeave);
      // These tweens are created inside handlers, so they escape gsap.context().
      gsap.ticker.remove(tick);
      gsap.killTweensOf(r);
      r.style.removeProperty("--rx");
      r.style.removeProperty("--ry");
      r.style.removeProperty("--r");
    };
  }, [colourLayer, touch]);

  // Touch: tap to flood the portrait with colour, tap again to return.
  const onTap = () => {
    const m = mask.current;
    const r = reveal.current;
    if (!m || !r || !colourLayer || !touch) return;
    const b = m.getBoundingClientRect();
    const next = !tapped;
    setTapped(next);
    gsap.set(r, { "--rx": b.width / 2, "--ry": b.height / 2 });
    gsap.to(r, {
      autoAlpha: next ? 1 : 0,
      "--r": next ? Math.round(Math.hypot(b.width, b.height)) : 0,
      duration: next ? 0.9 : 0.6,
      ease: next ? EASE.out : EASE.inOut,
      overwrite: true,
    });
  };

  return (
    <section ref={ref} id="about" className="px-5 py-28 md:px-10 md:py-40">
      <SectionLabel index="01" title="About" />

      <div className="mt-14 grid gap-14 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-7">
          <h2 className="display-lg">
            <span className="line-mask">
              <span className="block" data-reveal>
                A LITTLE
              </span>
            </span>
            <span className="line-mask">
              <span className="block text-muted-foreground" data-reveal>
                ABOUT ME.
              </span>
            </span>
          </h2>

          <div className="mt-10 max-w-xl space-y-5 text-[15px] leading-relaxed text-muted-foreground md:text-base">
            <p>
              I&apos;m Dmitriy — a student from Almaty, Kazakhstan, who spends most of his time
              building things on a screen. None of it was planned. Curiosity about how games worked
              pulled me toward Minecraft modding, then game development, then web development, and
              eventually AI.
            </p>
            <p>
              What keeps me interested is turning an idea into something you can actually click. I
              learn by experimenting — new colors, new layouts, new engines — which also means I
              start more projects than I finish. The ones that survive are the ones I keep coming
              back to.
            </p>
            <p>
              Outside of code: music while working late, mountains on weekends, and whatever
              half-finished idea is currently living in a browser tab I haven&apos;t closed.
            </p>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-hairline pt-8 sm:grid-cols-4">
            {[
              ["Name", "Lomako Dmitriy"],
              ["Age", "18 years old"],
              ["Studies", "International IT University"],
              ["Based in", "Almaty, KZ"],
              ["Interests", "Web dev, Minecraft modding, game dev, AI"],
            ].map(([k, v], i) => (
              <div key={k} className={i === 4 ? "sm:col-span-4" : undefined}>
                <dt className="meta">{k}</dt>
                <dd className="mt-2 font-display text-sm text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="md:col-span-5">
          <div
            ref={mask}
            onClick={onTap}
            className="relative aspect-[4/5] overflow-hidden"
            data-cursor={colourLayer && !touch ? "COLOUR" : undefined}
          >
            {/* Base plate — monochrome, and graded to sit in the dark palette. */}
            <div ref={plateA} className="absolute inset-0">
              <img
                src={portrait}
                alt="Portrait of Dima in low, cinematic light"
                width={1034}
                height={950}
                loading="lazy"
                decoding="async"
                className="size-full object-cover object-top grayscale contrast-[1.08] brightness-[0.92]"
              />
            </div>

            {/* Colour plate — same src, so no second request. Masked, untransformed. */}
            {colourLayer ? (
              <div ref={reveal} className="portrait-reveal absolute inset-0">
                <div ref={plateB} className="absolute inset-0">
                  <img
                    src={portrait}
                    alt=""
                    aria-hidden
                    width={1034}
                    height={950}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover object-top"
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-baseline justify-between gap-4">
            <p className="meta">Fig. 01 — Portrait</p>
            {colourLayer ? (
              <p className="meta text-primary/70">
                {touch ? "Tap for colour" : "Hover for colour"}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
