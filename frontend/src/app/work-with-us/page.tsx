"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import Link from "next/link";
import { Award, BarChart2, DollarSign, Globe, TrendingUp, Users } from "react-feather";

const traits = [
  { title: "Non-medical professionals", desc: "Personal trainers, S&C coaches, sport coaches, wellness practitioners, and occupational health professionals." },
  { title: "Evidence-driven mindset", desc: "You believe in the science. You want to back your coaching decisions with data and proven frameworks." },
  { title: "People-first approach", desc: "You understand that performance is built on the human being, not just the training programme." },
  { title: "Ready to level up", desc: "You're actively working in sport, corporate wellness, or community health — and you want a credential that reflects your expertise." },
];

const benefits = [
  { icon: Award, title: "Accredited Certification", desc: "Earn a Level 1 qualification recognised by REPs UAE, ACE, and NASM." },
  { icon: Globe, title: "Join the Coach Pool", desc: "Join the private Olynixx deployable coach pool; assignments are shortlisted and managed by admin." },
  { icon: BarChart2, title: "Performance Intel Tools", desc: "Access frameworks, assessment tools, and templates developed by our expert faculty." },
  { icon: Users, title: "Community of Practice", desc: "Connect with a growing network of certified Human Readiness Coaches across the region." },
  { icon: TrendingUp, title: "Career Pathway", desc: "Progress from certification to paid project delivery through Olynixx-administered opportunities." },
  { icon: DollarSign, title: "Earn as You Coach", desc: "Project assignments come with fair remuneration. Your time and expertise are valued." },
];


export default function WorkWithUsPage() {
  return (
    <div style={{ background: "var(--ox-bg-dark)", color: "var(--ox-fg-dark)", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: "128px 24px 56px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="ox-aurora" />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto" }}>
          <ScrollReveal><span className="ox-label"><span className="ox-dot" />Become a Coach</span></ScrollReveal>
          <ScrollReveal delay={100}>
            <h1 style={{ fontSize: "clamp(2.5rem,6vw,4.5rem)", fontWeight: 800, lineHeight: 1.1, margin: "24px 0 20px", letterSpacing: "-0.02em" }}>
              Your expertise deserves<br />a credential.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p style={{ fontSize: "1.15rem", color: "rgba(62,128,204,0.7)", lineHeight: 1.7, marginBottom: 40 }}>
              Olynixx Academy bridges the gap between what you already know and what the industry recognises. Become certified, join the pool, and get deployed through admin-managed assignments.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <Link href="/login" className="ox-cta" style={{ padding: "16px 40px", display: "inline-block", textDecoration: "none", fontSize: "1rem" }}>
              Apply now
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Who we're looking for */}
      <section style={{ padding: "56px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <ScrollReveal>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, textAlign: "center", marginBottom: 48 }}>Who we&apos;re looking for</h2>
        </ScrollReveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
          {traits.map((t, i) => (
            <ScrollReveal key={t.title} delay={i * 80}>
              <div className="ox-card-dark" style={{ padding: "28px 24px" }}>
                <div style={{ width: 32, height: 3, background: "var(--ox-accent)", borderRadius: 2, marginBottom: 16 }} />
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 10 }}>{t.title}</h3>
                <p style={{ color: "var(--ox-muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>{t.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: "56px 24px 84px", maxWidth: 1100, margin: "0 auto", borderTop: "1px solid var(--ox-line)" }}>
        <ScrollReveal>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, textAlign: "center", marginBottom: 48 }}>What you get</h2>
        </ScrollReveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
          {benefits.map((b, i) => (
            <ScrollReveal key={b.title} delay={i * 80}>
              <div className="ox-card-dark" style={{ padding: "28px 24px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, color: "var(--ox-accent)" }}>
                  <b.icon size={26} />
                </span>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 8 }}>{b.title}</h3>
                  <p style={{ color: "var(--ox-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>{b.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "56px 24px 84px", textAlign: "center", background: "rgba(37,192,210,0.04)", borderTop: "1px solid rgba(37,192,210,0.1)" }}>
        <ScrollReveal>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: 16 }}>Ready to apply?</h2>
          <p style={{ color: "var(--ox-muted)", marginBottom: 32 }}>Create your account and begin your certification journey today.</p>
          <Link href="/login" className="ox-cta" style={{ padding: "16px 48px", display: "inline-block", textDecoration: "none", fontSize: "1.05rem" }}>Get started</Link>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}
