import { getSiteUrl, SITE } from "@/config/site";
import { LANDING_AEO_FACTS, LANDING_FAQ, LANDING_FEATURE_LIST } from "@/lib/seo/landing-faq";

export default function LandingStructuredData() {
  const siteUrl = getSiteUrl();

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        url: siteUrl,
        name: SITE.title,
        description: SITE.description,
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
        about: {
          "@id": `${siteUrl}/#application`,
        },
        inLanguage: "en",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE.name,
        description: SITE.description,
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
        inLanguage: "en",
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: SITE.companyName,
        url: SITE.companyUrl,
        brand: {
          "@type": "Brand",
          name: SITE.name,
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${siteUrl}/#application`,
        name: SITE.name,
        url: siteUrl,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: SITE.definition,
        featureList: [...LANDING_FEATURE_LIST],
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Free for individuals. Companies get a 60-day trial.",
        },
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        mainEntity: LANDING_FAQ.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: {
            "@type": "Answer",
            text: answer,
          },
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/#facts`,
        name: `What is ${SITE.name}?`,
        description: "Key facts about Klong for individuals and teams.",
        itemListElement: LANDING_AEO_FACTS.map((fact, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: fact,
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
