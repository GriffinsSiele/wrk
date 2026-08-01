import { LegalDoc, LegalSection, LegalP, LegalList, LegalLink } from "@/components/legal/LegalDoc";

const effectiveDate = "07 July 2026";

export default function PrivacyPolicyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      lede="How Olynixx Praxis collects, uses, stores, and shares personal data across our website and portals."
      effectiveDate={effectiveDate}
      relatedHref="/terms"
      relatedLabel="Terms of Service"
    >
      <LegalSection number="01" title="Overview">
        <LegalP>
          This Privacy Policy explains how Olynixx Praxis (&quot;Olynixx&quot;, &quot;we&quot;, &quot;us&quot;, or
          &quot;our&quot;) collects, uses, stores, and shares personal data when you use our website, learner
          platform, coach portal, and related services. We process personal data in accordance with applicable
          laws of the United Arab Emirates, including Federal Decree-Law No. 45 of 2021 concerning the Protection
          of Personal Data (PDPL), as applicable.
        </LegalP>
      </LegalSection>

      <LegalSection number="02" title="Who we are">
        <LegalP>
          Olynixx Praxis is a specialisation and certification body for non-medical human performance coaches,
          operating in the United Arab Emirates. Learner and coach records are held under UAE data residency and
          processed in line with the Personal Data Protection Law.
        </LegalP>
        <LegalP>Data Controller: Olynixx Praxis</LegalP>
        <LegalP>
          Privacy: <LegalLink href="mailto:privacy@olynixx.com">privacy@olynixx.com</LegalLink>
        </LegalP>
        <LegalP>
          General: <LegalLink href="mailto:hello@olynixx.com">hello@olynixx.com</LegalLink>
        </LegalP>
      </LegalSection>

      <LegalSection number="03" title="Personal data we collect">
        <LegalList
          items={[
            "Account and identity details (name, email, role, profile information).",
            "Contact details (phone number, organisation details, enquiry submissions).",
            "Learning and platform data (course progress, quiz attempts, exam sessions).",
            "Coach profile details (specialty, language, emirate, availability, credentials).",
            "Technical and usage data (IP address, browser type, device data, activity logs, cookies).",
          ]}
        />
      </LegalSection>

      <LegalSection number="04" title="Why we process your data">
        <LegalList
          items={[
            "To register and manage user accounts and secure access to portals.",
            "To deliver courses, assessments, certification workflows, and support.",
            "To manage organisational enquiries, coach assignments, and operations.",
            "To improve services, maintain security, detect misuse, and meet legal obligations.",
            "To send service updates and, where permitted, communications about our services.",
          ]}
        />
      </LegalSection>

      <LegalSection number="05" title="Lawful basis for processing">
        <LegalP>
          We process personal data based on one or more legal grounds recognised under applicable UAE law,
          including performance of a contract, compliance with legal obligations, our legitimate interests
          (such as platform security and service improvement), and consent where required.
        </LegalP>
      </LegalSection>

      <LegalSection number="06" title="Cookies and tracking">
        <LegalP>
          We use essential cookies and similar technologies for authentication and session continuity so you
          can sign in and use the platform securely. We do not currently use third-party analytics or advertising
          cookies. If that changes, we will update this policy and provide any consent controls required by law.
          You can control cookies through browser settings; disabling essential cookies may affect core platform
          functions.
        </LegalP>
      </LegalSection>

      <LegalSection number="07" title="Data sharing">
        <LegalP>We may share data with:</LegalP>
        <LegalList
          items={[
            "Cloud hosting and infrastructure providers.",
            "Service providers supporting platform operations, communications, and security.",
            "Professional advisors, regulators, or public authorities where required by law.",
          ]}
        />
        <LegalP>We do not sell personal data.</LegalP>
      </LegalSection>

      <LegalSection number="08" title="International transfers">
        <LegalP>
          If personal data is transferred outside the UAE, we implement appropriate safeguards and legal
          mechanisms in line with applicable UAE legal requirements.
        </LegalP>
      </LegalSection>

      <LegalSection number="09" title="Data retention">
        <LegalP>
          We retain personal data only for as long as needed for the purposes described in this Policy,
          including legal, regulatory, tax, accounting, dispute, and audit requirements. Retention periods
          depend on data category and legal context.
        </LegalP>
      </LegalSection>

      <LegalSection number="10" title="Your data protection rights">
        <LegalP>Subject to applicable law and lawful exceptions, you may have rights to:</LegalP>
        <LegalList
          items={[
            "Request access to your personal data.",
            "Request correction of inaccurate or incomplete data.",
            "Request deletion of personal data in specified circumstances.",
            "Object to or restrict certain processing activities.",
            "Withdraw consent where processing is based on consent.",
          ]}
        />
        <LegalP>
          To exercise your rights, contact{" "}
          <LegalLink href="mailto:privacy@olynixx.com">privacy@olynixx.com</LegalLink>.
        </LegalP>
      </LegalSection>

      <LegalSection number="11" title="Security">
        <LegalP>
          We use technical and organisational safeguards designed to protect personal data against unauthorised
          access, disclosure, alteration, or destruction. No system is completely secure, but we continuously
          monitor and improve our controls.
        </LegalP>
      </LegalSection>

      <LegalSection number="12" title="Children">
        <LegalP>
          Our services are intended for adults and professional users. If we become aware that personal data has
          been provided in a way that breaches applicable legal requirements, we may remove such data.
        </LegalP>
      </LegalSection>

      <LegalSection number="13" title="Changes to this policy">
        <LegalP>
          We may update this Privacy Policy from time to time. Updates will be posted on this page with a revised
          effective date.
        </LegalP>
        <LegalP>
          Questions: <LegalLink href="mailto:privacy@olynixx.com">privacy@olynixx.com</LegalLink>
        </LegalP>
      </LegalSection>
    </LegalDoc>
  );
}
