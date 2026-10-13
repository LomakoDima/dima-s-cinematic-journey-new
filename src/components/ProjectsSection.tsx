import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap, ScrollTrigger, EASE, MEDIA, getLenis, useGsap } from "@/lib/motion";
import { SectionLabel } from "./SectionLabel";
import { PROJECTS, isRealLink, type Project } from "@/data/projects";

/*
 * SELECTED WORK — a cube you scroll through.
 *
 * One project per vertical face. The section pins, and scrolling turns the cube
 * a quarter-turn at a time; between turns the scroll rests on a still frame so
 * a stop anywhere usually lands on a composition. Text is NOT scrubbed — it
 * swaps on a normal clock the moment a different face becomes the front one, so
 * it always finishes cleanly however fast the user scrolls.
 *
 * Everything 3D is CSS (perspective + preserve-3d); GSAP only drives a handful
 * of numbers in `state` and `render()` writes them to the DOM:
 *
 *   rot   scroll-driven yaw, in degrees (0 → 90 → 180 …, one step per project)
 *   spin  one-off entrance yaw that decays to 0
 *   tx/ty pointer tilt (fine pointers only)
 *
 * Lighting is faked per face: a fixed light sits up and to the left, and each
 * face's shade/sheen is recomputed from its current angle on every render.
 */

/** Resting camera: look slightly down on the cube and slightly off-axis. */
const TILT = 13;
const YAW = -18;
/** Angle the light arrives from, relative to the viewer (negative = left). */
const LIGHT = 35;

/** Timeline units. One unit of scroll = VH_PER_UNIT of viewport height. */
const HOLD_START = 0.8;
const TURN = 1;
const HOLD = 0.7;
const HOLD_END = 0.9;
const VH_PER_UNIT = 55;

const FACES = PROJECTS.length;

type Light = { shade: number; sheen: number; sx: number };

/** Shade + sheen for a face whose outward normal points `angle`° from the viewer. */
function lightFor(angle: number): Light {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const lit = Math.max(0, Math.cos(rad(angle + LIGHT)));
  const facing = Math.max(0, Math.cos(rad(angle)));
  return {
    shade: (1 - (0.34 + 0.66 * lit)) * 0.72,
    sheen: facing,
    sx: Math.max(-1, Math.min(1, angle / 90)),
  };
}

function faceStyle(k: number, light: Light): CSSProperties {
  return {
    "--k": k,
    "--shade": light.shade.toFixed(3),
    "--sheen": light.sheen.toFixed(3),
    "--sx": light.sx.toFixed(3),
  } as CSSProperties;
}

/** "Velora (bookmark manager)" → ["Velora", "bookmark manager"]. */
function splitTitle(title: string): [string, string | null] {
  const m = title.match(/^(.*?)\s*\((.+)\)\s*$/);
  return m ? [m[1] ?? title, m[2] ?? null] : [title, null];
}

function ProjectFace({ project, k }: { project: Project; k: number }) {
  const [name] = splitTitle(project.title);
  return (
    <div data-work-face className="work-face" style={faceStyle(k, lightFor(k * 90 + YAW))}>
      <div className="work-face__shot">
        <img
          src={project.image}
          alt=""
          loading={k === 0 ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
        />
      </div>
      <div className="work-face__body">
        <span className="work-face__top">
          <span className="text-primary">{project.n}</span>
          <span>{project.year}</span>
        </span>
        <span className="work-face__name">{name}</span>
        <span className="work-face__cat">{project.category}</span>
      </div>
    </div>
  );
}

/** Face with no project on it — the lid and the base. */
function CapFace({ kind }: { kind: "top" | "bottom" }) {
  return (
    <div
      className={`work-face work-face--${kind}`}
      style={{ "--shade": kind === "top" ? 0 : 0.5, "--sheen": 0, "--sx": 0 } as CSSProperties}
    >
      {kind === "top" ? (
        <div className="work-face__lid">
          <span>DIMALAB</span>
          <span>Selected work</span>
        </div>
      ) : null}
    </div>
  );
}

function ProjectLink({ href, label }: { href: string | null; label: string }) {
  if (!href) {
    // Not filled in yet — shown, but inert, so nothing ever points nowhere.
    return (
      <span className="meta inline-flex min-h-11 items-center gap-2 opacity-40" aria-disabled>
        {label}
        <span className="text-[9px] tracking-[0.2em]">soon</span>
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      data-cursor="OPEN"
      className="meta inline-flex min-h-11 items-center text-foreground transition-colors hover:text-primary"
    >
      {label} ↗
    </a>
  );
}

/** The words that go with a project. Shared by the cube view and the static list. */
function ProjectMeta({ project }: { project: Project }) {
  const [name, sub] = splitTitle(project.title);
  const githubRaw = project.links["github"];
  const github = isRealLink(githubRaw) ? githubRaw : null;

  return (
    <>
      <span className="line-mask">
        <span data-work-line className="meta block text-primary">
          Project {project.n} <span className="text-hairline">/</span> {project.year}
        </span>
      </span>

      <h3 className="mt-3 md:mt-5">
        <span className="line-mask -mb-[0.1em] pb-[0.1em]">
          <span
            data-work-line
            className="block font-display text-[clamp(2.1rem,4.8vw,4.6rem)] font-medium leading-[0.95] tracking-[-0.03em]"
          >
            {name}
          </span>
        </span>
        {sub ? (
          <span className="line-mask mt-2">
            <span data-work-line className="meta block">
              {sub}
            </span>
          </span>
        ) : null}
      </h3>

      <span className="line-mask mt-4 block max-w-md md:mt-6">
        <span
          data-work-line
          className="block text-[14px] leading-relaxed text-foreground/75 md:text-[15px]"
        >
          {project.description}
        </span>
      </span>

      <span className="line-mask mt-4 block md:mt-6">
        <ul data-work-line className="flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <li
              key={t}
              className="meta border border-hairline px-2.5 py-1 text-[10px] text-foreground/80"
            >
              {t}
            </li>
          ))}
        </ul>
      </span>

      <span className="line-mask mt-2 block md:mt-4">
        <span data-work-line className="flex flex-wrap items-center gap-x-7">
          <ProjectLink href={project.url} label="Live demo" />
          <ProjectLink href={github} label="GitHub" />
        </span>
      </span>
    </>
  );
}

export function ProjectsSection() {
  useGsap();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cube = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const goTo = useRef<(i: number) => void>(() => {});
  const [active, setActive] = useState(0);
  const shown = useRef(0);

  // The scene: one timeline of quarter-turns, pinned and scrubbed.
  useEffect(() => {
    const el = root.current;
    const stageEl = stage.current;
    const cubeEl = cube.current;
    if (!el || !stageEl || !cubeEl || !FACES) return;

    const mm = gsap.matchMedia(el);

    mm.add(MEDIA.motionOk, () => {
      const faces = gsap.utils.toArray<HTMLElement>("[data-work-face]", cubeEl);
      const state = { rot: 0, spin: 0, tx: 0, ty: 0 };
      let current = 0;
      let tl: gsap.core.Timeline | null = null;

      const render = () => {
        // A little extra pitch mid-turn gives each quarter-turn some weight.
        const turnFrac = (state.rot / 90) % 1;
        const wobble = Math.sin(Math.PI * turnFrac) * 5;
        const yaw = -state.rot + YAW + state.tx + state.spin;
        cubeEl.style.transform = `translateZ(calc(var(--cube) / -2)) rotateX(${-TILT - wobble + state.ty}deg) rotateY(${yaw}deg)`;

        for (let k = 0; k < faces.length; k++) {
          const face = faces[k];
          if (!face) continue;
          const l = lightFor(k * 90 - state.rot + YAW + state.tx + state.spin);
          face.style.setProperty("--shade", l.shade.toFixed(3));
          face.style.setProperty("--sheen", l.sheen.toFixed(3));
          face.style.setProperty("--sx", l.sx.toFixed(3));
        }

        const idx = Math.min(FACES - 1, Math.max(0, Math.round(state.rot / 90)));
        if (idx !== current) {
          current = idx;
          setActive(idx);
        }
      };

      // Build the scroll script: hold, turn, hold, turn …
      const centres: number[] = [];
      const script = gsap.timeline({
        paused: true,
        defaults: { ease: EASE.none },
        onUpdate: () => {
          if (progress.current) progress.current.style.transform = `scaleX(${script.progress()})`;
        },
      });
      script.to({}, { duration: HOLD_START });
      centres.push(HOLD_START / 2);
      for (let i = 1; i < FACES; i++) {
        script.to(state, { rot: i * 90, duration: TURN, ease: EASE.inOut, onUpdate: render });
        const hold = i === FACES - 1 ? HOLD_END : HOLD;
        centres.push(script.duration() + hold / 2);
        script.to({}, { duration: hold });
      }
      tl = script;
      const total = script.duration();

      const st = ScrollTrigger.create({
        trigger: stageEl,
        start: "top top",
        end: `+=${Math.round(total * VH_PER_UNIT)}%`,
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
        // This section's pin is measured first, ahead of Future (1).
        refreshPriority: 3,
        animation: tl,
      });

      goTo.current = (i: number) => {
        const c = centres[Math.max(0, Math.min(FACES - 1, i))];
        if (c === undefined) return;
        const y = st.start + (c / total) * (st.end - st.start);
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(y, { duration: 1.4 });
        else window.scrollTo({ top: y, behavior: "smooth" });
      };

      // Entrance: the cube spins in from the side as the section arrives, and
      // the first project's words rise after it.
      gsap.fromTo(
        state,
        { spin: -80 },
        {
          spin: 0,
          duration: 2.2,
          ease: EASE.out,
          onUpdate: render,
          scrollTrigger: {
            trigger: stageEl,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );
      const firstLines = copy.current?.querySelectorAll<HTMLElement>(
        "[data-work-panel]:first-child [data-work-line]",
      );
      if (firstLines?.length) {
        gsap.fromTo(
          firstLines,
          { yPercent: 110, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 1.1,
            stagger: 0.07,
            delay: 0.35,
            ease: EASE.out,
            scrollTrigger: {
              trigger: stageEl,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      }
      render();

      // Pointer tilt — fine pointers only; touch gets scroll and tap.
      const cleanups: Array<() => void> = [];
      if (window.matchMedia(MEDIA.hoverFine).matches) {
        const move = (e: PointerEvent) => {
          const b = stageEl.getBoundingClientRect();
          const nx = (e.clientX - b.left) / b.width - 0.5;
          const ny = (e.clientY - b.top) / b.height - 0.5;
          gsap.to(state, {
            tx: nx * 12,
            ty: ny * 6,
            duration: 1.2,
            ease: EASE.softOut,
            overwrite: "auto",
            onUpdate: render,
          });
        };
        const leave = () =>
          gsap.to(state, {
            tx: 0,
            ty: 0,
            duration: 1.4,
            ease: EASE.softOut,
            overwrite: "auto",
            onUpdate: render,
          });
        stageEl.addEventListener("pointermove", move);
        stageEl.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          stageEl.removeEventListener("pointermove", move);
          stageEl.removeEventListener("pointerleave", leave);
          gsap.killTweensOf(state);
        });
      }

      return () => {
        cleanups.forEach((fn) => fn());
        goTo.current = () => {};
        cubeEl.style.removeProperty("transform");
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  // The words: swap on a clock when the front face changes.
  useEffect(() => {
    const from = shown.current;
    if (from === active) return;
    shown.current = active;

    const host = copy.current;
    if (!host) return;
    const panels = host.querySelectorAll<HTMLElement>("[data-work-panel]");
    const out = panels[from];
    const inn = panels[active];
    if (!out || !inn) return;

    const dir = active > from ? 1 : -1;
    const linesOf = (p: HTMLElement) => p.querySelectorAll<HTMLElement>("[data-work-line]");

    // A fast scroll can skip several faces — anything not involved just hides.
    panels.forEach((p, j) => {
      if (j === from || j === active) return;
      gsap.killTweensOf([p, ...linesOf(p)]);
      gsap.set(p, { autoAlpha: 0 });
    });
    gsap.killTweensOf([out, inn, ...linesOf(out), ...linesOf(inn)]);

    gsap.to(linesOf(out), {
      yPercent: -110 * dir,
      autoAlpha: 0,
      duration: 0.5,
      stagger: 0.035,
      ease: EASE.in,
      onComplete: () => {
        gsap.set(out, { autoAlpha: 0 });
      },
    });
    gsap.set(inn, { autoAlpha: 1 });
    gsap.fromTo(
      linesOf(inn),
      { yPercent: 110 * dir, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 1, stagger: 0.07, delay: 0.28, ease: EASE.out },
    );

    if (counter.current) counter.current.textContent = String(active + 1).padStart(2, "0");
  }, [active]);

  return (
    <section ref={root} id="work" className="relative py-28 md:py-40">
      <div className="px-5 md:px-10">
        <SectionLabel index="04" title="Selected Work" />
        <h2 className="display-lg mt-14 max-w-3xl">SELECTED WORK.</h2>
      </div>

      {/* Cube view — pinned, driven by scroll. */}
      <div
        ref={stage}
        data-work-stage
        className="relative mt-16 flex h-svh flex-col overflow-hidden bg-background pt-20 md:mt-24 md:grid md:grid-cols-12 md:items-center md:gap-10 md:px-10 md:pt-0"
      >
        <div
          ref={copy}
          aria-live="polite"
          className="order-2 grid flex-1 content-start px-5 pt-6 md:order-1 md:col-span-5 md:content-center md:px-0 md:pt-0"
        >
          {PROJECTS.map((p, i) => (
            <div
              key={p.n}
              data-work-panel
              inert={i !== active}
              className="work-panel col-start-1 row-start-1"
            >
              <ProjectMeta project={p} />
            </div>
          ))}
        </div>

        <div className="order-1 flex h-[44svh] items-center justify-center md:order-2 md:col-span-7 md:h-auto">
          <div
            role="presentation"
            data-cursor="NEXT"
            onClick={() => goTo.current((active + 1) % FACES)}
            className="relative"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[170%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 11%, transparent), transparent)",
              }}
            />
            <div aria-hidden className="work-scene">
              <div ref={cube} className="work-cube">
                {PROJECTS.map((p, k) => (
                  <ProjectFace key={p.n} project={p} k={k} />
                ))}
                <CapFace kind="top" />
                <CapFace kind="bottom" />
              </div>
              <div className="work-floor" />
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center gap-5 px-5 pb-6 md:px-10 md:pb-8">
          <span className="meta shrink-0">
            <span ref={counter}>01</span> — {String(FACES).padStart(2, "0")}
          </span>
          <span className="block h-px flex-1 bg-hairline">
            <span
              ref={progress}
              className="block h-px origin-left bg-primary"
              style={{ transform: "scaleX(0)" }}
            />
          </span>
          <nav aria-label="Projects" className="pointer-events-auto flex gap-1">
            {PROJECTS.map((p, i) => (
              <button
                key={p.n}
                type="button"
                onClick={() => goTo.current(i)}
                aria-label={`Go to ${splitTitle(p.title)[0]}`}
                aria-current={i === active}
                className={`meta min-h-11 min-w-9 transition-colors hover:text-primary ${
                  i === active ? "text-primary" : ""
                }`}
              >
                {p.n}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Reduced motion — same content as a plain list; the cube is hidden. */}
      <div data-work-list className="mt-16 space-y-24 px-5 md:px-10">
        {PROJECTS.map((p) => (
          <article key={p.n}>
            <img
              src={p.image}
              alt={p.alt}
              loading="lazy"
              decoding="async"
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="mt-6 max-w-xl">
              <ProjectMeta project={p} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
