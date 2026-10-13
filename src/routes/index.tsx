import { createFileRoute } from "@tanstack/react-router";
import { Loader } from "@/components/Loader";
import { Cursor } from "@/components/Cursor";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { AboutSection } from "@/components/AboutSection";
import { PersonalitySection } from "@/components/PersonalitySection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { JourneyTimeline } from "@/components/JourneyTimeline";
import { FutureSection } from "@/components/FutureSection";
// AISection is intentionally not mounted below — kept in the codebase, just
// not rendered on the live site. Re-add <AISection /> to bring it back.
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { useSmoothScroll } from "@/lib/motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dima — Developer & Creative Technologist, Almaty" },
      {
        name: "description",
        content:
          "The portfolio of Dima, a developer and creative technologist from Almaty: about, selected work, journey and future plans.",
      },
      { property: "og:title", content: "Dima — Developer & Creative Technologist" },
      {
        property: "og:description",
        content:
          "A cinematic, interactive portfolio: about me, personality, selected work, journey and what's next.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useSmoothScroll();

  return (
    <>
      <Loader />
      <Cursor />
      <div aria-hidden className="grain-layer" />
      <Navigation />
      <main>
        <Hero />
        <AboutSection />
        <PersonalitySection />
        <JourneyTimeline />
        <ProjectsSection />
        <FutureSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
