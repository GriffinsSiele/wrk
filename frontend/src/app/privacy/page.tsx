import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const effectiveDate = "07 July 2026";

export default function PrivacyPolicyPage() {
  return (
    <div style={{ background: "var(--ox-bg-dark)", color: "var(--ox-fg-dark)", minHeight: "100vh" }}>
      <Navbar />

      <section style={{ padding: "128px 24px 56px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="ox-aurora" />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto" }}>
          <span className="ox-label"><span className="ox-dot" />Legal</span>
          <h1 style={{ fontSize: "clamp(2.1rem,5vw,3.2rem)", fontWeight: 800, margin: "22px 0 12px", letterSpacing: "-0.02em" }}>
            Privacy Policy
          </h1>
          <p style={{ color: "var(--ox-muted)", fontSize: "0.98rem" }}>
            Effective date: {effectiveDate}
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px 84px" }}>
        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75, fontSize: "0.95rem" }}>
            This Privacy Policy explains how Olynixx Academy (&quot;Olynixx&quot;, &quot;we&quot;, &quot;us&quot;, or
            &quot;our&quot;) collects, uses, stores, and shares personal data when you use our website, learner
            platform, coach portal, and related services. We process personal data in accordance with
            applicable laws of the United Arab Emirates, including Federal Decree-Law No. 45 of 2021
            concerning the Protection of Personal Data (PDPL), as applicable.
          </p>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>1. Who we are</h2>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75, marginBottom: 8 }}>
            Data Controller: Olynixx Academy
          </p>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75, marginBottom: 8 }}>
            Contact for privacy matters: <a href="mailto:privacy@olynixx.com" style={{ color: "var(--ox-accent)" }}>privacy@olynixx.com</a>
          </p>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75 }}>
            Business contact: <a href="mailto:hello@olynixx.com" style={{ color: "var(--ox-accent)" }}>hello@olynixx.com</a>
          </p>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>2. Personal data we collect</h2>
          <ul style={{ color: "var(--ox-muted)", lineHeight: 1.75, paddingLeft: 18, margin: 0 }}>
            <li>Account and identity details (name, email, role, profile information).</li>
            <li>Contact details (phone number, organisation details, enquiry submissions).</li>
            <li>Learning and platform data (course progress, quiz attempts, exam session selections).</li>
            <li>Coach profile and professional details (specialty, language, emirate, availability, credentials).</li>
            <li>Technical and usage data (IP address, browser type, device data, activity logs, cookies).</li>
          </ul>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>3. Why we process your data</h2>
          <ul style={{ color: "var(--ox-muted)", lineHeight: 1.75, paddingLeft: 18, margin: 0 }}>
            <li>To register and manage user accounts and secure access to portals.</li>
            <li>To deliver courses, assessments, certification workflows, and support services.</li>
            <li>To manage organisational enquiries, coach assignments, and platform operations.</li>
            <li>To improve our services, maintain security, detect misuse, and comply with legal obligations.</li>
            <li>To send service updates and, where permitted, communications about our services.</li>
          </ul>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>4. Lawful basis for processing</h2>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75 }}>
            We process personal data based on one or more legal grounds recognized under applicable UAE law,
            including performance of a contract, compliance with legal obligations, our legitimate interests
            (such as platform security and service improvement), and consent where required.
          </p>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>5. Cookies and tracking</h2>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75 }}>
            We use cookies and similar technologies for authentication, session continuity, performance,
            and analytics. You can control cookies through browser settings; however, disabling essential
            cookies may affect core platform functions.
          </p>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>6. Data sharing</h2>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75, marginBottom: 8 }}>
            We may share data with:
          </p>
          <ul style={{ color: "var(--ox-muted)", lineHeight: 1.75, paddingLeft: 18, margin: 0 }}>
            <li>Cloud hosting and infrastructure providers.</li>
            <li>Service providers supporting platform operations, communications, and security.</li>
            <li>Professional advisors, regulators, or public authorities where required by law.</li>
          </ul>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75, marginTop: 10 }}>
            We do not sell personal data.
          </p>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>7. International transfers</h2>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75 }}>
            If personal data is transferred outside the UAE, we implement appropriate safeguards and legal
            mechanisms in line with applicable UAE legal requirements.
          </p>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>8. Data retention</h2>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75 }}>
            We retain personal data only for as long as needed for the purposes described in this Policy,
            including legal, regulatory, tax, accounting, dispute, and audit requirements. Retention periods
            depend on data category and legal context.
          </p>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>9. Your data protection rights</h2>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75, marginBottom: 8 }}>
            Subject to applicable law and lawful exceptions, you may have rights to:
          </p>
          <ul style={{ color: "var(--ox-muted)", lineHeight: 1.75, paddingLeft: 18, margin: 0 }}>
            <li>Request access to your personal data.</li>
            <li>Request correction of inaccurate or incomplete data.</li>
            <li>Request deletion of personal data in specified circumstances.</li>
            <li>Object to or restrict certain processing activities.</li>
            <li>Withdraw consent where processing is based on consent.</li>
          </ul>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75, marginTop: 10 }}>
            To exercise your rights, contact us at <a href="mailto:privacy@olynixx.com" style={{ color: "var(--ox-accent)" }}>privacy@olynixx.com</a>.
          </p>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>10. Security</h2>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75 }}>
            We use technical and organisational safeguards designed to protect personal data against
            unauthorised access, disclosure, alteration, or destruction. No system is completely secure,
            but we continuously monitor and improve our controls.
          </p>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>11. Children</h2>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75 }}>
            Our services are intended for adults and professional users. If we become aware that personal
            data has been provided in a way that breaches applicable legal requirements, we may remove such data.
          </p>
        </div>

        <div className="ox-card-dark" style={{ padding: "28px 24px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>12. Changes to this policy</h2>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75, marginBottom: 8 }}>
            We may update this Privacy Policy from time to time. Updates will be posted on this page with
            a revised effective date.
          </p>
          <p style={{ color: "var(--ox-muted)", lineHeight: 1.75 }}>
            For questions, contact <a href="mailto:privacy@olynixx.com" style={{ color: "var(--ox-accent)" }}>privacy@olynixx.com</a>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
