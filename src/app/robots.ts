import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            // Search engines
            { userAgent: 'Googlebot', allow: '/' },
            { userAgent: 'bingbot', allow: '/' },
            { userAgent: 'DuckDuckBot', allow: '/' },
            // AI/LLM bots
            { userAgent: 'GPTBot', allow: '/' },
            { userAgent: 'ClaudeBot', allow: '/' },
            { userAgent: 'Google-Extended', allow: '/' },
            { userAgent: 'PerplexityBot', allow: '/' },
            { userAgent: 'CCBot', allow: '/' },
            { userAgent: 'YouBot', allow: '/' },
            { userAgent: 'ai-crawler', allow: '/' },
            // Social/app bots
            { userAgent: 'Amazonbot', allow: '/' },
            { userAgent: 'Applebot', allow: '/' },
            { userAgent: 'Meta-ExternalAgent', allow: '/' },
            { userAgent: 'Twitterbot', allow: '/' },
            // Fallback: allow all others
            { userAgent: '*', allow: '/' },
        ],
        sitemap: 'https://raziexperiments.vercel.app/sitemap.xml',
    }
}
