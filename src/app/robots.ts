import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

const DISALLOWED = [
  "/dev",
  "/mdx-preview",
  "/u/",
  "/api/experiments",
  "/api/registry-search",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Search engines
      { userAgent: "Googlebot", allow: "/", disallow: DISALLOWED },
      { userAgent: "bingbot", allow: "/", disallow: DISALLOWED },
      { userAgent: "DuckDuckBot", allow: "/", disallow: DISALLOWED },
      // AI/LLM bots — training
      { userAgent: "GPTBot", allow: "/", disallow: DISALLOWED },
      { userAgent: "ClaudeBot", allow: "/", disallow: DISALLOWED },
      { userAgent: "Google-Extended", allow: "/", disallow: DISALLOWED },
      { userAgent: "CCBot", allow: "/", disallow: DISALLOWED },
      { userAgent: "Bytespider", allow: "/", disallow: DISALLOWED },
      // AI/LLM bots — citation/browsing (drive referral traffic)
      { userAgent: "ChatGPT-User", allow: "/", disallow: DISALLOWED },
      { userAgent: "Claude-SearchBot", allow: "/", disallow: DISALLOWED },
      { userAgent: "Claude-User", allow: "/", disallow: DISALLOWED },
      { userAgent: "PerplexityBot", allow: "/", disallow: DISALLOWED },
      { userAgent: "YouBot", allow: "/", disallow: DISALLOWED },
      { userAgent: "ai-crawler", allow: "/", disallow: DISALLOWED },
      // Social/app bots
      { userAgent: "Amazonbot", allow: "/", disallow: DISALLOWED },
      { userAgent: "Applebot", allow: "/", disallow: DISALLOWED },
      { userAgent: "Applebot-Extended", allow: "/", disallow: DISALLOWED },
      { userAgent: "Meta-ExternalAgent", allow: "/", disallow: DISALLOWED },
      { userAgent: "Twitterbot", allow: "/", disallow: DISALLOWED },
      // Fallback: allow all others
      { userAgent: "*", allow: "/", disallow: DISALLOWED },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
