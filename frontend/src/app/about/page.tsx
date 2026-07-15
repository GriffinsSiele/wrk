"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const values = [
  { title: "Science First", desc: "Every framework we teach is grounded in peer-reviewed research. We don't follow trends — we follow evidence." },
  { title: "Human Centred", desc: "Performance is about people, not numbers. Our coaches are trained to see the whole person, not just the athlete." },
  { title: "Radical Honesty", desc: "We say what we mean, and we mean what we say. Our standards are high because the stakes are real." },
  { title: "Long-term Thinking", desc: "Sustainable performance over short-term gains. We're building coaches who last — and clients who thrive." },
];

const team = [
  { name: "Dr. Sarah Al-Rashid", role: "Founder & Head of Education", bio: "Former Sport Scientist with 15 years across elite sport and corporate wellbeing. PhD in Human Performance." },
  { name: "Marcus Webb", role: "Head of Coach Development", bio: "Ex-professional athlete and S&C coach. Specialist in readiness screening and periodisation." },
  { name: "Nadia Khalil", role: "Head of Partnerships", bio: "UAE-based wellbeing strategist with a background in corporate health programmes and B2B consulting." },
];

export default function AboutPage() {
  return (
    <div style={{ background: "var(--ox-bg-dark)", color: "var(--ox-fg-dark)", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: "128px 24px 56px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="ox-aurora" />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto" }}>
          <ScrollReveal><span className="ox-label"><span className="ox-dot" />About Olynixx</span></ScrollReveal>
          <ScrollReveal delay={100}>
            <h1 style={{ fontSize: "clamp(2.5rem,6vw,4.5rem)", fontWeight: 800, lineHeight: 1.1, margin: "24px 0 20px", letterSpacing: "-0.02em" }}>
              We exist to raise<br />the standard of care.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p style={{ fontSize: "1.1rem", color: "var(--ox-muted)", lineHeight: 1.8, maxWidth: 620, margin: "0 auto" }}>
              Olynixx was founded on a simple belief: the people who support human performance — coaches, trainers, practitioners — deserve better education, better tools, and better recognition. We built the academy to give them exactly that.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: "56px 24px", maxWidth: 900, margin: "0 auto" }}>
        <ScrollReveal>
          <div className="ox-card-dark" style={{ padding: "56px 48px", borderLeft: "3px solid var(--ox-accent)" }}>
            <span className="ox-label" style={{ marginBottom: 16, display: "flex" }}><span className="ox-dot" />Our Mission</span>
            <p style={{ fontSize: "1.3rem", lineHeight: 1.8, color: "var(--ox-fg-dark)", fontStyle: "italic" }}>
              &ldquo;To certify and deploy a generation of Human Readiness Coaches who measurably improve the wellbeing and performance of every person they serve.&rdquo;
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Values */}
      <section style={{ padding: "56px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <ScrollReveal><h2 style={{ fontSize: "2rem", fontWeight: 700, textAlign: "center", marginBottom: 48 }}>What we stand for</h2></ScrollReveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
          {values.map((v, i) => (
            <ScrollReveal key={v.title} delay={i * 80}>
              <div className="ox-card-dark" style={{ padding: "28px 24px" }}>
                <div style={{ width: 32, height: 3, background: "var(--ox-accent)", borderRadius: 2, marginBottom: 16 }} />
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 10 }}>{v.title}</h3>
                <p style={{ color: "var(--ox-muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: "56px 24px 84px", maxWidth: 1100, margin: "0 auto", borderTop: "1px solid var(--ox-line)" }}>
        <ScrollReveal><h2 style={{ fontSize: "2rem", fontWeight: 700, textAlign: "center", marginBottom: 48 }}>The team</h2></ScrollReveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
          {team.map((m, i) => (
            <ScrollReveal key={m.name} delay={i * 100}>
              <div className="ox-card-dark" style={{ padding: "32px 28px" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,var(--ox-accent),var(--ox-blue))", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800, color: "var(--ox-bg)" }}>
                  {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>{m.name}</h3>
                <p style={{ color: "var(--ox-accent)", fontSize: "0.8rem", marginBottom: 10 }}>{m.role}</p>
                <p style={{ color: "var(--ox-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>{m.bio}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
