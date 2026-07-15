import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const effectiveDate = "07 July 2026";

export default function TermsPage() {
  return (
    <div style={{ background: "var(--ox-bg-dark)", color: "var(--ox-fg-dark)", minHeight: "100vh" }}>
      <Navbar />

      <section style={{ padding: "128px 24px 56px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="ox-aurora" />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto" }}>
          <span className="ox-label"><span className="ox-dot" />Legal</span>
          <h1 style={{ fontSize: "clamp(2.1rem,5vw,3.2rem)", fontWeight: 800, margin: "22px 0 12px", letterSpacing: "-0.02em" }}>
            Terms of Service
          </h1>
          <p style={{ color: "var(--ox-muted)", fontSize: "0.98rem" }}>
            Effective date: {effectiveDate}
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px 84px" }}>
        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75, fontSize: "0.95rem" }}>
            These Terms of Service (&quot;Terms&quot;) govern access to and use of the Olynixx Academy website,
            learner platform, coach portal, and related services (collectively, the &quot;Services&quot;).
            By using the Services, you agree to these Terms.
          </p>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>1. About Olynixx</h2>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75, marginBottom: 8 }}>
            Olynixx Academy provides non-medical education, certification pathways, coach profiling, and
            related services focused on human readiness, recovery, and performance intelligence.
          </p>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75 }}>
            Contact: <a href="mailto:hello@olynixx.com" style={{ color: "var(--ox-accent)" }}>hello@olynixx.com</a>
          </p>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>2. Eligibility and accounts</h2>
          <ul style={{ color: "var(--ox-muted)", lineHeight: 1.75, paddingLeft: 18, margin: 0 }}>
            <li>You must provide accurate and complete account information.</li>
            <li>You are responsible for safeguarding your login credentials and account activity.</li>
            <li>You must promptly notify us of unauthorized use of your account.</li>
            <li>We may suspend or terminate accounts for breach of these Terms or misuse of the Services.</li>
          </ul>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>3. Use of services</h2>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75, marginBottom: 8 }}>
            You agree to use the Services lawfully and responsibly. You must not:
          </p>
          <ul style={{ color: "var(--ox-muted)", lineHeight: 1.75, paddingLeft: 18, margin: 0 }}>
            <li>Use the platform for illegal, deceptive, abusive, or infringing conduct.</li>
            <li>Attempt unauthorized access, disrupt systems, or interfere with platform security.</li>
            <li>Copy, scrape, or redistribute protected content without written permission.</li>
            <li>Misrepresent credentials, certifications, or professional qualifications.</li>
          </ul>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>4. Non-medical scope and disclaimer</h2>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75 }}>
            Olynixx content and certifications are provided for non-medical educational and professional
            development purposes. The Services do not provide medical diagnosis, treatment, or clinical advice.
            Users remain responsible for obtaining appropriate licensed medical care where required.
          </p>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>5. Fees, payments, and refunds</h2>
          <ul style={{ color: "var(--ox-muted)", lineHeight: 1.75, paddingLeft: 18, margin: 0 }}>
            <li>Any paid services, if offered, are subject to applicable pricing and checkout terms.</li>
            <li>Unless otherwise stated, fees are non-refundable once access is granted.</li>
            <li>Where required under applicable law, valid refund rights will be honored.</li>
          </ul>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>6. Certification and platform outcomes</h2>
          <ul style={{ color: "var(--ox-muted)", lineHeight: 1.75, paddingLeft: 18, margin: 0 }}>
            <li>Certification is subject to completion of required modules and passing criteria.</li>
            <li>Assignment opportunities, coach matching, and business outcomes are not guaranteed.</li>
            <li>We may update curriculum, exam formats, and platform workflows over time.</li>
          </ul>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>7. Intellectual property</h2>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75 }}>
            All content, trademarks, software, training materials, and branding in the Services are owned by
            Olynixx or its licensors and are protected under applicable laws. No rights are granted except
            as expressly provided in these Terms.
          </p>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>8. Privacy and data protection</h2>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75 }}>
            Your use of the Services is also governed by our Privacy Policy. We process personal data in
            accordance with applicable UAE legal requirements, including PDPL where applicable.
          </p>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>9. Service availability</h2>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75 }}>
            We aim to maintain reliable service but do not guarantee uninterrupted or error-free operation.
            We may perform maintenance, updates, or emergency actions that temporarily affect availability.
          </p>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>10. Limitation of liability</h2>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75 }}>
            To the fullest extent permitted by law, Olynixx is not liable for indirect, incidental,
            special, consequential, or punitive damages, or any loss of profit, revenue, data, or business
            opportunity arising from use of the Services. Nothing in these Terms excludes liability that
            cannot be excluded under applicable law.
          </p>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>11. Indemnity</h2>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75 }}>
            You agree to indemnify and hold Olynixx harmless from claims, losses, and expenses arising out of
            your breach of these Terms, unlawful conduct, or misuse of the Services.
          </p>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>12. Governing law and disputes</h2>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75 }}>
            These Terms are governed by the laws of the United Arab Emirates and the applicable laws of the
            Emirate of Dubai. Unless required otherwise by mandatory law, disputes shall be submitted to the
            competent courts of Dubai, UAE.
          </p>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>13. Changes to these terms</h2>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75, marginBottom: 8 }}>
            We may update these Terms periodically. The revised version will be posted here with an updated
            effective date. Continued use of the Services after updates means you accept the updated Terms.
          </p>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75 }}>
            Questions: <a href="mailto:hello@olynixx.com" style={{ color: "var(--ox-accent)" }}>hello@olynixx.com</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
