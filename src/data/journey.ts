/*
 * HOW I GOT HERE — content lives here, nowhere else. See JourneyTimeline.tsx
 * for how it's rendered; this file is just the story.
 */

export type JourneyChapter = {
  n: string;
  range: string;
  title: string;
  lines: string[];
  note?: string;
  /** Chapter 06 only — the 30 → 01 → ME. sequence gets its own block. */
  climax?: {
    caption: string;
    quote: string;
    outro: string;
  };
};

export const CHAPTERS: JourneyChapter[] = [
  {
    n: "01",
    range: "2021–22",
    title: "THE CURIOSITY",
    lines: [
      "New school. New environment. Getting used to both took a while.",
      "Somewhere in that adjustment, technology got interesting.",
      "Python. Messing with game graphics just to see what changed. Minecraft.",
    ],
    note: "I wasn't trying to become a developer. I was just curious how things were made.",
  },
  {
    n: "02",
    range: "2022",
    title: "MINECRAFT",
    lines: [
      'A story-driven Minecraft series called "Новое Поколение" pulled me in — not the gameplay, the fact that people were building actual stories and dialogue inside the game.',
      "That curiosity led me to HollowHorizon, who was building something similar and gave me one piece of advice: learn Java, read Minecraft's source code.",
      "So I did. A Stepik course, a first Java project, a first real attempt at modding.",
    ],
    note: "Then it didn't work. No AI to ask, just me and a wall of errors. Eventually I gave up.",
  },
  {
    n: "03",
    range: "2022–23",
    title: "BUILDING GAMES",
    lines: [
      "Unreal Engine 5, installed on my dad's old PC. YouTube tutorials on FPS counters and building environments from nothing.",
      "The PC had other plans. Anything ambitious made UE5 crash.",
      'A new PC. Unity through Kodland while I waited, then back to Unreal — menus, inventories, animations, environments. A whole game called "Venture."',
    ],
    note: "Then the realization: some ideas are bigger than one person building alone.",
  },
  {
    n: "04",
    range: "2023–24",
    title: "A DIFFERENT DIRECTION",
    lines: [
      "Lyceum No. 134 — a genuinely hard school. I got a 2 in physics that first quarter.",
      "I'd only planned to finish 9th grade. Decided to stay for 11th instead.",
      "Then spring 2024: ChatGPT showed up, and it brought me back to Minecraft modding.",
    ],
    note: "Spring was ideas. Summer was actually building them. The thing I'd abandoned came back with me.",
  },
  {
    n: "05",
    range: "Winter of 10th grade",
    title: "THE WEB",
    lines: [
      "Tutorials on theme switching, forms, layouts, colors. Copy it, then change everything until it looked right.",
      "A travel agency site I built just to see if I could. Then PHP, phpMyAdmin, OpenServer — while HTML, CSS and JS were already showing up in informatics class.",
    ],
    note: "That's when I stopped just following tutorials and started experimenting on my own.",
  },
  {
    n: "06",
    range: "That Thursday",
    title: "ONE RAISED HAND",
    lines: [
      "A real request. A real website. A real deadline.",
      "About a year later, it was finished and published online.",
    ],
    climax: {
      caption: "History of Kazakhstan class. About thirty students in the room.",
      quote: "Who in this class knows how to make websites well?",
      outro: "That was the moment web development stopped being just another experiment.",
    },
  },
  {
    n: "07",
    range: "2026",
    title: "BUILDING FOR REAL",
    lines: ["The experiments turned into real projects. The curiosity turned into a direction."],
    note: "The person who raised his hand that day now builds things on purpose.",
  },
];
