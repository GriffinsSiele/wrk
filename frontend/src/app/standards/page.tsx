"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { BrandMark } from "@/components/brand/BrandMark";
import { Strapline } from "@/components/brand/Strapline";
import { KhatamDivider } from "@/components/brand/KhatamDivider";

const standards = [
  {
    code: "01",
    title: "Evidence-based practice",
    desc: "All coaching recommendations must be grounded in peer-reviewed research or established best-practice frameworks.",
  },
  {
    code: "02",
    title: "Scope of practice",
    desc: "Coaches operate strictly within the non-medical scope. They do not diagnose or treat conditions, prescribe medication or individual diets, recommend supplements, order or clinically interpret blood work, rehabilitate injury, or provide psychological therapy. Referral is a required competency.",
  },
  {
    code: "03",
    title: "Client confidentiality",
    desc: "Client data, wellness records, and assessment results are treated as confidential in line with UAE PDPL.",
  },
  {
    code: "04",
    title: "Continuing education",
    desc: "Certified coaches complete a minimum of 20 CECs per year to maintain active certification status.",
  },
  {
    code: "05",
    title: "Professional conduct",
    desc: "Coaches represent Olynixx Praxis in every engagement. Unprofessional conduct may lead to suspension or revocation.",
  },
  {
    code: "06",
    title: "Conflict of interest",
    desc: "Coaches must disclose any financial or personal relationships that may influence coaching recommendations.",
  },
];

const scopeTable = [
  {
    area: "Readiness assessment",
    inScope: "Baseline and trend reading of capacity; sleep, load, autonomic and readiness screening within non-medical limits",
    outOfScope: "Clinical diagnosis, medical assessment, prescribing medication",
  },
  {
    area: "Recovery reading",
    inScope: "Reading Physical, Mental, Metabolic and Hormonal systems against a personal baseline; setting load or waiting",
    outOfScope: "Physiotherapy treatment, medical rehabilitation, clinical blood/hormone interpretation, supplement prescription",
  },
  {
    area: "Performance decisions",
    inScope: "Deciding whether and when to start an input; documenting what was measured, decided and why",
    outOfScope: "Sports medicine decisions, injury management, clinical psychology",
  },
  {
    area: "Client interaction",
    inScope: "Coaching and education within the qualification held; mandatory referral when patterns suggest clinical need",
    outOfScope: "Medical advice, diagnosis, psychological therapy or counselling, prescribing therapeutic interventions",
  },
];

export default function StandardsPage() {
  return (<div style={{ background: "var(--cream)", color: "var(--ink)", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero, one composition: brand, headline, one sentence */}
      <section
        style={{
          position: "relative",
          padding: "140px 24px 88px",
          background: "var(--ink)",
          color: "var(--cream)",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(27,122,107,0.28) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(217,172,74,0.12) 0%, transparent 50%)",
          }}
        />
        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <ScrollReveal>
            <BrandMark variant="midnight" size={56} />
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <p
              className="font-display"
              style={{
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "var(--ochre)",
                margin: "28px 0 0",
              }}
            >
              Standards · v1.0
            </p>
          </ScrollReveal>
          <ScrollReveal delay={140}>
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(2.4rem,5.5vw,3.75rem)",
                fontWeight: 500,
                lineHeight: 1.1,
                margin: "20px 0 24px",
              }}
            >
              The line we hold.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p
              className="font-body"
              style={{
                fontSize: "1.1rem",
                color: "rgba(242,237,227,0.68)",
                lineHeight: 1.75,
                maxWidth: 520,
                margin: "0 auto 36px",
              }}
            >
              Professional standards and scope of practice for every Olynixx Praxis certified coach.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={260}>
            <Strapline deployTone="cream" size="sm" />
          </ScrollReveal>
        </div>
      </section>

      {/* Principle */}
      <section style={{ padding: "72px 24px", maxWidth: 720, margin: "0 auto" }}>
        <ScrollReveal>
          <KhatamDivider className="mb-10" />
          <p className="ox-label" style={{ marginBottom: 20, textAlign: "center" }}>
            Guiding principle
          </p>
          <p
            className="font-body italic"
            style={{
              fontSize: "clamp(1.15rem,2.4vw,1.4rem)",
              lineHeight: 1.75,
              color: "var(--ink)",
              textAlign: "center",
            }}
          >
            We set the standard, and we vouch for whoever meets it. That guarantee only holds if the boundary is clear : 
            we specialise coaches; we do not practise medicine.
          </p>
          <KhatamDivider className="mt-10" />
        </ScrollReveal>
      </section>

      {/* Standards, one job: list the six */}
      <section style={{ padding: "24px 24px 88px", maxWidth: 820, margin: "0 auto" }}>
        <ScrollReveal>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(1.6rem,3vw,2.2rem)",
              fontWeight: 500,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Six professional standards
          </h2>
          <p
            className="font-body"
            style={{
              textAlign: "center",
              color: "rgba(12,15,18,0.55)",
              marginBottom: 56,
              fontSize: "0.98rem",
            }}
          >
            Expected of every coach who earns and keeps Praxis certification.
          </p>
        </ScrollReveal>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {standards.map((s, i) => (<ScrollReveal key={s.code} delay={i * 50}>
              <article
                style={{
                  display: "grid",
                  gridTemplateColumns: "72px 1fr",
                  gap: 28,
                  padding: "32px 0",
                  borderTop: "1px solid rgba(150,118,43,0.35)",
                  borderBottom: i === standards.length - 1 ? "1px solid rgba(150,118,43,0.35)" : "none",
                }}
              >
                <div
                  className="font-display"
                  style={{
                    fontSize: 13,
                    letterSpacing: "0.2em",
                    color: "var(--ochre)",
                    paddingTop: 4,
                  }}
                >
                  STD-{s.code}
                </div>
                <div>
                  <h3
                    className="font-display"
                    style={{ fontSize: "1.25rem", fontWeight: 500, color: "var(--teal)", marginBottom: 10 }}
                  >
                    {s.title}
                  </h3>
                  <p className="font-body" style={{ color: "rgba(12,15,18,0.62)", lineHeight: 1.75, fontSize: "0.98rem" }}>
                    {s.desc}
                  </p>
                </div>
              </article>
            </ScrollReveal>))}
        </div>
      </section>

      {/* Scope, visual in / out, not a dense spreadsheet */}
      <section
        style={{
          padding: "72px 24px 96px",
          background: "rgba(13,59,62,0.04)",
          borderTop: "1px solid rgba(150,118,43,0.28)",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <ScrollReveal>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(1.6rem,3vw,2.2rem)",
                fontWeight: 500,
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              Scope of practice
            </h2>
            <p
              className="font-body"
              style={{
                textAlign: "center",
                color: "rgba(12,15,18,0.55)",
                marginBottom: 48,
                fontSize: "0.98rem",
                maxWidth: 480,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              What Praxis coaches may do, and where they must stop and refer.
            </p>
          </ScrollReveal>

          <div
            className="hidden md:grid"
            style={{
              gridTemplateColumns: "1.1fr 1.4fr 1.4fr",
              gap: 16,
              marginBottom: 20,
              padding: "0 4px",
            }}
          >
            {["Area", "Within scope", "Outside scope"].map((h) => (<div
                key={h}
                className="font-display"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--ochre)",
                }}
              >
                {h}
              </div>))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {scopeTable.map((row, i) => (<ScrollReveal key={row.area} delay={i * 60}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 1,
                    background: "rgba(150,118,43,0.35)",
                  }}
                >
                  <div style={{ padding: "28px 24px", background: "var(--cream)" }}>
                    <p
                      className="font-display md:hidden"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "var(--ochre)",
                        marginBottom: 8,
                      }}
                    >
                      Area
                    </p>
                    <h3 className="font-display" style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--teal)" }}>
                      {row.area}
                    </h3>
                  </div>
                  <div style={{ padding: "28px 24px", background: "var(--cream)" }}>
                    <p
                      className="font-display"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "var(--mint)",
                        marginBottom: 10,
                      }}
                    >
                      Within scope
                    </p>
                    <p className="font-body" style={{ color: "rgba(12,15,18,0.7)", lineHeight: 1.65, fontSize: "0.95rem" }}>
                      {row.inScope}
                    </p>
                  </div>
                  <div style={{ padding: "28px 24px", background: "rgba(12,15,18,0.03)" }}>
                    <p
                      className="font-display"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "var(--bronze)",
                        marginBottom: 10,
                      }}
                    >
                      Outside scope
                    </p>
                    <p className="font-body" style={{ color: "rgba(12,15,18,0.55)", lineHeight: 1.65, fontSize: "0.95rem" }}>
                      {row.outOfScope}
                    </p>
                  </div>
                </div>
              </ScrollReveal>))}
          </div>
        </div>
      </section>

      {/* Close */}
      <section style={{ padding: "80px 24px 96px", textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
        <ScrollReveal>
          <p className="font-body italic" style={{ fontSize: "1.15rem", color: "rgba(12,15,18,0.62)", marginBottom: 32 }}>
            Where trusted specialists are made.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/certification"
              className="ox-cta"
              style={{
                padding: "14px 28px",
                textDecoration: "none",
                fontSize: 13,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              View pathway
            </Link>
            <Link
              href="/work-with-us"
              className="ox-ghost"
              style={{ padding: "14px 28px", textDecoration: "none", fontSize: 13 }}
            >
              Join the pool
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </div>);
}
