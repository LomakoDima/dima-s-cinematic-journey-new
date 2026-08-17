import { useEffect, useRef } from "react";
import { gsap, EASE, MEDIA } from "@/lib/motion";
import { SectionLabel } from "./SectionLabel";
import { PROJECTS, isRealLink } from "@/data/projects";

/*
 * Scroll choreography, in timeline units. One unit = one project.
 *
 * i+0.00 ─ incoming plate wipes up (skipped for the first project)
 * i+0.10 ─ typography arrives, line by line
 * i+0.35 ═ HELD — only the slow plate drift moves ═ i+0.82
 * i+0.82 ─ typography leaves
 * i+0.96 ─ plate recedes, under the next project's wipe
 *
 * Roughly half of every beat is a completely still frame, which is why this
 * needs no scroll snapping: stopping anywhere usually lands on a composition.
 */
const STEP = 1;
const ENTER = 0.2;
const META_LEAD = 0.1;
const META_IN = 0.16;
const META_STAGGER = 0.03;
const META_OUT_AT = 0.82;
const META_OUT = 0.12;
const EXIT_AT = 0.96;
const EXIT = 0.18;
const TAIL = 0.25;
/** Viewport heights of scroll per project. 85 keeps the pin from overstaying. */
const SCROLL_PER_UNIT = 85;

export function ProjectsSection() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const stageEl = stage.current;
    if (!el || !stageEl || !PROJECTS.length) return;

    // matchMedia IS a gsap.context with a query attached — same revert contract,
    // but it also tears the pin down cleanly when the breakpoint changes.
    const mm = gsap.matchMedia(el);

    mm.add(
      {
        pinned: `${MEDIA.desktop} and ${MEDIA.motionOk}`,
        flow: `${MEDIA.mobile} and ${MEDIA.motionOk}`,
      },
      (self) => {
        const layers = gsap.utils.toArray<HTMLElement>("[data-work-layer]");
        if (!layers.length) return;
        const count = layers.length;

        if (self.conditions?.["pinned"] === true) {
          const total = count * STEP + TAIL;
          const counterEl = el.querySelector<HTMLElement>("[data-work-counter]");
          let shown = "";

          const tl = gsap.timeline({
            defaults: { ease: EASE.none },
            scrollTrigger: {
              trigger: stageEl,
              start: "top top",
              end: `+=${Math.round(total * SCROLL_PER_UNIT)}%`,
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
              // Explicit refresh order across the page's three pinned
              // sections — this one is topmost, so it's measured first.
              refreshPriority: 3,
              onUpdate: (trigger) => {
                if (!counterEl) return;
                const i = Math.min(count, Math.floor(trigger.progress * total) + 1);
                const next = String(i).padStart(2, "0");
                // Only touch the DOM when the number actually changes.
                if (next !== shown) {
                  shown = next;
                  counterEl.textContent = next;
                }
              },
            },
          });

          layers.forEach((layer, i) => {
            const at = i * STEP;
            const isLast = i === count - 1;
            const frame = layer.querySelector<HTMLElement>("[data-work-frame]");
            const img = layer.querySelector<HTMLElement>("[data-work-img]");
            const lines = layer.querySelectorAll<HTMLElement>("[data-work-line]");

            // 1 — arrival. The first project is already on screen when the pin latches.
            if (i > 0 && frame) {
              tl.fromTo(
                frame,
                { clipPath: "inset(100% 0% 0% 0%)" },
                { clipPath: "inset(0% 0% 0% 0%)", duration: ENTER, ease: EASE.inOut },
                at,
              );
            }

            // 2 — the plate drifts for its whole tenure. Never drops below 1.08:
            // object-cover at scale S gives (S-1)/2 bleed per edge, and the plate
            // travels 3%, so anything tighter exposes an empty strip.
            if (img) {
              tl.fromTo(
                img,
                { scale: 1.16, yPercent: i === 0 ? 0 : -3 },
                { scale: 1.08, yPercent: 3, duration: isLast ? STEP : EXIT_AT + EXIT },
                at,
              );
            }

            // 3 — typography arrives after its plate.
            if (lines.length) {
              tl.fromTo(
                lines,
                { yPercent: 110, autoAlpha: 0 },
                {
                  yPercent: 0,
                  autoAlpha: 1,
                  duration: META_IN,
                  stagger: META_STAGGER,
                  ease: EASE.softOut,
                },
                at + META_LEAD,
              );
            }

            if (isLast) return;

            // 4 — typography leaves before its plate.
            if (lines.length) {
              tl.to(
                lines,
                {
                  yPercent: -110,
                  autoAlpha: 0,
                  duration: META_OUT,
                  stagger: META_STAGGER * 0.7,
                  ease: EASE.in,
                },
                at + META_OUT_AT,
              );
            }

            // 5 — plate recedes, overlapping the next project's wipe.
            tl.to(
              layer,
              {
                yPercent: -8,
                scale: 0.96,
                rotate: -0.6,
                autoAlpha: 0,
                duration: EXIT,
                ease: EASE.inOut,
              },
              at + EXIT_AT,
            );
          });

          const progressEl = el.querySelector<HTMLElement>("[data-work-progress]");
          if (progressEl) {
            tl.fromTo(progressEl, { scaleX: 0 }, { scaleX: 1, duration: total }, 0);
          }

          // Extend past the last tween so the pin holds for a beat before release.
          tl.to({}, { duration: TAIL }, count * STEP);
        }

        if (self.conditions?.["flow"] === true) {
          // Mobile: no pin. Built from the same two primitives the Gallery uses,
          // so it reads as a sibling of that section rather than a cut-down pin.
          layers.forEach((layer) => {
            const lines = layer.querySelectorAll<HTMLElement>("[data-work-line]");
            const img = layer.querySelector<HTMLElement>("[data-work-img]");

            if (lines.length) {
              gsap.fromTo(
                lines,
                { yPercent: 60, autoAlpha: 0 },
                {
                  yPercent: 0,
                  autoAlpha: 1,
                  duration: 0.9,
                  ease: EASE.out,
                  stagger: 0.06,
                  scrollTrigger: { trigger: layer, start: "top 78%" },
                },
              );
            }

            if (img) {
              gsap.fromTo(
                img,
                { yPercent: -4, scale: 1.16 },
                {
                  yPercent: 4,
                  scale: 1.16,
                  ease: EASE.none,
                  scrollTrigger: {
                    trigger: layer,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                  },
                },
              );
            }
          });
        }
      },
    );

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section ref={root} id="work" className="relative py-28 md:py-40">
      <div className="px-5 md:px-10">
        <SectionLabel index="04" title="Selected Work" />
        <h2 className="display-lg mt-14 max-w-3xl">SELECTED WORK.</h2>
      </div>

      <div
        ref={stage}
        data-work-stage
        className="relative mt-20 bg-background md:mt-28 md:h-svh md:overflow-hidden"
      >
        {PROJECTS.map((p, i) => {
          const url = p.url;
          // links is a Record, so a known key still needs bracket access under
          // noPropertyAccessFromIndexSignature.
          const githubRaw = p.links["github"];
          const github = isRealLink(githubRaw) ? githubRaw : null;
          const hasAnyLink = Boolean(url || github);

          return (
            <article
              key={p.n}
              data-work-layer
              className={`relative md:absolute md:inset-0 ${i === 0 ? "" : "mt-24 md:mt-0"}`}
            >
              {/* Plane 1 — the mask. clip-path only, never transformed.
                  Not focusable: the real link lives in the metadata below, so
                  there is exactly one tab stop and no duplicate destination. */}
              <div
                data-work-frame
                data-cursor={hasAnyLink ? "OPEN" : "VIEW"}
                className="group/frame relative block aspect-[16/10] w-full overflow-hidden md:absolute md:inset-0 md:aspect-auto md:size-full"
              >
                <div
                  data-work-zoom
                  className="size-full transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover/frame:scale-[1.04] group-focus-visible/frame:scale-[1.04]"
                >
                  {p.video ? (
                    <video
                      data-work-img
                      src={p.video}
                      poster={p.image}
                      muted
                      loop
                      playsInline
                      autoPlay
                      className="size-full scale-[1.16] object-cover"
                    />
                  ) : (
                    <img
                      data-work-img
                      src={p.image}
                      alt={p.alt}
                      width={p.width}
                      height={p.height}
                      // All layers are stacked, so every image enters the viewport
                      // at once — lazy-loading the first one would blank the pin.
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      className="size-full scale-[1.16] object-cover"
                    />
                  )}
                </div>
                <div aria-hidden className="absolute inset-0 bg-background/30" />
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/60 to-transparent"
                />
              </div>

              {/* Plane 2 — typography. */}
              <div
                data-work-meta
                className="relative mt-6 px-5 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] md:absolute md:inset-x-0 md:bottom-0 md:mt-0 md:px-10 md:pb-[12vh]"
              >
                <span className="line-mask">
                  <span data-work-line className="meta block text-primary">
                    Project {p.n}
                  </span>
                </span>

                <h3 className="display-md mt-4 max-w-3xl">
                  <span className="line-mask">
                    <span data-work-line className="block">
                      {p.title}
                    </span>
                  </span>
                </h3>

                <span className="line-mask mt-5 block max-w-xl">
                  <span
                    data-work-line
                    className="block text-[15px] leading-relaxed text-foreground/75"
                  >
                    {p.description}
                  </span>
                </span>

                <span className="line-mask mt-7 block border-t border-hairline pt-4">
                  <span
                    data-work-line
                    className="meta flex flex-wrap items-baseline gap-x-3 gap-y-1"
                  >
                    <span>{p.year}</span>
                    <span aria-hidden className="text-hairline">
                      /
                    </span>
                    <span>{p.category}</span>
                    <span aria-hidden className="text-hairline">
                      /
                    </span>
                    <span className="text-foreground/70">{p.tech.join(" · ")}</span>
                  </span>
                </span>

                {hasAnyLink ? (
                  <span className="line-mask mt-5 block">
                    <span data-work-line className="flex flex-wrap items-center gap-x-6 gap-y-2">
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer noopener"
                          data-cursor="OPEN"
                          className="meta inline-flex min-h-11 items-center text-foreground transition-colors hover:text-primary"
                        >
                          View project ↗
                        </a>
                      ) : null}
                      {github ? (
                        <a
                          href={github}
                          target="_blank"
                          rel="noreferrer noopener"
                          data-cursor="OPEN"
                          className="meta inline-flex min-h-11 items-center text-foreground transition-colors hover:text-primary"
                        >
                          GitHub ↗
                        </a>
                      ) : null}
                    </span>
                  </span>
                ) : null}
              </div>
            </article>
          );
        })}

        {/* Plane 3 — chrome that persists across the whole pin. */}
        <div
          data-work-chrome
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden items-center gap-5 px-10 pb-8 md:flex"
        >
          <span className="meta shrink-0">
            <span data-work-counter>01</span> — {String(PROJECTS.length).padStart(2, "0")}
          </span>
          <span className="block h-px flex-1 bg-hairline">
            <span data-work-progress className="block h-px origin-left bg-primary" />
          </span>
        </div>
      </div>
    </section>
  );
}
