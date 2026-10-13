/*
 * MY FAVOURITE HOLIDAY — content lives here, nowhere else. The two pinned
 * photo moments (Burj Khalifa, Dubai Marina) and the closing quote stay in
 * HolidaySection.tsx itself since they're bespoke, not uniform list data.
 */

export type HolidayBeat = {
  range: string;
  title: string;
  lines: string[];
  /** Beat 04 only — gets its own scroll-scrubbed type-scale treatment,
   * spliced between the first and remaining lines. */
  scaleLine?: string;
};

export const BEATS: HolidayBeat[] = [
  {
    range: "15 January 2026",
    title: "FIRST TIME IN DUBAI",
    lines: [
      "Right after New Year, I flew to Dubai for the first time — with my best friend from childhood.",
    ],
  },
  {
    range: "Ras Al Khaimah",
    title: "THE VILLA",
    lines: [
      "From Dubai we drove to Ras Al Khaimah, to a Rixos resort on an all-inclusive stay.",
      "We had a villa instead of a room in the main building, and that alone made it feel different from any holiday before.",
    ],
  },
  {
    range: "Evenings at the resort",
    title: "THE RESORT",
    lines: [
      "The sea was right there, waves loud enough to fall asleep to. Buffets that never seemed to end, a steakhouse, Italian and Turkish places, a different show every evening.",
      "Somewhere completely outside my everyday life.",
    ],
  },
  {
    range: "One day before we left",
    title: "THE ROAD BACK",
    lines: [
      "We drove from Ras Al Khaimah back to Dubai.",
      "Even from a distance, I could feel how much bigger everything was about to get.",
    ],
    scaleLine: "HUGE HIGHWAYS. SKYSCRAPERS ON THE HORIZON.",
  },
  {
    range: "Dubai Safari Park",
    title: "THE SCALE STARTED TO FEEL UNREAL.",
    lines: [
      "Our first stop was Dubai Safari Park — the biggest zoo I had ever seen. The scale of it alone was overwhelming.",
    ],
  },
];

export const REFLECTION: HolidayBeat = {
  range: "What changed",
  title: "THIS WASN'T JUST A HOLIDAY.",
  lines: [
    "It showed me how much bigger the world is than my everyday surroundings, and made me want to explore more, learn more, see what else is out there.",
  ],
};
