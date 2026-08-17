import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion, EASE } from "@/lib/motion";
import { SectionLabel } from "./SectionLabel";
import { BEATS, REFLECTION } from "@/data/holiday";
import dubai1 from "@/assets/dubai_1.png";
import dubai2 from "@/assets/dubai_2.png";

/*
 * The two real photos we have — Burj Khalifa at dusk, the yacht in Dubai
 * Marina — carry the section's two pinned full-bleed moments. Everything
 * else in the story has no photo to draw from, so it's told through
 * typography alone rather than an invented image.
 */
const MOMENTS = [
  {
    n: "06",
    range: "Dubai Mall",
    lead: "Driving through the city, I was already overwhelmed by the architecture. Then we reached Dubai Mall — and I saw it in person for the first time.",
    word: "BURJ KHALIFA.",
    supporting: "I'd seen it in photos a hundred times. Standing there was nothing like that.",
    image: dubai1,
    alt: "Downtown Dubai at dusk, the Burj Khalifa lit above the skyline with the Burj Al Arab visible near the water",
    slow: false,
  },
  {
    n: "08",
    range: "Dubai Marina",
    lead: "Later, in Dubai Marina, we took a yacht out as the sun went down.",
    word: "THE YACHT",
    supporting: "Surrounded by towers on every side, the water felt impossibly calm.",
    image: dubai2,
    alt: "Dubai Marina in daylight, a yacht on the water near the Burj Al Arab and the marina's high-rise towers",
    slow: true,
  },
];

const STEP = 1;
const SCROLL_PER_UNIT = 100;

export function HolidaySection() {
  const root = useRef<HTMLElement>(null);

  // Non-pinned narrative beats: mask-title reveal + staggered line fade-up —
  // the same one-shot idiom JourneyTimeline.tsx uses for its chapters.
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-beat]").forEach((beat) => {
        const titleLines = beat.querySelectorAll<HTMLElement>("[data-beat-title]");
        const lines = beat.querySelectorAll<HTMLElement>("[data-beat-line]");
        if (titleLines.length) {
          gsap.fromTo(
            titleLines,
            { yPercent: 110, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 1,
              ease: EASE.out,
              stagger: 0.06,
              scrollTrigger: { trigger: beat, start: "top 82%" },
            },
          );
        }
        if (lines.length) {
          gsap.fromTo(
            lines,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: EASE.out,
              stagger: 0.08,
              scrollTrigger: { trigger: beat, start: "top 78%" },
            },
          );
        }
      });

      // The road-back beat's environment-expanding moment: pure typography
      // scale, scrubbed to scroll — no photo exists for this beat, so the
      // type itself communicates the world getting bigger.
      const scaleLine = el.querySelector<HTMLElement>("[data-scale-line]");
      if (scaleLine) {
        gsap.fromTo(
          scaleLine,
          { scale: 0.8, opacity: 0.35 },
          {
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: scaleLine, start: "top 88%", end: "top 35%", scrub: true },
          },
        );
      }

      // The emotional peak — one-shot expo entrance, plus a slow continued
      // scrub scale for depth. No literal ant; the metaphor stays textual.
      const quote = el.querySelector<HTMLElement>("[data-quote]");
      if (quote) {
        gsap.fromTo(
          quote,
          { opacity: 0, scale: 0.92, y: 24 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.3,
            ease: EASE.out,
            scrollTrigger: { trigger: quote, start: "top 85%" },
          },
        );
        gsap.fromTo(
          quote,
          { scale: 1 },
          {
            scale: 1.05,
            ease: "none",
            scrollTrigger: { trigger: quote, start: "top 40%", end: "bottom top", scrub: true },
          },
        );
      }

      gsap.fromTo(
        "[data-reflection-close]",
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: EASE.softOut,
          scrollTrigger: { trigger: "[data-reflection-close]", start: "top 90%" },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  // The pin — two full-bleed photo moments, reusing the exact
  // multi-layer-in-one-pin mechanism ProjectsSection.tsx uses for its
  // project layers. Same trigger element and refreshPriority slot as before.
  useEffect(() => {
    const el = root.current;
    const pinEl = el?.querySelector<HTMLElement>("[data-pin]");
    if (!el || !pinEl || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const layers = gsap.utils.toArray<HTMLElement>("[data-moment]", pinEl);
      const total = layers.length * STEP;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinEl,
          start: "top top",
          end: `+=${Math.round(total * SCROLL_PER_UNIT)}%`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          refreshPriority: 2,
        },
      });

      layers.forEach((layer, i) => {
        const at = i * STEP;
        const isLast = i === layers.length - 1;
        const slow = layer.dataset["slow"] === "true";
        const img = layer.querySelector<HTMLElement>("[data-moment-img]");
        const lead = layer.querySelectorAll<HTMLElement>("[data-moment-lead]");
        const word = layer.querySelector<HTMLElement>("[data-moment-word]");
        const supporting = layer.querySelector<HTMLElement>("[data-moment-supporting]");

        if (i > 0) {
          tl.fromTo(layer, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: EASE.inOut }, at);
        }

        if (img) {
          tl.fromTo(
            img,
            { scale: slow ? 1.1 : 1.18 },
            { scale: 1, ease: "none", duration: STEP },
            at,
          );
        }
        if (lead.length) {
          tl.fromTo(
            lead,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: slow ? 0.3 : 0.2, ease: EASE.softOut, stagger: 0.08 },
            at + 0.1,
          );
        }
        if (word) {
          tl.fromTo(
            word,
            { opacity: 0, y: 30, scale: 0.94 },
            { opacity: 1, y: 0, scale: 1, duration: slow ? 0.35 : 0.22, ease: EASE.out },
            at + (slow ? 0.3 : 0.22),
          );
        }
        if (supporting) {
          tl.fromTo(
            supporting,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: slow ? 0.3 : 0.2, ease: EASE.softOut },
            at + (slow ? 0.55 : 0.42),
          );
        }

        if (!isLast) {
          tl.to(layer, { autoAlpha: 0, duration: 0.18, ease: EASE.inOut }, at + STEP - 0.18);
        }
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="holiday" className="relative py-28 md:py-40">
      <div className="px-5 md:px-10">
        <SectionLabel index="05" title="Holiday" />
        <p className="meta mt-6">My favourite holiday</p>
        <h2 className="display-lg mt-4 max-w-3xl">DUBAI.</h2>
      </div>

      <div className="mt-24 px-5 md:mt-32 md:px-10">
        {BEATS.map((beat, i) => (
          <div key={beat.title} data-beat className={i === 0 ? "" : "mt-24 md:mt-36"}>
            <p className="meta text-primary">{beat.range}</p>
            <h3 className="display-md mt-4 max-w-3xl">
              <span className="line-mask block">
                <span data-beat-title className="block">
                  {beat.title}
                </span>
              </span>
            </h3>
            <div className="mt-6 max-w-xl space-y-4 text-[15px] leading-relaxed text-foreground/80 md:text-base">
              {beat.scaleLine ? (
                <>
                  <p data-beat-line>{beat.lines[0]}</p>
                  <p
                    data-scale-line
                    className="display-lg py-4 text-foreground"
                    style={{ transformOrigin: "left center" }}
                  >
                    {beat.scaleLine}
                  </p>
                  <p data-beat-line>{beat.lines[1]}</p>
                </>
              ) : (
                beat.lines.map((l) => (
                  <p key={l} data-beat-line>
                    {l}
                  </p>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <div data-pin className="relative mt-28 h-svh w-full overflow-hidden md:mt-40">
        {MOMENTS.map((m) => (
          <div
            key={m.n}
            data-moment
            data-slow={m.slow ? "true" : undefined}
            className="invisible absolute inset-0 first:visible"
          >
            <img
              data-moment-img
              src={m.image}
              alt={m.alt}
              width={1920}
              height={1088}
              loading="lazy"
              className="absolute inset-0 size-full scale-[1.18] object-cover"
            />
            <div className="absolute inset-0 bg-background/55" />
            <div className="absolute inset-0 flex flex-col justify-center px-5 md:px-10">
              <p data-moment-lead className="meta">
                {m.range}
              </p>
              <p
                data-moment-lead
                className="mt-4 max-w-xl text-[15px] leading-relaxed text-foreground/85 md:text-base"
              >
                {m.lead}
              </p>
              <h3 data-moment-word className="display-xl mt-6 max-w-4xl">
                {m.word}
              </h3>
              <p
                data-moment-supporting
                className="mt-6 max-w-xl text-[15px] leading-relaxed text-foreground/85 md:text-base"
              >
                {m.supporting}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-28 px-5 md:mt-40 md:px-10">
        <p data-quote className="display-xl max-w-5xl text-primary">
          I FELT LIKE AN ANT AMONG GIANTS.
        </p>
      </div>

      <div className="mt-24 max-w-xl px-5 md:mt-36 md:px-10">
        <p className="meta text-primary">{REFLECTION.range}</p>
        <h3 className="display-md mt-4 max-w-3xl">
          <span className="line-mask block">
            <span data-beat-title className="block">
              {REFLECTION.title}
            </span>
          </span>
        </h3>
        <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-foreground/80 md:text-base">
          {REFLECTION.lines.map((l) => (
            <p key={l} data-beat-line>
              {l}
            </p>
          ))}
        </div>
        <p
          data-reflection-close
          className="meta mt-10 border-t border-primary/40 pt-6 text-primary"
        >
          Dubai was my first glimpse of a much bigger world.
        </p>
      </div>
    </section>
  );
}
