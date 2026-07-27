import Link from "next/link";
import { Strapline } from "@/components/brand/Strapline";
import { KhatamDivider } from "@/components/brand/KhatamDivider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AboutHero } from "./AboutHero";

const RECOVERY_STRANDS = [
  {
    label: "Physical",
    body: "sleep quality and duration, autonomic balance, tissue load and accumulated volume.",
  },
  {
    label: "Mental",
    body: "brain energy, oxygenation, acid–base balance, hydration and sleep architecture. Measurable, not a matter of opinion.",
  },
  {
    label: "Metabolic",
    body: "fuelling, hydration, energy availability and the timing of intake against load and sleep.",
  },
  {
    label: "Hormonal",
    body: "the signalling that sets the ceiling on adaptation, read by pattern and trend rather than by blood work.",
  },
] as const;

const PILLARS = [
  {
    title: "Human Readiness",
    paragraphs: [
      "Readiness is a dynamic physiological state — the capacity a body has, at this moment, to answer what is being asked of it. A training session. A change of diet. A demanding week. It is not a fitness score, it is not a personality, and it is not fixed. It can be measured in minutes.",
      "Coaches learn to establish a baseline, read change against it, and set the input to what the reading shows rather than to what the plan says. The discipline is reading the trend, not the number.",
    ],
  },
  {
    title: "Recovery",
    paragraphs: [
      "The systems do not recover together. Muscular, nervous, hormonal, cardio-pulmonary and metabolic each run their own curve at their own rate — which is why the same person can be ready to train hard and in no condition to start a diet on the same morning. Assuming they recover in step is a guess, and it is the guess most plans are built on.",
      "Coaches learn to read four connected systems, each against that person’s own baseline:",
    ],
    strands: RECOVERY_STRANDS,
    closing:
      "Read the four. Find the limiting system. Set the load to it, or wait. Where a pattern suggests something clinical, refer.",
  },
  {
    title: "Performance Intelligence",
    paragraphs: [
      "Measurement is only useful if it changes a decision. The decision is rarely which method. It is whether this person should start it at all, and when.",
      "Coaches learn to run a baseline properly, to compare a person against themselves rather than against a population norm, and to tell a trend from a bad night.",
      "And they learn to write it down — what was measured, what was decided and why — in a form a client, a physician, an employer or a project partner can rely on. The report is the part the client keeps.",
    ],
  },
] as const;

const MODEL_COLUMNS = [
  {
    title: "Learn",
    body: "Structured specialisation built on the science, layered onto a qualification you already hold. Delivered in defined teaching hours against a published syllabus.",
  },
  {
    title: "Certify",
    body: "An assessed standard. Written examination and observed practical assessment, marked against published criteria. The certificate carries an issued number and a renewal date.",
  },
  {
    title: "Deploy",
    body: "The trusted pool. Certified specialists placed where performance matters — corporate programmes, health projects, sport, and partner facilities across the UAE.",
  },
] as const;

function BronzeHairline() {
  return (
    <div aria-hidden>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="h-px w-full" style={{ background: "rgba(150,118,43,0.32)" }} />
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--ox-cream)" }}>
      <Navbar />
      <AboutHero />

      <BronzeHairline />

      {/* Section 02 — The Idea */}
      <section className="py-10 sm:py-12" style={{ background: "var(--ox-cream)" }}>
        <div className="mx-auto max-w-[40rem] px-4 sm:px-6">
          <ScrollReveal>
            <h2
              className="font-display text-[clamp(1.85rem,4vw,2.65rem)] leading-[1.12] tracking-tight"
              style={{ color: "var(--ox-ink)", fontWeight: 500 }}
            >
              What has to be true before anything works
            </h2>
            <div className="mt-6 space-y-5">
              <p className="font-body text-[1.02rem] leading-[1.75]" style={{ color: "var(--ox-muted)" }}>
                A training block, a nutrition protocol, a supplement plan, a corporate wellness
                programme, a race preparation — every one of them is an input. Every input assumes
                the body receiving it has the capacity to answer. That capacity is not constant. It
                is not the same between two people, and it is not the same in one person from one
                month to the next.
              </p>
              <p className="font-body text-[1.02rem] leading-[1.75]" style={{ color: "var(--ox-muted)" }}>
                Almost nothing in the industry is timed to it. Advice is written for a population and
                delivered to an individual. It is given on the day the person asked rather than on
                the day their body could use it. Then everyone waits, and hopes.
              </p>
            </div>

            <div className="mt-8 pt-7" style={{ borderTop: "1px solid rgba(150,118,43,0.38)" }}>
              <p className="font-body text-[1.05rem] leading-[1.75]" style={{ color: "var(--ox-ink)" }}>
                Conventional practice treats the plan as the thing to control. Olynixx Praxis teaches
                the inversion: the body is the thing to control, and the plan is the instrument. You
                measure the state first, and you set the input to it.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              <p className="font-body text-[1.02rem] leading-[1.75]" style={{ color: "var(--ox-muted)" }}>
                This is not another method competing with the ones above. It is the layer underneath
                all of them — the part that decides whether any of them will work on this person,
                this month. That is why the specialisation sits on top of a qualification rather than
                replacing it, and why it has to be taught, assessed and certified rather than read
                about once.
              </p>
              <p className="font-body text-[1.02rem] leading-[1.75]" style={{ color: "var(--ox-muted)" }}>
                Twenty years of measurement sit behind it. Not a theory that was later tested — a
                practice that was measured from the beginning, and a method built out of what the
                measurements kept showing.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="flex justify-center py-1" style={{ background: "var(--ox-cream)" }}>
        <KhatamDivider />
      </div>

      {/* Section 03 — The three pillars (equal panels) */}
      <section
        className="py-10 sm:py-12"
        style={{ background: "linear-gradient(180deg, #ebe4d6 0%, var(--ox-cream) 100%)" }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal className="text-center max-w-xl mx-auto">
            <h2
              className="font-display text-[clamp(1.85rem,4vw,2.65rem)] leading-[1.12] tracking-tight"
              style={{ color: "var(--ox-ink)", fontWeight: 500 }}
            >
              The three pillars
            </h2>
          </ScrollReveal>

          <div
            className="mt-8 grid md:grid-cols-3"
            style={{ borderTop: "1px solid rgba(150,118,43,0.45)" }}
          >
            {PILLARS.map((pillar, i) => (
              <ScrollReveal key={pillar.title} delay={i * 90} className="h-full">
                <article
                  className="h-full flex flex-col px-0 md:px-8 py-6 md:py-3 about-equal-panel"
                  data-index={i}
                >
                  <div
                    className="h-px w-10 mb-5"
                    style={{ background: "rgba(150,118,43,0.55)" }}
                    aria-hidden
                  />
                  <h3
                    className="font-display text-[1.35rem] sm:text-[1.5rem] leading-snug"
                    style={{ color: "var(--ox-ink)", fontWeight: 500 }}
                  >
                    {pillar.title}
                  </h3>
                  <div className="mt-5 space-y-4 flex-1">
                    {pillar.paragraphs.map((p) => (
                      <p
                        key={p.slice(0, 48)}
                        className="font-body text-[0.95rem] sm:text-[0.98rem] leading-[1.7]"
                        style={{ color: "var(--ox-muted)" }}
                      >
                        {p}
                      </p>
                    ))}
                    {"strands" in pillar && pillar.strands ? (
                      <ul className="space-y-2 pt-0.5">
                        {pillar.strands.map((s) => (
                          <li
                            key={s.label}
                            className="font-body text-[0.95rem] sm:text-[0.98rem] leading-[1.65]"
                            style={{ color: "var(--ox-muted)" }}
                          >
                            <span style={{ color: "var(--ox-ink)", fontWeight: 600 }}>{s.label}</span>
                            {" — "}
                            {s.body}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {"closing" in pillar && pillar.closing ? (
                      <p
                        className="font-body text-[0.95rem] sm:text-[0.98rem] leading-[1.7]"
                        style={{ color: "var(--ox-muted)" }}
                      >
                        {pillar.closing}
                      </p>
                    ) : null}
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <BronzeHairline />

      {/* Section 04 — Who this is for */}
      <section
        className="py-10 sm:py-14"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(150,118,43,0.08), transparent 60%), #ebe4d6",
        }}
      >
        <div className="mx-auto max-w-[38rem] px-4 sm:px-6 text-center">
          <ScrollReveal>
            <h2
              className="font-display text-[clamp(1.85rem,4vw,2.65rem)] leading-[1.12] tracking-tight"
              style={{ color: "var(--ox-ink)", fontWeight: 500 }}
            >
              Who this is for
            </h2>
            <div className="mt-6 space-y-4 max-w-[32rem] mx-auto">
              <p className="font-body text-[1.02rem] leading-[1.75]" style={{ color: "var(--ox-muted)" }}>
                Coaches, trainers, nutritionists and health professionals who have run out of road
                with the plan they were taught to write.
              </p>
              <p className="font-body text-[1.02rem] leading-[1.75]" style={{ color: "var(--ox-muted)" }}>
                Who have watched a sound programme fail on a committed client, and had nothing to say
                about why.
              </p>
              <p className="font-body text-[1.02rem] leading-[1.75]" style={{ color: "var(--ox-muted)" }}>
                Who are tired of hoping, and would rather know.
              </p>
            </div>

            <div
              className="mt-8 mx-auto h-px w-14"
              style={{ background: "rgba(150,118,43,0.5)" }}
              aria-hidden
            />

            <p
              className="mt-6 font-display text-[clamp(1.55rem,3.8vw,2.15rem)] leading-snug tracking-tight max-w-[24ch] mx-auto"
              style={{ color: "var(--ox-ink)", fontWeight: 500 }}
            >
              You do not need another method. You need to know who it will work on, and when.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <BronzeHairline />

      {/* Section 05 — The model */}
      <section className="py-10 sm:py-12" style={{ background: "var(--ox-cream)" }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal className="text-center">
            <h2
              className="font-display text-[clamp(1.85rem,4vw,2.65rem)] leading-[1.12] tracking-tight"
              style={{ color: "var(--ox-ink)", fontWeight: 500 }}
            >
              Learn. Certify. Deploy.
            </h2>
          </ScrollReveal>

          <div
            className="mt-8 grid md:grid-cols-3"
            style={{ borderTop: "1px solid rgba(150,118,43,0.45)" }}
          >
            {MODEL_COLUMNS.map((col, i) => (
              <ScrollReveal key={col.title} delay={i * 80}>
                <div className="px-0 md:px-8 py-6 md:py-3 about-equal-panel" data-index={i}>
                  <h3
                    className="font-display text-[1.35rem] sm:text-[1.5rem]"
                    style={{ color: "var(--ox-ink)", fontWeight: 500 }}
                  >
                    {col.title}
                  </h3>
                  <p
                    className="font-body mt-4 text-[0.95rem] sm:text-[0.98rem] leading-[1.7]"
                    style={{ color: "var(--ox-muted)" }}
                  >
                    {col.body}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="mt-10 flex justify-center">
            <Strapline size="lg" deployTone="ink" />
          </ScrollReveal>
        </div>
      </section>

      {/* Section 06 — Scope of practice (cream ground; light-ground mark context) */}
      <section
        className="py-10 sm:py-12"
        style={{
          background: "linear-gradient(180deg, #ebe4d6 0%, var(--ox-cream) 100%)",
        }}
      >
        <div className="mx-auto max-w-[40rem] px-4 sm:px-6">
          <ScrollReveal>
            <h2
              className="font-display text-[clamp(1.85rem,4vw,2.65rem)] leading-[1.12] tracking-tight"
              style={{ color: "var(--ox-ink)", fontWeight: 500 }}
            >
              Scope of practice
            </h2>
            <div className="mt-6 space-y-5">
              <p className="font-body text-[1.02rem] leading-[1.75]" style={{ color: "var(--ox-muted)" }}>
                Olynixx Praxis certifies non-medical human performance coaches. The specialisation
                does not authorise the diagnosis or treatment of any condition, the prescription of
                medication or of individual diets, the recommendation of supplements, the ordering or
                clinical interpretation of blood work or hormonal testing, the rehabilitation of
                injury, or any form of psychological therapy or counselling.
              </p>
              <p className="font-body text-[1.02rem] leading-[1.75]" style={{ color: "var(--ox-muted)" }}>
                Certified specialists work with clients, not patients. They screen, they refer, and
                they programme within the limits of the qualification they hold. Referral to a
                physician, physiotherapist, registered dietitian or licensed mental-health
                professional is a required competency — assessed at certification, and not an
                optional courtesy.
              </p>
              <p className="font-body text-[1.02rem] leading-[1.75]" style={{ color: "var(--ox-ink)" }}>
                We set the standard, and we vouch for whoever meets it. That guarantee only holds if
                the boundary is clear.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="flex justify-center py-1" style={{ background: "var(--ox-cream)" }}>
        <KhatamDivider />
      </div>

      {/* Section 07 — Who we are */}
      <section className="py-10 sm:py-14 sm:pb-16" style={{ background: "var(--ox-cream)" }}>
        <div className="mx-auto max-w-[38rem] px-4 sm:px-6 text-center">
          <ScrollReveal>
            <h2
              className="font-display text-[clamp(1.85rem,4vw,2.65rem)] leading-[1.12] tracking-tight"
              style={{ color: "var(--ox-ink)", fontWeight: 500 }}
            >
              Who we are
            </h2>
            <div className="mt-6 space-y-5">
              <p className="font-body text-[1.02rem] leading-[1.75]" style={{ color: "var(--ox-muted)" }}>
                Olynixx Praxis is a specialisation and certification body for non-medical human
                performance coaches, operating in the United Arab Emirates. Courses are delivered in
                the UAE and taught by approved faculty against a published syllabus.
              </p>
              <p className="font-body text-[1.02rem] leading-[1.75]" style={{ color: "var(--ox-muted)" }}>
                Learner and coach records are held under UAE data residency and processed in line
                with the Personal Data Protection Law.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {/* Primary CTA is ink/bronze — gold reserved for strapline in §05 (gold rationing) */}
              <Link
                href="/work-with-us"
                className="inline-flex items-center h-12 px-8 text-[13px] tracking-[0.14em] uppercase font-display"
                style={{
                  background: "var(--ink)",
                  color: "var(--cream)",
                  borderRadius: 2,
                }}
              >
                Join the pool
              </Link>
              <Link
                href="/certification"
                className="inline-flex items-center h-12 px-8 text-[13px] tracking-[0.1em] uppercase font-display"
                style={{
                  border: "1px solid rgba(12,15,18,0.35)",
                  color: "var(--ox-ink)",
                  borderRadius: 2,
                }}
              >
                View specialisations
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
