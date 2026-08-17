import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, useIsTouch } from "@/lib/motion";

const BASE = 26;
const MIN_LABELLED = 76;
const MAX_LABELLED = 132;

/** Small precise cursor that expands and shows a context label over [data-cursor] elements. */
export function Cursor() {
  const touch = useIsTouch();
  // Read after mount — prefersReducedMotion() is true on the server.
  const [reduced, setReduced] = useState(true);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (touch || reduced) return;
    const d = dot.current;
    const r = ring.current;
    const l = label.current;
    if (!d || !r || !l) return;

    // Hide the OS cursor only once ours is actually live, so a JS failure never
    // leaves the page cursorless.
    const html = document.documentElement;
    html.classList.add("has-custom-cursor");

    gsap.set([d, r], { xPercent: -50, yPercent: -50, opacity: 0 });

    const xTo = gsap.quickTo(r, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(r, "y", { duration: 0.5, ease: "power3" });
    const dx = gsap.quickTo(d, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(d, "y", { duration: 0.12, ease: "power3" });

    let current = "";

    const move = (e: PointerEvent) => {
      gsap.to([d, r], { opacity: 1, duration: 0.3, overwrite: "auto" });
      xTo(e.clientX);
      yTo(e.clientY);
      dx(e.clientX);
      dy(e.clientY);

      const target = (e.target as HTMLElement)?.closest?.("[data-cursor]") as HTMLElement | null;
      const text = target?.dataset["cursor"] ?? "";
      if (text === current) return;
      current = text;

      if (text) {
        l.textContent = text;
        // Longer labels need a bigger ring or they crowd the edge.
        const size = Math.min(MAX_LABELLED, Math.max(MIN_LABELLED, 76 + text.length * 3.2));
        gsap.to(r, { width: size, height: size, duration: 0.4, ease: "expo.out" });
        gsap.to(l, { opacity: 1, duration: 0.3 });
        gsap.to(d, { scale: 0, duration: 0.3 });
      } else {
        gsap.to(r, { width: BASE, height: BASE, duration: 0.4, ease: "expo.out" });
        gsap.to(l, { opacity: 0, duration: 0.2 });
        gsap.to(d, { scale: 1, duration: 0.3 });
      }
    };

    const leave = () => gsap.to([d, r], { opacity: 0, duration: 0.2 });

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
      html.classList.remove("has-custom-cursor");
      gsap.killTweensOf([d, r, l]);
    };
  }, [touch, reduced]);

  if (touch || reduced) return null;

  return (
    <div
      aria-hidden
      className="site-chrome pointer-events-none fixed inset-0 z-[70] hidden md:block"
    >
      <div ref={dot} className="fixed left-0 top-0 size-1.5 rounded-full bg-foreground" />
      <div
        ref={ring}
        className="fixed left-0 top-0 flex size-[26px] items-center justify-center rounded-full border border-primary/70 backdrop-blur-[1px]"
      >
        <span ref={label} className="meta whitespace-nowrap text-[9px] text-primary opacity-0" />
      </div>
    </div>
  );
}
