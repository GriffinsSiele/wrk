import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_TAGLINE, getSiteUrl } from "@/lib/seo";

/** Course / educational program JSON-LD for the specialisations page. */
export function CourseJsonLd() {
  const url = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${SITE_NAME} Specialisation Pathway`,
    description: DEFAULT_DESCRIPTION,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url,
    },
    url: `${url}/certification`,
    educationalLevel: "Professional specialisation",
    inLanguage: "en",
    offers: {
      "@type": "Offer",
      category: "ProfessionalDevelopment",
      availability: "https://schema.org/InStock",
      url: `${url}/certification`,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      location: {
        "@type": "Place",
        name: "United Arab Emirates",
      },
    },
    about: [
      "Human Readiness",
      "Recovery Intelligence",
      "Performance Intelligence",
    ],
    teaches: SITE_TAGLINE,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
