import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { SectionLabel } from "./SectionLabel";
import g1 from "@/assets/programming.png";
import g2 from "@/assets/mountains.png";
import g3 from "@/assets/cat.png";
import g4 from "@/assets/bicycle.png";

const SHOTS = [
  {
    src: g1,
    n: "01",
    title: "LATE WORK",
    desc: "Long nights, glowing screens, and ideas slowly turning into something real.",
    w: 1200,
    h: 1500,
    cls: "md:col-span-5 md:col-start-1 aspect-[4/5]",
    depth: 0.5,
  },
  {
    src: g2,
    n: "02",
    title: "MOUNTAINS",
    desc: "A place to slow down, breathe deeper, and remember how small the world can make you feel.",
    w: 1500,
    h: 1000,
    cls: "md:col-span-6 md:col-start-7 md:mt-40 aspect-[3/2]",
    depth: 1,
  },
  {
    src: g3,
    n: "03",
    title: "LIFE",
    desc: "Somewhere between the projects and deadlines, there is always room for a little chaos.",
    w: 1100,
    h: 1400,
    cls: "md:col-span-4 md:col-start-3 md:-mt-24 aspect-[4/5]",
    depth: 0.7,
  },
  {
    src: g4,
    n: "04",
    title: "MOTION",
    desc: "A bike ride, an open road, and a little time away from the screen.",
    w: 1500,
    h: 1000,
    cls: "md:col-span-5 md:col-start-8 md:mt-16 aspect-[3/2]",
    depth: 1.2,
  },
];

export function Gallery() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-shot]").forEach((fig) => {
        const depth = Number(fig.dataset["depth"] ?? 1);
        gsap.fromTo(
          fig,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: { trigger: fig, start: "top 88%" },
          },
        );
        gsap.fromTo(
          fig.querySelector("img"),
          { yPercent: -6 * depth },
          {
            yPercent: 6 * depth,
            ease: "none",
            scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="gallery" className="px-5 py-28 md:px-10 md:py-40">
      <SectionLabel index="06" title="Gallery" />
      <h2 className="display-lg mt-14 max-w-3xl">FRAMES I KEPT.</h2>

      <div className="mt-20 grid gap-14 md:grid-cols-12 md:gap-x-8 md:gap-y-0">
        {SHOTS.map((s) => (
          <figure
            key={s.n}
            data-shot
            data-depth={s.depth}
            data-cursor="VIEW"
            tabIndex={0}
            className={`group relative ${s.cls}`}
          >
            <div className="h-full overflow-hidden">
              <img
                src={s.src}
                alt={`${s.title} — ${s.desc}`}
                width={s.w}
                height={s.h}
                loading="lazy"
                className="size-full scale-[1.06] object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.12] group-focus-visible:scale-[1.12]"
              />
            </div>
            <figcaption className="mt-4 flex items-baseline justify-between gap-4">
              <span className="meta text-primary">
                {s.n} / {s.title}
              </span>
              {/* Always at least dimly visible so the caption isn't hover-locked on touch
                  devices — brightens on hover/focus for pointer users. */}
              <span className="max-w-[55%] text-right text-xs leading-snug text-muted-foreground opacity-70 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 md:opacity-40">
                {s.desc}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
