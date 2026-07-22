import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_TAGLINE, getSiteUrl } from "@/lib/seo";

/** Organization + WebSite JSON-LD for the public homepage. */
export function OrganizationJsonLd() {
  const url = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: SITE_NAME,
        url,
        logo: `${url}/brand/olynixx-appicon.svg`,
        description: DEFAULT_DESCRIPTION,
        slogan: SITE_TAGLINE,
        email: "hello@olynixx.com",
        areaServed: {
          "@type": "Country",
          name: "United Arab Emirates",
        },
        sameAs: [
          "https://www.linkedin.com/company/olynixx",
          "https://www.instagram.com/olynixx",
          "https://x.com/olynixx",
          "https://www.youtube.com/@olynixx",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        publisher: { "@id": `${url}/#organization` },
        inLanguage: "en",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
