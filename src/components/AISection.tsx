import { useEffect } from "react";
import { gsap, prefersReducedMotion, useIsTouch, useReveal, EASE } from "@/lib/motion";
import { SectionLabel } from "./SectionLabel";

const TOOLS = [
  {
    n: "01",
    title: "LOVABLE",
    description:
      "Used early on for rapid prototyping — exploring the initial structure, UI ideas and visual directions before any real code existed.",
  },
  {
    n: "02",
    title: "CHATGPT",
    description:
      "Used for brainstorming, refining ideas, writing and improving the English copy, and talking through design decisions.",
  },
  {
    n: "03",
    title: "CLAUDE CODE",
    description:
      "Used for the actual development — implementing changes in the real codebase, building animations and interactions, and fixing what broke.",
  },
];

const HELPED = [
  {
    n: "01",
    title: "IDEAS",
    desc: "Brainstorming directions and turning vague thoughts into something specific enough to build.",
  },
  {
    n: "02",
    title: "STRUCTURE",
    desc: "Working out how the website and its content should be organized.",
  },
  {
    n: "03",
    title: "DESIGN",
    desc: "Exploring visual direction and UI ideas before committing to one.",
  },
  {
    n: "04",
    title: "CODE",
    desc: "Implementing components, animations and interactions in the actual codebase.",
  },
  {
    n: "05",
    title: "REFINEMENT",
    desc: "Debugging, polishing wording, and tightening details after the first version worked.",
  },
];

const CHANGED = [
  "Which ideas actually fit the website, and which didn't",
  "Wording, until it sounded like me and not like a template",
  "English grammar and phrasing, line by line",
  "Generated content, adapted to what I actually experienced",
  "Layouts and visual concepts I didn't think worked",
  "Which animations and interactions actually belonged here",
];

const PROS = [
  "Faster brainstorming and prototyping",
  "Help getting unstuck on hard problems",
  "Easier to experiment with different directions",
  "Better English writing and communication",
  "A genuinely useful development partner",
];

const CONS = [
  "Gets things wrong, sometimes confidently",
  "Default suggestions can feel generic",
  "Doesn't know my real context unless I explain it",
  "Generated code still needs to be read and checked",
  "Easy to lean on it instead of thinking it through",
];

export function AISection() {
  const ref = useReveal<HTMLElement>();
  const touch = useIsTouch();

  // Part 02 / 03 / 04 — a single shared stagger-in per block, one-shot,
  // triggered on scroll. Deliberately not everything moves at once.
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-help-item]").forEach((item, i) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.05,
            ease: EASE.out,
            scrollTrigger: { trigger: "[data-help-block]", start: "top 78%" },
          },
        );
      });

      gsap.fromTo(
        "[data-changed-line]",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: EASE.out,
          stagger: 0.06,
          scrollTrigger: { trigger: "[data-changed-block]", start: "top 80%" },
        },
      );

      gsap.fromTo(
        "[data-proscons-line]",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: EASE.out,
          stagger: 0.06,
          scrollTrigger: { trigger: "[data-proscons-block]", start: "top 82%" },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  // Part 01 — the tools. Same mechanism PersonalitySection.tsx uses for its
  // trait rows: descriptions are visible by default (touch/reduced-motion/
  // no-JS always see full text); on capable desktop devices this effect
  // collapses them and expands on hover, with a sibling dim + accent mark.
  useEffect(() => {
    const el = ref.current;
    if (!el || touch || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-tool]");
      const descs = rows.map((row) => row.querySelector<HTMLElement>("[data-tool-desc]"));
      gsap.set(
        descs.filter((d): d is HTMLElement => !!d),
        { height: 0, overflow: "hidden" },
      );

      const cleanups: Array<() => void> = [];

      rows.forEach((row, i) => {
        const desc = descs[i];
        const mark = row.querySelector<HTMLElement>("[data-tool-mark]");
        const divider = row.querySelector<HTMLElement>("[data-tool-divider]");
        const others = rows.filter((_, j) => j !== i);

        const onEnter = () => {
          row.setAttribute("data-cursor", "READ");
          gsap.to(others, { opacity: 0.4, duration: 0.5, ease: EASE.softOut });
          if (mark) gsap.to(mark, { scaleY: 1, duration: 0.4, ease: EASE.out });
          if (divider) gsap.to(divider, { scaleX: 1, duration: 0.5, ease: EASE.out });
          if (desc) gsap.to(desc, { height: "auto", duration: 0.6, ease: EASE.softOut });
        };
        const onLeave = () => {
          row.removeAttribute("data-cursor");
          gsap.to(others, { opacity: 1, duration: 0.5, ease: EASE.softOut });
          if (mark) gsap.to(mark, { scaleY: 0, duration: 0.3, ease: EASE.inOut });
          if (divider) gsap.to(divider, { scaleX: 0, duration: 0.3, ease: EASE.inOut });
          if (desc) gsap.to(desc, { height: 0, duration: 0.45, ease: EASE.inOut });
        };

        row.addEventListener("pointerenter", onEnter);
        row.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          row.removeEventListener("pointerenter", onEnter);
          row.removeEventListener("pointerleave", onLeave);
        });
      });

      return () => cleanups.forEach((fn) => fn());
    }, el);

    return () => ctx.revert();
  }, [touch]);

  return (
    <section ref={ref} id="ai" className="px-5 py-28 md:px-10 md:py-40">
      <SectionLabel index="08" title="Human × AI" />

      <h2 className="display-lg mt-14 max-w-4xl">
        <span className="line-mask">
          <span className="block" data-reveal>
            HOW AI HELPED ME.
          </span>
        </span>
      </h2>
      <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
        AI became part of my workflow — not a replacement for it.
      </p>

      {/* 01 — THE TOOLS */}
      <div className="mt-24 md:mt-32">
        <div className="flex items-baseline gap-4">
          <span className="font-display text-3xl text-primary md:text-4xl">01</span>
          <span className="meta">The tools</span>
        </div>
        <p className="mt-4 max-w-md text-[15px] text-muted-foreground">
          Three tools. Different roles.
        </p>

        <ol className="mt-10">
          {TOOLS.map((t, i) => (
            <li
              key={t.n}
              data-tool
              className="relative border-b border-hairline pb-6 pt-6 first:pt-0 md:pb-8 md:pt-8"
            >
              <span
                aria-hidden
                data-tool-mark
                className="absolute -left-4 top-1 h-5 w-px origin-bottom scale-y-0 bg-primary md:-left-6"
              />
              <div className="flex items-baseline gap-4 md:gap-8">
                <span className="meta hidden shrink-0 md:inline">{t.n}</span>
                <span className={`display-md inline-block ${i % 2 ? "text-muted-foreground" : ""}`}>
                  {t.title}
                </span>
              </div>
              <div
                data-tool-desc
                className="max-w-xl text-[15px] leading-relaxed text-muted-foreground md:pl-16 md:text-base"
              >
                <p className="pt-4">{t.description}</p>
              </div>
              <span
                aria-hidden
                data-tool-divider
                className="pointer-events-none absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-primary"
              />
            </li>
          ))}
        </ol>
      </div>

      {/* 02 — WHAT AI HELPED WITH */}
      <div data-help-block className="mt-24 md:mt-32">
        <div className="flex items-baseline gap-4">
          <span className="font-display text-3xl text-primary md:text-4xl">02</span>
          <span className="meta">What AI helped with</span>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 md:grid-cols-5 md:gap-x-8">
          {HELPED.map((h) => (
            <div key={h.n} data-help-item>
              <p className="meta text-primary">{h.n}</p>
              <p className="display-md mt-3">{h.title}</p>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 03 — WHAT I CHANGED */}
      <div data-changed-block className="mt-24 md:mt-32">
        <div className="flex items-baseline gap-4">
          <span className="font-display text-3xl text-primary md:text-4xl">03</span>
          <span className="meta">What I changed</span>
        </div>
        <p data-changed-line className="display-md mt-6 max-w-2xl">
          AI helped me move faster, but I was still the person making the decisions.
        </p>
        <ul className="mt-10 max-w-2xl border-t border-hairline">
          {CHANGED.map((c) => (
            <li
              key={c}
              data-changed-line
              className="border-b border-hairline py-5 text-[15px] leading-relaxed text-foreground/85 md:text-base"
            >
              {c}
            </li>
          ))}
        </ul>
      </div>

      {/* 04 — PROS / CONS */}
      <div data-proscons-block className="mt-24 md:mt-32">
        <div className="flex items-baseline gap-4">
          <span className="font-display text-3xl text-primary md:text-4xl">04</span>
          <span className="meta">Pros / cons</span>
        </div>

        <div className="mt-10 grid gap-12 md:grid-cols-2 md:gap-20">
          <div>
            <p className="meta text-primary">Advantages</p>
            <ul className="mt-6 space-y-4">
              {PROS.map((x) => (
                <li
                  key={x}
                  data-proscons-line
                  className="border-b border-hairline pb-4 font-display text-lg"
                >
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="meta">Disadvantages</p>
            <ul className="mt-6 space-y-4">
              {CONS.map((x) => (
                <li
                  key={x}
                  data-proscons-line
                  className="border-b border-hairline pb-4 font-display text-lg text-muted-foreground"
                >
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="meta mt-14 border-t border-primary/40 pt-6 text-primary md:max-w-xl">
          AI is powerful. But it&apos;s a tool — not the person who built this.
        </p>
      </div>
    </section>
  );
}
