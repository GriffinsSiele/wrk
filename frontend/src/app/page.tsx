"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { BrandMark } from "@/components/brand/BrandMark";
import { Strapline } from "@/components/brand/Strapline";
function HeroContent() {
  useEffect(() => {
    const items = document.querySelectorAll(".hero-enter");
    items.forEach((el, i) => {
      setTimeout(() => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "translateY(0)";
      }, 100 + i * 90);
    });
  }, []);

  return (<>
      <div
        className="hero-enter"
        style={{ opacity: 0, transform: "translateY(12px)", transition: "all 0.7s ease" }}
      >
        <Strapline deployTone="cream" size="md" />
      </div>

      <h1
        className="hero-enter font-display mt-8 leading-[1.05] tracking-[-0.02em]"
        style={{
          fontSize: "clamp(2.4rem, 6vw, 4.25rem)",
          color: "var(--cream)",
          fontWeight: 500,
          opacity: 0,
          transform: "translateY(20px)",
          transition: "all 0.8s ease",
          maxWidth: "16ch",
        }}
      >
        Where trusted specialists are made.
      </h1>

      <p
        className="hero-enter font-body italic mt-7 text-[1.2rem] leading-relaxed max-w-md"
        style={{
          color: "rgba(242,237,227,0.72)",
          opacity: 0,
          transform: "translateY(14px)",
          transition: "all 0.7s ease",
        }}
      >
        We don&apos;t replace your certification. We specialise it.
      </p>

      <div
        className="hero-enter mt-10 flex flex-wrap gap-3"
        style={{ opacity: 0, transform: "translateY(14px)", transition: "all 0.7s ease" }}
      >
        <Link
          href="/certification"
          className="ox-cta inline-flex items-center h-12 px-8 text-[13px] tracking-[0.14em] uppercase"
        >
          View specialisations
        </Link>
        <Link
          href="/work-with-us"
          className="inline-flex items-center h-12 px-8 text-[13px] tracking-[0.1em] uppercase font-display"
          style={{ border: "1px solid rgba(242,237,227,0.45)", color: "var(--cream)", borderRadius: 2 }}
        >
          Join the pool
        </Link>
      </div>
    </>);
}

/** Illustrative readiness widget, not live product data. */
function ReadinessPanel() {
  const bars = [62, 78, 54, 88, 70, 92, 66, 48, 80, 58];

  return (<div className="relative w-full max-w-[400px] mx-auto">
      <p
        className="font-display text-[10px] tracking-[0.28em] uppercase mb-3 text-center"
        style={{ color: "var(--ochre)" }}
      >
        Illustrative · not live data
      </p>
      <div
        style={{
          border: "1px solid rgba(150,118,43,0.45)",
          background: "rgba(12,15,18,0.55)",
          color: "var(--cream)",
        }}
      >
        <div className="flex items-center justify-between px-5 h-12" style={{ borderBottom: "1px solid rgba(150,118,43,0.3)" }}>
          <span className="font-display text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--ochre)" }}>
            Readiness
          </span>
          <span className="font-body text-[13px]" style={{ color: "var(--cream)" }}>
            84
          </span>
        </div>
        <div className="p-5">
          <div className="flex items-end gap-1.5 h-28 mb-5">
            {bars.map((h, i) => (<div
                key={i}
                className="flex-1 ox-bar"
                style={{
                  height: `${h}%`,
                  background: "var(--mint)",
                  opacity: i === 5 ? 1 : 0.55,
                  animationDelay: `${i * 60}ms`,
                }}
              />))}
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Recovery", value: "72" },
              { label: "Load", value: "61" },
              { label: "Sleep", value: "88" },
            ].map((m) => (<div key={m.label} style={{ borderTop: "1px solid rgba(150,118,43,0.28)", paddingTop: 10 }}>
                <div className="font-display text-lg" style={{ color: "var(--cream)" }}>
                  {m.value}
                </div>
                <div className="font-display text-[9px] tracking-[0.18em] uppercase mt-1" style={{ color: "rgba(242,237,227,0.45)" }}>
                  {m.label}
                </div>
              </div>))}
          </div>
        </div>
      </div>
    </div>);
}

const pillars = [
  {
    num: "I",
    title: "Learn",
    desc: "Structured specialisation built on the science, layered onto a qualification you already hold. Delivered in defined teaching hours against a published syllabus.",
  },
  {
    num: "II",
    title: "Certify",
    desc: "An assessed standard. Written examination and observed practical assessment, marked against published criteria. The certificate carries an issued number and a renewal date.",
  },
  {
    num: "III",
    title: "Deploy",
    desc: "The trusted pool. Certified specialists placed where performance matters across corporate programmes, health projects, sport, and partner facilities across the UAE.",
  },
];

export default function Home() {
  return (<div className="flex flex-col w-full">
      <Navbar />

      {/* Hero, midnight, brand-first, one gold accent (CTA) */}
      <section
        className="relative min-h-screen overflow-hidden flex items-center ox-midnight"
        style={{ background: "var(--ink)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          aria-hidden
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, var(--bronze) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-screen-2xl w-full flex flex-col lg:flex-row items-center gap-16 px-6 lg:px-12 pt-28 pb-24">
          <div className="flex-1">
            <div className="mb-8 hero-enter" style={{ opacity: 0, transition: "opacity 0.8s ease" }}>
              <BrandMark variant="midnight" size={72} priority />
            </div>
            <HeroContent />
          </div>
          <div className="flex-1 flex justify-center lg:justify-end w-full">
            <ReadinessPanel />
          </div>
        </div>
      </section>

      {/* Model */}
      <section className="ox-section" style={{ background: "var(--cream)" }}>
        <div className="mx-auto max-w-screen-2xl">
          <ScrollReveal className="text-center mx-auto max-w-3xl">
            <p className="ox-label mb-5">The model</p>
            <h2
              className="font-display tracking-[-0.02em] mx-auto max-w-2xl"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", color: "var(--ink)", fontWeight: 500 }}
            >
              The specialisation layer for performance coaches.
            </h2>
            <p
              className="font-body mt-5 mx-auto max-w-xl text-[1.05rem] leading-relaxed"
              style={{ color: "rgba(12,15,18,0.62)" }}
            >
              Conventional practice treats the plan as the thing to control. Olynixx Praxis teaches the inversion: the
              body is the thing to control, and the plan is the instrument. We teach it, we certify it, and we place
              those who earn it.
            </p>
          </ScrollReveal>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((p, i) => (<ScrollReveal key={p.num} delay={i * 100}>
                <div className="h-full pt-2" style={{ borderTop: "1px solid rgba(150,118,43,0.35)" }}>
                  <div className="font-display text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: "var(--bronze)" }}>
                    {p.num}
                  </div>
                  <h3 className="font-display text-[1.35rem] mb-3" style={{ color: "var(--teal)", fontWeight: 500 }}>
                    {p.title}
                  </h3>
                  <p className="font-body text-[15px] leading-relaxed" style={{ color: "rgba(12,15,18,0.62)" }}>
                    {p.desc}
                  </p>
                </div>
              </ScrollReveal>))}
          </div>
        </div>
      </section>

      {/* Pipeline, evidence-precise, no traction claims */}
      <section className="ox-section" style={{ background: "var(--ink)", color: "var(--cream)" }}>
        <div className="mx-auto max-w-screen-2xl">
          <ScrollReveal className="text-center mx-auto max-w-3xl">
            <p className="ox-label mb-5">Certification pipeline</p>
            <h2
              className="font-display mx-auto max-w-xl"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 500 }}
            >
              Taught, tested, and vouched for.
            </h2>
            <p
              className="font-body mt-4 mx-auto max-w-lg text-[1.05rem]"
              style={{ color: "rgba(242,237,227,0.65)" }}
            >
              Every specialist we send has completed the dual gate of written examination and observed practical
              assessment before joining the trusted pool.
            </p>
          </ScrollReveal>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { id: "01", title: "Enrol", note: "Account & pathway" },
              { id: "02", title: "Study", note: "Specialisation modules" },
              { id: "03", title: "Written", note: "Online exam" },
              { id: "04", title: "Practical", note: "Assessor PASS" },
              { id: "05", title: "Deploy", note: "Pool placement" },
            ].map((step, i) => (<ScrollReveal key={step.id} delay={i * 70}>
                <div
                  className="p-5 h-full"
                  style={{
                    border: "1px solid rgba(150,118,43,0.35)",
                    background: "transparent",
                  }}
                >
                  <div className="font-display text-[11px] tracking-[0.2em] mb-3" style={{ color: "var(--ochre)" }}>
                    {step.id}
                  </div>
                  <p className="font-display text-[1.05rem]" style={{ color: "var(--cream)" }}>
                    {step.title}
                  </p>
                  <p className="font-body text-[13px] mt-2" style={{ color: "rgba(242,237,227,0.5)" }}>
                    {step.note}
                  </p>
                </div>
              </ScrollReveal>))}
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="ox-section" style={{ background: "var(--cream)" }}>
        <div className="mx-auto max-w-screen-2xl">
          <ScrollReveal className="text-center mx-auto max-w-3xl">
            <p className="ox-label mb-5">Where we place</p>
            <h2
              className="font-display mx-auto max-w-xl"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", color: "var(--ink)", fontWeight: 500 }}
            >
              Specialists for environments that demand readiness.
            </h2>
          </ScrollReveal>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "rgba(150,118,43,0.35)" }}>
            {[
              {
                title: "Corporate programmes",
                desc: "Certified specialists placed where performance matters within a clear non-medical scope.",
              },
              {
                title: "Health projects & sport",
                desc: "Measure the state first, then set the input. Specialists from the trusted pool across the UAE.",
              },
              {
                title: "Partner facilities",
                desc: "Shortlisted from the trusted pool and assigned by admin, taught, tested, vouched for.",
              },
            ].map((card) => (<ScrollReveal key={card.title}>
                <div className="h-full p-8 md:p-10" style={{ background: "var(--cream)" }}>
                  <h3 className="font-display text-[1.2rem] mb-3" style={{ color: "var(--teal)", fontWeight: 500 }}>
                    {card.title}
                  </h3>
                  <p className="font-body text-[15px] leading-relaxed" style={{ color: "rgba(12,15,18,0.62)" }}>
                    {card.desc}
                  </p>
                </div>
              </ScrollReveal>))}
          </div>
        </div>
      </section>

      {/* Closing CTA, one gold accent */}
      <section className="px-6 py-10 sm:py-12" style={{ background: "var(--teal-deep)" }}>
        <div className="mx-auto max-w-screen-2xl text-center">
          <ScrollReveal>
            <BrandMark variant="transparent" size={44} />
            <h2
              className="font-display mt-4 mx-auto max-w-lg"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", color: "var(--cream)", fontWeight: 500 }}
            >
              Earn the specialisation. Join the pool. Get placed.
            </h2>
            <p className="font-body italic mt-3 text-[1.05rem]" style={{ color: "rgba(242,237,227,0.65)" }}>
              Where trusted specialists are made.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/certification"
                className="ox-cta inline-flex items-center h-12 px-8 text-[13px] tracking-[0.14em] uppercase"
              >
                View specialisations
              </Link>
              <Link
                href="/organisations"
                className="inline-flex items-center h-12 px-8 text-[13px] tracking-[0.1em] uppercase font-display"
                style={{ border: "1px solid rgba(242,237,227,0.45)", color: "var(--cream)", borderRadius: 2 }}
              >
                For organisations →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>);
}
