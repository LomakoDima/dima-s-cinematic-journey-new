/*
 * SELECTED WORK — content lives here, nowhere else.
 * =================================================
 *
 * Everything below is a placeholder. Edit THIS FILE ONLY; ProjectsSection.tsx
 * needs no changes.
 *
 * 1. IMAGES
 *    Drop a file into src/assets/, import it at the top of this file, and set
 *    it as `image`:
 *        import northlight from "@/assets/northlight.jpg";
 *    Then update `width`/`height` to the file's real pixel dimensions — they
 *    reserve the layout box before the image loads and prevent a jump.
 *    Landscape images around 16:10 fit the composition best.
 *
 * 2. TEXT
 *    Replace every "[edit: ...]" string. Keep `title` short — it renders at
 *    display size and long titles wrap awkwardly on the pinned layout.
 *
 * 3. LINKS (visible)
 *    Set `url` to a real URL to turn the visual into a link and add the
 *    "View project" row. Leave it `null` and the project renders as a
 *    non-interactive figure — nothing broken ships.
 *
 * 4. LINKS (extra — github and anything else you add)
 *    `links` is a plain bag of named URLs — `github` is there by default, and
 *    you can add any other key you want (`demo`, `figma`, `caseStudy`, ...).
 *    ProjectsSection.tsx shows a "GitHub ↗" row when `links.github` is a real
 *    URL. Any OTHER key you add stays invisible on the site by default — it's
 *    just a place to keep a link next to the project it belongs to — unless
 *    you also wire it into ProjectsSection.tsx the same way `github` is
 *    wired in. A value still wrapped in "[edit: ...]" is treated as unfilled
 *    and never rendered, so leaving the placeholder is always safe.
 *
 * 5. VIDEO (optional)
 *    Put a short muted clip in public/ and set `video: "/clip.mp4"`. The
 *    `image` is used as its poster. Leave `null` to use the image alone.
 *
 * 6. ADDING / REMOVING PROJECTS
 *    Just add or delete entries. The scroll length, the transition timing and
 *    the progress bar all derive from the array length, so nothing else needs
 *    touching. Three to six entries works best; beyond that the pinned section
 *    gets long.
 */

import gallery1 from "@/assets/Velora.png";
import gallery2 from "@/assets/MamaYaStudent.png";
import gallery3 from "@/assets/Zoomify.jpg";
import gallery4 from "@/assets/Linqo.png";

export type Project = {
  /** Two-digit index shown above the title. */
  n: string;
  title: string;
  description: string;
  year: string;
  /** One or two words — "Web App", "Tool", "Experiment". */
  category: string;
  tech: string[];
  image: string;
  /** Real pixel dimensions of `image`. */
  width: number;
  height: number;
  alt: string;
  /** Live URL, or null for a non-interactive entry. */
  url: string | null;
  /**
   * Reference links — GitHub, demo, Figma, whatever. Never rendered on the
   * site; this is just for you. `github` exists by default, add more keys
   * as needed.
   */
  links: Record<string, string>;
  /** Path to a muted loop in public/, or null. */
  video: string | null;
  featured: boolean;
};

/**
 * True when a `links` entry is a real URL rather than an unfilled
 * "[edit: ...]" marker — lets the UI show a GitHub link only once you've
 * actually filled one in, never a broken "[edit: ...]" href.
 */
export function isRealLink(value: string | undefined): value is string {
  return !!value && !value.trim().startsWith("[");
}

export const PROJECTS: Project[] = [
  {
    n: "01",
    title: "Velora (bookmark manager)",
    description:
      "A personal bookmark manager designed to make saving, organizing, and revisiting links simple and beautiful.",
    year: "2026",
    category: "Web App",
    tech: ["React", "TypeScript", "PostgreSQL"],
    image: gallery1,
    width: 1200,
    height: 1500,
    alt: "Velora bookmark manager interface",
    url: null,
    links: { github: "[edit: https://github.com/your-username/velora]" },
    video: null,
    featured: true,
  },
  {
    n: "02",
    title: "MamaYaStudent",
    description:
      "A platform for students and applicants to explore universities, compare options, read reviews, and get help with important decisions.",
    year: "2026",
    category: "Platform",
    tech: ["React", "TypeScript", "PostgreSQL"],
    image: gallery2,
    width: 1500,
    height: 1000,
    alt: "MamaYaStudent education platform interface",
    url: null,
    links: { github: "[edit: https://github.com/your-username/mamayastudent]" },
    video: null,
    featured: true,
  },
  {
    n: "03",
    title: "Lens Mod",
    description:
      "A Minecraft mod that brings smooth, customizable zoom controls and an OptiFine-inspired experience to modern modded Minecraft.",
    year: "2025",
    category: "Minecraft Mod",
    tech: ["Java", "Forge", "Gradle"],
    image: gallery3,
    width: 1100,
    height: 1400,
    alt: "Lens Mod Minecraft mod interface",
    url: null,
    links: { github: "https://github.com/LomakoDima/LensMod" },
    video: null,
    featured: false,
  },
  {
    n: "04",
    title: "Linqo.",
    description:
      "A modern link-in-bio platform for creating a personal page that brings your important links and online presence together.",
    year: "2026",
    category: "Web App",
    tech: ["React", "TypeScript", "Tailwind CSS"],
    image: gallery4,
    width: 1500,
    height: 1000,
    alt: "Linqo link-in-bio page interface",
    url: null,
    links: { github: "[edit: https://github.com/your-username/linqo]" },
    video: null,
    featured: false,
  },
];
