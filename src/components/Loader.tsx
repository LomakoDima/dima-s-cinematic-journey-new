import { useEffect, useRef, useState } from "react";
import { gsap, EASE, prefersReducedMotion, markAppReady } from "@/lib/motion";

/** Artificial climb before we start checking real load signals. */
const CLIMB = 0.75;
/** Longest we'll wait on fonts/window-load once the climb finishes. */
const MAX_WAIT = 0.6;
/** Last-resort exit if something in the chain above never settles. */
const HARD_CAP = 5000;

function waitForRealReady(): Promise<void> {
  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  const windowLoaded =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((resolve) =>
          window.addEventListener("load", () => resolve(), { once: true }),
        );
  return Promise.all([fontsReady, windowLoaded]).then(() => undefined);
}

/**
 * The opening scene, not a utility screen: silence, then the typography
 * assembles itself, then the whole surface lifts to reveal the hero already
 * mid-entrance underneath. See markAppReady/onAppReady in lib/motion — the
 * hero's own entrance timeline stays paused until this fires.
 *
 * Rendered unconditionally (server included) so it's part of the very first
 * paint — this is SSR, so the browser paints the server HTML as soon as it
 * and its CSS arrive, well before React hydrates. A loader that only mounts
 * from a client effect leaves exactly the gap that shows: a flash of the
 * finished homepage, then the loader dropping in over it a beat later.
 *
 * The no-JS safety net moves with it: `.loader-fallback` in styles.css fades
 * this out on a pure CSS delay, cancelled the instant this effect confirms
 * JS is actually driving (see the `js-driven` class below) — so a page with
 * broken or blocked JS still self-clears instead of leaving a black screen
 * nobody can get past.
 */
export function Loader() {
  const [visible, setVisible] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLParagraphElement>(null);
  const line1 = useRef<HTMLSpanElement>(null);
  const line2 = useRef<HTMLSpanElement>(null);
  const counterWrap = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const linesRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.classList.add("js-driven");

    const html = document.documentElement;
    html.classList.add("is-loading");

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      html.classList.remove("is-loading");
      markAppReady();
    };

    if (prefersReducedMotion()) {
      gsap.set([metaRef.current, counterWrap.current, line1.current, line2.current], {
        opacity: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        y: 0,
      });
      if (counterRef.current) counterRef.current.textContent = "100";
      const tl = gsap.timeline({
        delay: 0.2,
        onComplete: () => {
          finish();
          setVisible(false);
        },
      });
      tl.to(el, { opacity: 0, duration: 0.35, ease: EASE.inOut });
      return () => {
        tl.kill();
        finish();
      };
    }

    let cancelled = false;
    const hardCap = window.setTimeout(() => {
      finish();
      setVisible(false);
    }, HARD_CAP);

    const ctx = gsap.context(() => {
      const progress = { p: 0 };
      let shown = "";
      const setCounter = () => {
        const next = String(Math.round(progress.p)).padStart(2, "0");
        if (next !== shown && counterRef.current) {
          shown = next;
          counterRef.current.textContent = next;
        }
      };

      const tl = gsap.timeline({
        onComplete: () => {
          void Promise.race([
            waitForRealReady(),
            new Promise<void>((resolve) => window.setTimeout(resolve, MAX_WAIT * 1000)),
          ]).then(() => {
            if (cancelled) return;
            const settle = gsap.timeline({
              onComplete: () => setVisible(false),
            });
            settle
              .to(progress, { p: 100, duration: 0.3, ease: "power1.out", onUpdate: setCounter })
              .to({}, { duration: 0.12 })
              .add(finish)
              .to(
                [
                  line1.current,
                  line2.current,
                  counterWrap.current,
                  metaRef.current,
                  linesRef.current,
                ],
                { scale: 0.97, opacity: 0, duration: 0.45, ease: EASE.inOut },
                "<",
              )
              .to(
                el,
                { yPercent: -100, duration: 0.85, ease: EASE.inOut, pointerEvents: "none" },
                "<0.05",
              );
          });
        },
      });

      tl.to(metaRef.current, { opacity: 1, duration: 0.4, ease: EASE.softOut })
        .to(
          [line1.current, line2.current],
          { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 0.7, ease: EASE.out, stagger: 0.1 },
          "-=0.1",
        )
        .to(counterWrap.current, { opacity: 1, duration: 0.4, ease: EASE.softOut }, "<")
        .to(linesRef.current, { opacity: 1, duration: 0.8, ease: EASE.softOut }, "<")
        .to(
          progress,
          { p: 88, duration: CLIMB, ease: "power2.out", onUpdate: setCounter },
          "<0.05",
        );
    }, el);

    return () => {
      cancelled = true;
      window.clearTimeout(hardCap);
      ctx.revert();
      finish();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="loader-fallback fixed inset-0 z-[95] flex flex-col justify-between overflow-hidden bg-background px-5 py-8 md:px-10 md:py-10"
    >
      <div aria-hidden className="loader-grain" />

      <div className="flex items-start justify-between">
        <p ref={metaRef} className="meta opacity-0">
          DIMA / 2026
        </p>
        <svg
          ref={linesRef}
          className="hidden w-32 opacity-0 sm:block md:w-40"
          viewBox="0 0 200 56"
          fill="none"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="0"
              y1={8 + i * 10}
              x2="200"
              y2={8 + i * 10 + (i % 2 === 0 ? 6 : -6)}
              stroke={i === 2 ? "var(--primary)" : "var(--foreground)"}
              strokeOpacity={i === 2 ? 0.35 : 0.16}
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>

      <div className="flex flex-col gap-8 pb-2 md:flex-row md:items-end md:justify-between">
        <h2 className="display-lg max-w-xl">
          <span className="line-mask block">
            <span
              ref={line1}
              className="block"
              style={{ clipPath: "inset(0% 0% 100% 0%)", transform: "translateY(6px)" }}
            >
              BUILDING
            </span>
          </span>
          <span className="line-mask block">
            <span
              ref={line2}
              className="block text-muted-foreground"
              style={{ clipPath: "inset(0% 0% 100% 0%)", transform: "translateY(6px)" }}
            >
              THE EXPERIENCE
            </span>
          </span>
        </h2>

        <div
          ref={counterWrap}
          className="flex items-baseline gap-3 opacity-0 md:flex-col md:items-end md:gap-1"
        >
          <span
            ref={counterRef}
            className="font-display text-4xl text-foreground tabular-nums md:text-5xl"
          >
            00
          </span>
          <span className="meta text-primary/70">Loading</span>
        </div>
      </div>
    </div>
  );
}
