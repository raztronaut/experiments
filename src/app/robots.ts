import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Search engines
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "bingbot", allow: "/" },
      { userAgent: "DuckDuckBot", allow: "/" },
      // AI/LLM bots — training
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "Bytespider", allow: "/" },
      // AI/LLM bots — citation/browsing (drive referral traffic)
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "Claude-SearchBot", allow: "/" },
      { userAgent: "Claude-User", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "YouBot", allow: "/" },
      { userAgent: "ai-crawler", allow: "/" },
      // Social/app bots
      { userAgent: "Amazonbot", allow: "/" },
      { userAgent: "Applebot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "Meta-ExternalAgent", allow: "/" },
      { userAgent: "Twitterbot", allow: "/" },
      // Fallback: allow all others
      { userAgent: "*", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
