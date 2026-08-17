import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/*
 * A contour-line sculpture.
 *
 * Horizontal lines are displaced by a Gaussian bulge crossed with a sum-of-sines
 * field, so an invisible three-dimensional form emerges out of flat strokes —
 * thin lines being the same material the rest of the layout is built from.
 *
 * Deliberately canvas 2D and not WebGL: it is ~40 stroked polylines, which the
 * 2D rasteriser handles comfortably, and it costs no dependency.
 */

const LINES = 42;
/** Horizontal sampling. Lower = smoother curves, more points per frame. */
const PX_PER_STEP = 9;
const DPR_CAP = 2;

export function HeroVisual() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = wrap.current;
    const cv = canvas.current;
    if (!host || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const wide = window.matchMedia("(min-width: 768px)").matches;

    const styles = getComputedStyle(document.documentElement);
    const fg = styles.getPropertyValue("--foreground").trim() || "#efeee9";
    const accent = styles.getPropertyValue("--primary").trim() || "#d98b4a";

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let visible = true;
    let t = 0;
    let last = 0;

    // Cursor influence, lerped. Targets are written by the listener; the render
    // loop eases towards them so nothing snaps.
    let tmx = 0;
    let tmy = 0;
    let mx = 0;
    let my = 0;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // The form drifts a little with the cursor, but stays near centre.
      const cx = 0.5 + mx * 0.1;
      const cy = 0.5 + my * 0.08;
      const sigma = 0.3;
      const twoSigmaSq = 2 * sigma * sigma;
      const amp = h * 0.19;
      const steps = Math.max(24, Math.ceil(w / PX_PER_STEP));

      const padY = h * 0.14;
      const usable = h - padY * 2;

      ctx.lineWidth = 1;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      for (let i = 0; i < LINES; i++) {
        const rowT = i / (LINES - 1);
        const baseY = padY + rowT * usable;
        const v = baseY / h;

        // How strongly this row passes through the bulge — drives both the
        // displacement and how visible the row is.
        const dyc = v - cy;
        const centreFall = Math.exp(-(dyc * dyc) / twoSigmaSq);

        ctx.beginPath();
        for (let s = 0; s <= steps; s++) {
          const u = s / steps;
          const x = u * w;

          const dx = u - cx;
          const fall = Math.exp(-(dx * dx + dyc * dyc) / twoSigmaSq);

          const wave =
            Math.sin(u * 6.1 + t * 0.32 + i * 0.21) * 0.5 +
            Math.sin(u * 11.3 - t * 0.19 + i * 0.12) * 0.27 +
            Math.sin(v * 8.4 + t * 0.15) * 0.23;

          const y = baseY - fall * amp * (1 + wave * 0.5) - wave * 5.5 * centreFall;

          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        // Rows crossing the bulge are brighter; the crown picks up the accent.
        const accented = centreFall > 0.62;
        ctx.strokeStyle = accented ? accent : fg;
        ctx.globalAlpha = (accented ? 0.1 : 0.055) + centreFall * (accented ? 0.15 : 0.1);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    };

    // Time-based rather than per-frame, so the drift and the cursor lag look
    // identical at 60Hz and 144Hz.
    const frame = (now: number) => {
      const dt = last === 0 ? 16.7 : Math.min(now - last, 50);
      last = now;

      const ease = 1 - Math.pow(1 - 0.045, dt / 16.7);
      mx += (tmx - mx) * ease;
      my += (tmy - my) * ease;
      t += dt / 1000;

      draw();
      raf = window.requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      last = 0;
      raf = window.requestAnimationFrame(frame);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      window.cancelAnimationFrame(raf);
    };

    const onPointer = (e: PointerEvent) => {
      tmx = (e.clientX / window.innerWidth - 0.5) * 2;
      tmy = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };

    resize();
    draw();

    // Static single frame on reduced motion and on phones — still a composed
    // image, but nothing keeps running.
    if (reduced || !wide) {
      const ro = new ResizeObserver(() => {
        resize();
        draw();
      });
      ro.observe(host);
      return () => ro.disconnect();
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        visible = entry.isIntersecting;
        if (visible && !document.hidden) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(host);

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(host);

    if (fine) window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      if (fine) window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div
      ref={wrap}
      aria-hidden
      data-depth="0.3"
      className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[62vh] -translate-y-1/2 opacity-45 md:left-[46%] md:right-0 md:h-[76vh] md:opacity-100"
      style={{
        // The headline is clamp(…, 13vw, …), so its right edge lands near 48% of
        // the viewport — just past where this panel starts. Dissolving the left
        // edge guarantees the sculpture never competes with the type at any
        // width, instead of chasing the breakpoint with margins.
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, rgb(0 0 0 / 0.35) 16%, #000 34%)",
        maskImage: "linear-gradient(to right, transparent 0%, rgb(0 0 0 / 0.35) 16%, #000 34%)",
      }}
    >
      <canvas ref={canvas} className="size-full" />
    </div>
  );
}
