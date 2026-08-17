import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion, EASE } from "@/lib/motion";
import { SectionLabel } from "./SectionLabel";
import { Magnetic } from "./Magnetic";
import { CONTACT_LINKS, EMAIL, displayValue, hrefFor } from "@/data/contact";

const HEADLINE_A = ["LET'S", "BUILD"];
const HEADLINE_B = ["SOMETHING."];

export function CTASection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // The amber bloom from the hero returns here, and nowhere else — the site
      // opens and closes under the same light.
      gsap.fromTo(
        "[data-cta-bloom]",
        { opacity: 0, scale: 0.85 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.8,
          ease: EASE.out,
          scrollTrigger: { trigger: el, start: "top 75%" },
        },
      );

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 70%" },
      });

      tl.fromTo(
        "[data-cta-word]",
        { yPercent: 115, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.3, ease: EASE.out, stagger: 0.08 },
      )
        .fromTo(
          "[data-cta-sub]",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.9, ease: EASE.out },
          "-=0.75",
        )
        // The button arrives only once the statement has landed.
        .fromTo(
          "[data-cta-action]",
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.9, ease: EASE.out },
          "-=0.6",
        )
        .fromTo(
          "[data-cta-row]",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.8, ease: EASE.out, stagger: 0.07 },
          "-=0.65",
        );

      // A slow lift as the section passes — the typography keeps moving with
      // the scroll rather than sitting still once revealed.
      gsap.fromTo(
        "[data-cta-head]",
        { yPercent: 6 },
        {
          yPercent: -6,
          ease: EASE.none,
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="contact"
      className="relative overflow-hidden px-5 py-28 md:px-10 md:py-40"
    >
      <div
        aria-hidden
        data-cta-bloom
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[70vh] w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 16%, transparent), transparent)",
        }}
      />

      <SectionLabel index="09" title="Let's Build" />

      <div data-cta-head className="mt-14">
        <h2 className="display-xl">
          <span className="line-mask">
            <span className="block">
              {HEADLINE_A.map((word) => (
                <span key={word} data-cta-word className="mr-[0.2em] inline-block">
                  {word}
                </span>
              ))}
            </span>
          </span>
          <span className="line-mask">
            <span className="block text-muted-foreground">
              {HEADLINE_B.map((word) => (
                <span key={word} data-cta-word className="inline-block">
                  {word}
                </span>
              ))}
            </span>
          </span>
        </h2>

        <p
          data-cta-sub
          className="mt-10 max-w-lg text-[15px] leading-relaxed text-muted-foreground md:text-base"
        >
          I&apos;m open to projects, collaborations and the kind of ideas that sound slightly too
          ambitious at first. If you have one, I&apos;d like to hear it.
        </p>
      </div>

      <div data-cta-action className="mt-14">
        {EMAIL ? (
          <Magnetic strength={0.4}>
            <a
              href={`mailto:${EMAIL}`}
              data-cursor="LET'S TALK"
              className="group relative inline-flex min-h-11 items-center gap-4 overflow-hidden border border-hairline px-8 py-5 transition-colors duration-500 hover:border-primary"
            >
              <span
                aria-hidden
                className="absolute inset-0 origin-bottom scale-y-0 bg-primary transition-transform duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100"
              />
              <span className="meta relative z-10 text-foreground transition-colors duration-500 group-hover:text-primary-foreground">
                Let&apos;s talk
              </span>
              <span
                aria-hidden
                className="relative z-10 translate-x-0 text-foreground transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-1.5 group-hover:text-primary-foreground"
              >
                →
              </span>
            </a>
          </Magnetic>
        ) : (
          <div className="inline-flex flex-col gap-3">
            <span className="inline-flex min-h-11 items-center gap-4 border border-dashed border-hairline px-8 py-5">
              <span className="meta text-muted-foreground">Let&apos;s talk</span>
              <span aria-hidden className="text-muted-foreground">
                →
              </span>
            </span>
            <span className="meta text-primary/70">
              [add your email in src/data/contact.ts to activate]
            </span>
          </div>
        )}
      </div>

      <ul className="mt-24 border-t border-hairline">
        {CONTACT_LINKS.map((link) => {
          const href = hrefFor(link);
          return (
            <li key={link.key} data-cta-row className="border-b border-hairline">
              {href ? (
                <a
                  href={href}
                  {...(link.href === "" ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                  data-cursor="OPEN"
                  className="group flex min-h-11 items-baseline gap-6 py-7 transition-colors hover:text-primary"
                >
                  <span className="meta w-24 shrink-0 text-primary">{link.label}</span>
                  <span className="flex-1 font-display text-lg">{displayValue(link)}</span>
                  <span
                    aria-hidden
                    className="text-muted-foreground transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-1"
                  >
                    ↗
                  </span>
                </a>
              ) : (
                <div className="flex items-baseline gap-6 py-7">
                  <span className="meta w-24 shrink-0">{link.label}</span>
                  <span className="flex-1 font-display text-lg text-muted-foreground/60">
                    {displayValue(link)}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
