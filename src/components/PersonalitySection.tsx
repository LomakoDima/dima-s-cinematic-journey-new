import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion, useIsTouch, EASE } from "@/lib/motion";
import { SectionLabel } from "./SectionLabel";

type Trait = { n: string; title: string; description: string };

const TRAITS: Trait[] = [
  {
    n: "01",
    title: "CURIOUS",
    description:
      "I tend to ask how something works before deciding what to do with it. That's what pulled me into games, then Minecraft's systems, then programming, then the web.",
  },
  {
    n: "02",
    title: "CREATIVE",
    description:
      "I don't just want something to work — I care how it looks, feels and communicates. That's how I ended up caring as much about interfaces as about code.",
  },
  {
    n: "03",
    title: "PERSISTENT",
    description:
      "My path has plenty of abandoned attempts — a Minecraft mod that never ran, an Unreal Engine project that kept crashing, ideas that got too big for one person. Persistent just means I kept coming back.",
  },
  {
    n: "04",
    title: "EXPERIMENTAL",
    description:
      "I learn by changing things — a different color, a different layout, a different engine. A lot of what I know exists because I wanted to see what happens if I try it.",
  },
  {
    n: "05",
    title: "BUILDER",
    description:
      "Watching tutorials is easy. Shipping something is not. Somewhere between copying code from YouTube and a teacher asking who could build a website, I became someone who actually finishes things — not always, but more often than before.",
  },
];

export function PersonalitySection() {
  const root = useRef<HTMLElement>(null);
  const touch = useIsTouch();

  // Entrance: the same blur/opacity/x scrub-in the site already uses, reused
  // against the richer row markup below.
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-trait]").forEach((row, i) => {
        gsap.fromTo(
          row,
          { opacity: 0.08, xPercent: i % 2 === 0 ? -4 : 4, filter: "blur(6px)" },
          {
            opacity: 1,
            xPercent: 0,
            filter: "blur(0px)",
            ease: "power2.out",
            scrollTrigger: { trigger: row, start: "top 88%", end: "top 45%", scrub: true },
          },
        );
      });
    }, el);
    return () => ctx.revert();
  }, []);

  // Hover interaction — capable desktop devices only. Descriptions are
  // visible by default in the DOM (see JSX below); this is the only place
  // that ever collapses them, so touch/no-JS/reduced-motion always see the
  // full text with no interaction required.
  useEffect(() => {
    const el = root.current;
    if (!el || touch || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-trait]");
      const descs = rows.map((row) => row.querySelector<HTMLElement>("[data-trait-desc]"));
      gsap.set(
        descs.filter((d): d is HTMLElement => !!d),
        { height: 0, overflow: "hidden" },
      );

      const cleanups: Array<() => void> = [];

      rows.forEach((row, i) => {
        const title = row.querySelector<HTMLElement>("[data-trait-title]");
        const desc = descs[i];
        const mark = row.querySelector<HTMLElement>("[data-trait-mark]");
        const divider = row.querySelector<HTMLElement>("[data-trait-divider]");
        const others = rows.filter((_, j) => j !== i);
        const titleX = title ? gsap.quickTo(title, "x", { duration: 0.5, ease: "power3" }) : null;

        const onEnter = () => {
          row.setAttribute("data-cursor", "READ");
          gsap.to(others, { opacity: 0.4, duration: 0.5, ease: EASE.softOut });
          if (mark) gsap.to(mark, { scaleY: 1, duration: 0.4, ease: EASE.out });
          if (divider) gsap.to(divider, { scaleX: 1, duration: 0.5, ease: EASE.out });
          if (desc) gsap.to(desc, { height: "auto", duration: 0.6, ease: EASE.softOut });

          if (i === 3 && title) {
            // EXPERIMENTAL — one controlled skew pulse, not continuous.
            gsap.fromTo(
              title,
              { skewX: 0 },
              { skewX: -3, duration: 0.16, ease: "power2.out", yoyo: true, repeat: 1 },
            );
          } else if (i === 4) {
            // BUILDER — the strongest reaction, still just scale.
            gsap.to(row, { scale: 1.012, duration: 0.6, ease: EASE.softOut });
          }
        };

        const onMove = (e: PointerEvent) => {
          // CURIOUS — the word leans a few px toward the cursor's x position.
          if (i !== 0 || !titleX) return;
          const b = row.getBoundingClientRect();
          const rel = (e.clientX - (b.left + b.width / 2)) / (b.width / 2);
          titleX(gsap.utils.clamp(-16, 16, rel * 16));
        };

        const onLeave = () => {
          row.removeAttribute("data-cursor");
          gsap.to(others, { opacity: 1, duration: 0.5, ease: EASE.softOut });
          if (mark) gsap.to(mark, { scaleY: 0, duration: 0.3, ease: EASE.inOut });
          if (divider) gsap.to(divider, { scaleX: 0, duration: 0.3, ease: EASE.inOut });
          if (desc) gsap.to(desc, { height: 0, duration: 0.45, ease: EASE.inOut });
          titleX?.(0);
          if (i === 4) gsap.to(row, { scale: 1, duration: 0.4, ease: EASE.inOut });
        };

        row.addEventListener("pointerenter", onEnter);
        row.addEventListener("pointermove", onMove);
        row.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          row.removeEventListener("pointerenter", onEnter);
          row.removeEventListener("pointermove", onMove);
          row.removeEventListener("pointerleave", onLeave);
        });
      });

      return () => cleanups.forEach((fn) => fn());
    }, el);

    return () => ctx.revert();
  }, [touch]);

  return (
    <section ref={root} id="personality" className="px-5 py-28 md:px-10 md:py-40">
      <SectionLabel index="02" title="Personality" />

      <ol className="mt-16">
        {TRAITS.map((t, i) => (
          <li
            key={t.n}
            data-trait
            className={`relative border-b pb-6 pt-6 first:pt-0 md:pb-8 md:pt-8 ${
              i === 2 ? "border-dashed border-hairline/70" : "border-hairline"
            }`}
            style={{ paddingLeft: `${i * 3}%` }}
          >
            <span
              aria-hidden
              data-trait-mark
              className="absolute -left-4 top-1 h-5 w-px origin-bottom scale-y-0 bg-primary md:-left-6"
            />
            <div className="flex items-baseline gap-4 md:gap-8">
              <span className="meta hidden shrink-0 md:inline">{t.n}</span>
              <span
                data-trait-title
                className={`display-lg inline-block ${i % 2 ? "text-muted-foreground" : ""}`}
              >
                {t.title}
              </span>
            </div>
            <div
              data-trait-desc
              className="max-w-xl text-[15px] leading-relaxed text-muted-foreground md:pl-16 md:text-base"
            >
              <p className="pt-4">{t.description}</p>
            </div>
            <span
              aria-hidden
              data-trait-divider
              className="pointer-events-none absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-primary"
            />
          </li>
        ))}
      </ol>

      <div className="mt-16 grid gap-8 md:grid-cols-12">
        <p className="meta md:col-span-3">Appearance</p>
        <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground md:col-span-9 md:text-base">
          Short light-blond hair, blue eyes, fair skin, and a fairly simple style. I usually look
          calm and approachable — probably more relaxed than I actually am.
        </p>
      </div>
    </section>
  );
}
