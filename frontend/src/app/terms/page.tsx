import Link from "next/link";
import { LegalDoc, LegalSection, LegalP, LegalList, LegalLink } from "@/components/legal/LegalDoc";

const effectiveDate = "07 July 2026";

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms of Service"
      lede="How you may use the Olynixx Praxis website, learner platform, coach portal, and related services."
      effectiveDate={effectiveDate}
      relatedHref="/privacy"
      relatedLabel="Privacy Policy"
    >
      <LegalSection number="01" title="Agreement">
        <LegalP>
          These Terms of Service (&quot;Terms&quot;) govern access to and use of the Olynixx Praxis website,
          learner platform, coach portal, and related services (collectively, the &quot;Services&quot;). By using
          the Services, you agree to these Terms.
        </LegalP>
      </LegalSection>

      <LegalSection number="02" title="About Olynixx Praxis">
        <LegalP>
          Olynixx Praxis provides non-medical education, certification pathways, coach profiling, and related
          services focused on human readiness, recovery, and performance intelligence.
        </LegalP>
        <LegalP>
          Contact: <LegalLink href="mailto:hello@olynixx.com">hello@olynixx.com</LegalLink>
        </LegalP>
      </LegalSection>

      <LegalSection number="03" title="Eligibility and accounts">
        <LegalList
          items={[
            "You must provide accurate and complete account information.",
            "You are responsible for safeguarding your login credentials and account activity.",
            "You must promptly notify us of unauthorised use of your account.",
            "We may suspend or terminate accounts for breach of these Terms or misuse of the Services.",
          ]}
        />
      </LegalSection>

      <LegalSection number="04" title="Use of services">
        <LegalP>You agree to use the Services lawfully and responsibly. You must not:</LegalP>
        <LegalList
          items={[
            "Use the platform for illegal, deceptive, abusive, or infringing conduct.",
            "Attempt unauthorised access, disrupt systems, or interfere with platform security.",
            "Copy, scrape, or redistribute protected content without written permission.",
            "Misrepresent credentials, certifications, or professional qualifications.",
          ]}
        />
      </LegalSection>

      <LegalSection number="05" title="Non-medical scope and disclaimer">
        <LegalP>
          Olynixx content and certifications are provided for non-medical educational and professional
          development purposes. The Services do not provide medical diagnosis, treatment, or clinical advice.
          Users remain responsible for obtaining appropriate licensed medical care where required.
        </LegalP>
        <LegalP>
          See also our{" "}
          <Link href="/standards" style={{ color: "var(--teal)", textDecoration: "underline" }}>
            Standards &amp; Scope of Practice
          </Link>
          .
        </LegalP>
      </LegalSection>

      <LegalSection number="06" title="Fees, payments, and refunds">
        <LegalList
          items={[
            "Any paid services, if offered, are subject to applicable pricing and checkout terms.",
            "Unless otherwise stated, fees are non-refundable once access is granted.",
            "Where required under applicable law, valid refund rights will be honoured.",
          ]}
        />
      </LegalSection>

      <LegalSection number="07" title="Certification and platform outcomes">
        <LegalList
          items={[
            "Certification is subject to completion of required modules and dual-gate passing criteria.",
            "Assignment opportunities, coach matching, and business outcomes are not guaranteed.",
            "We may update curriculum, exam formats, and platform workflows over time.",
          ]}
        />
      </LegalSection>

      <LegalSection number="08" title="Intellectual property">
        <LegalP>
          All content, trademarks, software, training materials, and branding in the Services are owned by
          Olynixx or its licensors and are protected under applicable laws. No rights are granted except as
          expressly provided in these Terms.
        </LegalP>
      </LegalSection>

      <LegalSection number="09" title="Privacy and data protection">
        <LegalP>
          Your use of the Services is also governed by our{" "}
          <Link href="/privacy" style={{ color: "var(--teal)", textDecoration: "underline" }}>
            Privacy Policy
          </Link>
          . We process personal data in accordance with applicable UAE legal requirements, including PDPL where
          applicable.
        </LegalP>
      </LegalSection>

      <LegalSection number="10" title="Service availability">
        <LegalP>
          We aim to maintain reliable service but do not guarantee uninterrupted or error-free operation. We may
          perform maintenance, updates, or emergency actions that temporarily affect availability.
        </LegalP>
      </LegalSection>

      <LegalSection number="11" title="Limitation of liability">
        <LegalP>
          To the fullest extent permitted by law, Olynixx is not liable for indirect, incidental, special,
          consequential, or punitive damages, or any loss of profit, revenue, data, or business opportunity
          arising from use of the Services. Nothing in these Terms excludes liability that cannot be excluded
          under applicable law.
        </LegalP>
      </LegalSection>

      <LegalSection number="12" title="Indemnity">
        <LegalP>
          You agree to indemnify and hold Olynixx harmless from claims, losses, and expenses arising out of your
          breach of these Terms, unlawful conduct, or misuse of the Services.
        </LegalP>
      </LegalSection>

      <LegalSection number="13" title="Governing law and disputes">
        <LegalP>
          These Terms are governed by the laws of the United Arab Emirates and the applicable laws of the Emirate
          of Dubai. Unless required otherwise by mandatory law, disputes shall be submitted to the competent
          courts of Dubai, UAE.
        </LegalP>
      </LegalSection>

      <LegalSection number="14" title="Changes to these terms">
        <LegalP>
          We may update these Terms periodically. The revised version will be posted here with an updated
          effective date. Continued use of the Services after updates means you accept the updated Terms.
        </LegalP>
        <LegalP>
          Questions: <LegalLink href="mailto:hello@olynixx.com">hello@olynixx.com</LegalLink>
        </LegalP>
      </LegalSection>
    </LegalDoc>
  );
}
