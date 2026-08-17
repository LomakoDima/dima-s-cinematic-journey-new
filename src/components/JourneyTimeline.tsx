import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion, EASE } from "@/lib/motion";
import { SectionLabel } from "./SectionLabel";
import { CHAPTERS } from "@/data/journey";

const THIRTY_COUNT = 7;

export function JourneyTimeline() {
  const root = useRef<HTMLElement>(null);
  const line = useRef<HTMLDivElement>(null);

  // The line draw, per-chapter entrances, and the current-chapter dim/bright
  // scrub. No new pin — the page already has three; this reuses the same
  // scrub pattern already used in Gallery.tsx / PersonalitySection.tsx.
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        line.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top",
          scrollTrigger: { trigger: el, start: "top 65%", end: "bottom 85%", scrub: 0.4 },
        },
      );

      gsap.utils.toArray<HTMLElement>("[data-chapter]").forEach((ch) => {
        const titleLines = ch.querySelectorAll<HTMLElement>("[data-chapter-title-line]");
        const lines = ch.querySelectorAll<HTMLElement>("[data-chapter-line]");
        const dot = ch.querySelector<HTMLElement>("[data-chapter-dot]");

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
              scrollTrigger: { trigger: ch, start: "top 82%" },
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
              scrollTrigger: { trigger: ch, start: "top 78%" },
            },
          );
        }
        if (dot) {
          gsap.fromTo(
            dot,
            { scale: 0 },
            {
              scale: 1,
              duration: 0.4,
              ease: EASE.out,
              scrollTrigger: { trigger: ch, start: "top 75%" },
            },
          );
        }

        // Current chapter brightens, previous ones stay dim.
        gsap.fromTo(
          ch,
          { opacity: 0.35 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: ch, start: "top 75%", end: "top 40%", scrub: true },
          },
        );
        gsap.to(ch, {
          opacity: 0.4,
          ease: "none",
          scrollTrigger: { trigger: ch, start: "bottom 55%", end: "bottom 15%", scrub: true },
        });
      });

      gsap.fromTo(
        "[data-journey-next]",
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          ease: EASE.softOut,
          scrollTrigger: { trigger: "[data-journey-next]", start: "top 92%" },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  // The visual climax — chapter 06 only. A one-shot sequence, not a scrub:
  // this is meant to be watched once, like the rest of the site's one-shot
  // entrances (CTA headline, milestone reveals), not tied to scroll position.
  useEffect(() => {
    const el = root.current;
    const block = el?.querySelector<HTMLElement>("[data-hand-block]");
    if (!el || !block) return;

    const thirty = gsap.utils.toArray<HTMLElement>("[data-hand-thirty]", block);
    const oneEl = block.querySelector<HTMLElement>("[data-hand-one]");
    const meEl = block.querySelector<HTMLElement>("[data-hand-me]");
    const outro = block.querySelector<HTMLElement>("[data-hand-outro]");

    if (prefersReducedMotion()) {
      gsap.set(thirty, { opacity: 0.35 });
      gsap.set([oneEl, meEl], { opacity: 1, scale: 1 });
      gsap.set(outro, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(outro, { opacity: 0, y: 14 });

      const tl = gsap.timeline({ scrollTrigger: { trigger: block, start: "top 70%" } });
      tl.to(thirty, {
        opacity: 0,
        y: -14,
        scale: 0.85,
        stagger: 0.045,
        duration: 0.5,
        ease: EASE.in,
      })
        .fromTo(
          oneEl,
          { opacity: 0, scale: 0.7 },
          { opacity: 1, scale: 1, duration: 0.7, ease: EASE.out },
          "-=0.25",
        )
        .to({}, { duration: 0.35 })
        .to(oneEl, { opacity: 0, y: -20, duration: 0.4, ease: EASE.in })
        .fromTo(
          meEl,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.7, ease: EASE.out },
          "<0.1",
        )
        .to(outro, { opacity: 1, y: 0, duration: 0.8, ease: EASE.out }, "-=0.2");
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="journey" className="px-5 py-28 md:px-10 md:py-40">
      <SectionLabel index="03" title="Journey" />
      <h2 className="display-lg mt-14 max-w-3xl">HOW I GOT HERE.</h2>

      <div className="relative mt-20 pl-8 md:pl-0">
        <div className="absolute left-0 top-0 h-full w-px bg-hairline md:left-[22%]" />
        <div
          ref={line}
          className="absolute left-0 top-0 h-full w-px origin-top bg-primary md:left-[22%]"
        />

        <ol className="space-y-20 md:space-y-28">
          {CHAPTERS.map((c) => (
            <li key={c.n} data-chapter className="relative md:grid md:grid-cols-12 md:gap-10">
              <span
                aria-hidden
                data-chapter-dot
                className="absolute -left-8 top-2 size-1.5 scale-0 rounded-full bg-primary md:left-[calc(22%-3px)] md:-translate-x-[22%]"
              />
              <div className="md:col-span-3">
                <p className="font-display text-3xl text-primary md:text-4xl">{c.n}</p>
                <p className="meta mt-2">{c.range}</p>
              </div>

              <div className="mt-4 md:col-span-8 md:col-start-5 md:mt-0">
                <h3 className="display-md">
                  <span className="line-mask block">
                    <span data-chapter-title-line className="block">
                      {c.title}
                    </span>
                  </span>
                </h3>

                {c.climax ? (
                  <div data-hand-block className="mt-6">
                    <p data-chapter-line className="meta">
                      {c.climax.caption}
                    </p>
                    <p
                      data-chapter-line
                      className="mt-3 max-w-xl font-display text-xl italic text-foreground/90 md:text-2xl"
                    >
                      &ldquo;{c.climax.quote}&rdquo;
                    </p>

                    <div className="relative mt-10 min-h-[7rem] md:min-h-[9rem]">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {Array.from({ length: THIRTY_COUNT }).map((_, i) => (
                          <span
                            key={i}
                            data-hand-thirty
                            className={`font-display text-2xl text-muted-foreground/40 md:text-3xl ${
                              i >= 5 ? "hidden sm:inline-block" : ""
                            }`}
                          >
                            30
                          </span>
                        ))}
                      </div>
                      <span
                        data-hand-one
                        className="display-lg absolute left-0 top-0 opacity-0 text-primary"
                      >
                        01
                      </span>
                      <span data-hand-me className="display-lg absolute left-0 top-0 opacity-0">
                        ME.
                      </span>
                    </div>

                    <p
                      data-hand-outro
                      className="mt-8 max-w-md text-[15px] leading-relaxed text-muted-foreground md:text-base"
                    >
                      {c.climax.outro}
                    </p>

                    {c.lines.map((l, i) => (
                      <p
                        key={i}
                        data-chapter-line
                        className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground"
                      >
                        {l}
                      </p>
                    ))}
                  </div>
                ) : (
                  <>
                    {c.lines.map((l, i) => (
                      <p
                        key={i}
                        data-chapter-line
                        className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground first:mt-6"
                      >
                        {l}
                      </p>
                    ))}
                    {c.note ? (
                      <p
                        data-chapter-line
                        className="mt-5 max-w-xl border-l-2 border-primary/40 pl-4 text-[15px] leading-relaxed text-foreground/80"
                      >
                        {c.note}
                      </p>
                    ) : null}
                  </>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div
          data-journey-next
          className="mt-24 flex items-center gap-3 pl-8 opacity-0 md:pl-[calc(22%+2.5rem)]"
        >
          <span aria-hidden className="h-px w-8 bg-primary/50" />
          <span className="meta text-primary">Selected Work →</span>
        </div>
      </div>
    </section>
  );
}
