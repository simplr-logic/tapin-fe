import { getSiteUrl, SITE } from "@/config/site";

import type { Metadata } from "next";

const siteUrl = getSiteUrl();

/** Default metadata for the public marketing homepage (`/`). */
export function buildLandingMetadata(): Metadata {
  const ogImage = "/opengraph-image";

  return {
    title: SITE.title,
    description: SITE.description,
    keywords: [...SITE.keywords],
    applicationName: SITE.name,
    authors: [{ name: SITE.companyName, url: SITE.companyUrl }],
    creator: SITE.companyName,
    publisher: SITE.companyName,
    category: "productivity",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName: SITE.name,
      title: SITE.title,
      description: SITE.description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: SITE.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE.title,
      description: SITE.description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/** App shell metadata — title template and shared defaults for all routes. */
export function buildRootMetadata(): Metadata {
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: SITE.title,
      template: `%s | ${SITE.name}`,
    },
    description: SITE.description,
    icons: {
      icon: "/logo.svg",
      apple: "/logo.svg",
    },
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  };
}
