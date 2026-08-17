import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { SectionLabel } from "./SectionLabel";

const GOALS = [
  ["BUILD", "Products people actually keep open."],
  ["LEARN", "Deeper systems, better fundamentals, real craft."],
  ["CREATE", "Work that looks like it came from a person."],
  ["TRAVEL", "See more places than my browser tabs."],
  ["EXPLORE AI", "Use it as an instrument, not a shortcut."],
];

export function FutureSection() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const t = track.current;
    if (!el || !t || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      if (isDesktop) {
        gsap.to(t, {
          x: () => -(t.scrollWidth - window.innerWidth + 40),
          ease: "none",
          scrollTrigger: {
            trigger: "[data-hpin]",
            start: "top top",
            end: () => `+=${t.scrollWidth}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            // Explicit refresh order across the page's three pinned
            // sections — this one is lowest, so it's measured last.
            refreshPriority: 1,
          },
        });
      }
      gsap.fromTo(
        "[data-closer]",
        { opacity: 0, scale: 0.96 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-closer]", start: "top 80%" },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="future" className="py-28 md:py-40">
      <div className="px-5 md:px-10">
        <SectionLabel index="07" title="Next" />
        <h2 className="display-xl mt-14">WHAT&apos;S NEXT?</h2>
      </div>

      <div data-hpin className="mt-24 overflow-hidden md:mt-0 md:flex md:h-svh md:items-center">
        <div
          ref={track}
          className="flex flex-col gap-14 px-5 md:w-max md:flex-row md:items-end md:gap-24 md:px-10"
        >
          {GOALS.map(([word, note], i) => (
            <div key={word} className="md:w-[42vw] md:shrink-0">
              <p className="meta">0{i + 1}</p>
              <h3 className="display-lg mt-3" style={{ fontSize: "clamp(2.6rem, 8.8vw, 8.2rem)" }}>
                {word}
              </h3>
              <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
                {note}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pt-28 md:px-10 md:pt-40">
        <p data-closer className="display-lg max-w-4xl text-primary">
          THE BEST PART HASN&apos;T STARTED YET.
        </p>
      </div>
    </section>
  );
}
