import { getSiteUrl } from "@/config/site";

import type { MetadataRoute } from "next";

const APP_ROUTES = ["/dashboard", "/projects", "/timesheets", "/profile", "/pomodoro"];

/** AI/search crawlers that commonly power answer engines. */
const AEO_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
] as const;

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: APP_ROUTES,
      },
      ...AEO_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: APP_ROUTES,
      })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
