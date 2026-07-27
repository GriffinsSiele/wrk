"use client";

import { useEffect } from "react";
import { BrandMark } from "@/components/brand/BrandMark";

/**
 * Section 01 hero — staggered enter only. Copy locked to About v3.0 FINAL.
 * Display beats: H1 = positioning; lede = opening beat (larger presence under H1).
 */
export function AboutHero() {
  useEffect(() => {
    const items = document.querySelectorAll(".about-hero-enter");
    items.forEach((el, i) => {
      window.setTimeout(() => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "translateY(0)";
      }, 80 + i * 100);
    });
  }, []);

  const enter = {
    opacity: 0,
    transform: "translateY(14px)",
    transition: "opacity 0.75s ease, transform 0.75s ease",
  } as const;

  return (
    <section
      className="relative overflow-hidden"
      style={{
        minHeight: "min(78vh, 760px)",
        background:
          "radial-gradient(ellipse 85% 60% at 8% -5%, rgba(150,118,43,0.1), transparent 52%), radial-gradient(ellipse 65% 50% at 100% 5%, rgba(27,122,107,0.07), transparent 48%), linear-gradient(180deg, #f7f1e6 0%, var(--ox-cream) 58%, #ebe4d6 100%)",
      }}
    >
      <div className="relative mx-auto max-w-[42rem] px-4 sm:px-6 pt-28 sm:pt-32 pb-10 sm:pb-12 text-center">
        <div className="about-hero-enter flex justify-center" style={enter}>
          <BrandMark variant="cream" size={64} priority />
        </div>

        {/* Positioning statement — present, not competing with the lede beat */}
        <h1
          className="about-hero-enter font-display mt-7 text-[clamp(1.85rem,4.2vw,2.75rem)] leading-[1.12] tracking-[-0.015em]"
          style={{ ...enter, color: "var(--ox-ink)", fontWeight: 500 }}
        >
          Where trusted specialists are made.
        </h1>

        {/* Lede — the opening display beat of the page (larger than body; carries the page) */}
        <p
          className="about-hero-enter mt-8 font-display text-[clamp(1.55rem,3.8vw,2.15rem)] leading-snug tracking-tight max-w-[24ch] mx-auto"
          style={{ ...enter, color: "var(--ox-ink)", fontWeight: 500 }}
        >
          Everything works on somebody. That is exactly the problem.
        </p>

        <div
          className="about-hero-enter mt-8 space-y-5 text-left max-w-[34rem] mx-auto"
          style={enter}
        >
          <p className="font-body text-[1.05rem] sm:text-lg leading-[1.7]" style={{ color: "var(--ox-muted)" }}>
            The ketogenic diet works. So does the high-carb one. Hybrid racing works, and so does
            walking. Fasting works. Eating breakfast works. Cold water works. Every method in the
            health and performance industry has people it transformed, and every one of them has
            people it did nothing for — or quietly cost.
          </p>
          <p className="font-body text-[1.05rem] sm:text-lg leading-[1.7]" style={{ color: "var(--ox-muted)" }}>
            So the methods keep selling, and nobody has to explain the failures. They are put down
            to discipline, or genetics, or bad luck.
          </p>
          <p className="font-body text-[1.05rem] sm:text-lg leading-[1.7]" style={{ color: "var(--ox-muted)" }}>
            They are usually none of those things. A body that is rested adapts to what is asked of
            it. A body that is not rested does not adapt — it absorbs. Same plan, same diet, same
            discipline, opposite outcome. And nobody checked, because checking is not what the
            industry sells.
          </p>
        </div>

        {/* Pull quote — display, centred, full-measure hairline rules above and below */}
        <div className="about-hero-enter mt-10 max-w-[34rem] mx-auto" style={enter}>
          <div className="h-px w-full" style={{ background: "rgba(150,118,43,0.45)" }} aria-hidden />
          <p
            className="font-display py-7 text-[clamp(1.15rem,2.4vw,1.4rem)] leading-snug italic"
            style={{ color: "var(--ox-ink)", fontWeight: 500 }}
          >
            “We don’t replace your certification. We specialise it.”
          </p>
          <div className="h-px w-full" style={{ background: "rgba(150,118,43,0.45)" }} aria-hidden />
        </div>
      </div>
    </section>
  );
}
