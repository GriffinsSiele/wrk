import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BrandMark } from "@/components/brand/BrandMark";
import { KhatamDivider } from "@/components/brand/KhatamDivider";

const bodyStyle = {
  color: "rgba(12,15,18,0.68)",
  fontSize: "0.98rem",
  lineHeight: 1.8,
} as const;

type LegalSectionProps = {
  number: string;
  title: string;
  children: React.ReactNode;
};

export function LegalSection({ number, title, children }: LegalSectionProps) {
  return (
    <section
      style={{
        padding: "36px 0",
        borderTop: "1px solid rgba(150,118,43,0.32)",
      }}
    >
      <div
        className="font-display"
        style={{
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--ochre)",
          marginBottom: 12,
        }}
      >
        {number}
      </div>
      <h2
        className="font-display"
        style={{
          fontSize: "clamp(1.2rem,2.2vw,1.45rem)",
          fontWeight: 500,
          color: "var(--teal)",
          marginBottom: 16,
        }}
      >
        {title}
      </h2>
      <div className="font-body" style={bodyStyle}>
        {children}
      </div>
    </section>
  );
}

export function LegalP({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: "0 0 14px" }}>{children}</p>;
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: "1.15rem" }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: i === items.length - 1 ? 0 : 8 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function LegalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} style={{ color: "var(--teal)", textDecoration: "underline", textUnderlineOffset: 2 }}>
      {children}
    </a>
  );
}

type LegalDocProps = {
  title: string;
  lede: string;
  effectiveDate: string;
  children: React.ReactNode;
  relatedHref: string;
  relatedLabel: string;
};

export function LegalDoc({
  title,
  lede,
  effectiveDate,
  children,
  relatedHref,
  relatedLabel,
}: LegalDocProps) {
  return (
    <div style={{ background: "var(--cream)", color: "var(--ink)", minHeight: "100vh" }}>
      <Navbar />

      <header
        style={{
          position: "relative",
          padding: "140px 24px 72px",
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
              "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(27,122,107,0.26) 0%, transparent 55%)",
          }}
        />
        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <BrandMark variant="midnight" size={48} />
          <p
            className="font-display"
            style={{
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "var(--ochre)",
              margin: "24px 0 0",
            }}
          >
            Legal · Effective {effectiveDate}
          </p>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(2.2rem,5vw,3.4rem)",
              fontWeight: 500,
              lineHeight: 1.12,
              margin: "18px 0 20px",
            }}
          >
            {title}
          </h1>
          <p
            className="font-body"
            style={{
              fontSize: "1.05rem",
              color: "rgba(242,237,227,0.68)",
              lineHeight: 1.7,
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            {lede}
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 40px" }}>
        <KhatamDivider className="mb-2" />
        {children}
        <div style={{ borderTop: "1px solid rgba(150,118,43,0.32)", paddingTop: 40, marginTop: 8 }}>
          <p className="font-body" style={{ color: "rgba(12,15,18,0.55)", fontSize: "0.95rem", marginBottom: 20 }}>
            Also see{" "}
            <Link href={relatedHref} style={{ color: "var(--teal)", textDecoration: "underline" }}>
              {relatedLabel}
            </Link>
            .
          </p>
          <Link
            href="/contact"
            className="ox-cta"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              textDecoration: "none",
              fontSize: 13,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Contact us
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
