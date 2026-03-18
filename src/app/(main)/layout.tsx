import type { Metadata, Viewport } from "next";
import { activeFont } from "@/lib/fonts";
import "./globals.css";
import dynamic from "next/dynamic";
import { DeferredVercelAnalytics } from "@/components/analytics/DeferredVercelAnalytics";
import { GlobalTracking } from "@/components/analytics/GlobalTracking";
import { UmamiScript } from "@/components/analytics/UmamiScript";

const ConsoleEasterEgg = dynamic(() =>
  import("@/components/ui/ConsoleEasterEgg").then((m) => m.ConsoleEasterEgg)
);

import { CursorProvider } from "@/components/ui/cursor/Provider";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import {
  AUTHOR_NAME,
  GITHUB_URL,
  LINKEDIN_URL,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
  TWITTER_URL,
} from "@/lib/constants";
import {
  generateWebSiteJsonLd,
  safeJsonLdStringify,
} from "@/lib/structured-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_TITLE}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Next.js",
    "React",
    "Three.js",
    "Shaders",
    "Creative Coding",
    "Experiment",
    "Portfolio",
    "Razi Syed",
    "Razi",
    "raztronaut",
    "WebGL",
    "GSAP",
    "Design Engineering",
    "Interactive",
    "Animation",
    "R3F",
  ],
  authors: [{ name: AUTHOR_NAME, url: SITE_URL }],
  creator: AUTHOR_NAME,
  publisher: AUTHOR_NAME,
  applicationName: SITE_TITLE,
  category: "technology",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
      "application/atom+xml": "/atom.xml",
      "application/feed+json": "/feed.json",
    },
  },
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_TITLE,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Razi's Experiments Lab",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    creator: "@raztronaut",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "msapplication-TileColor": "#111115",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#111115" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://cloud.umami.is" rel="preconnect" />
        <link href="https://api-gateway.umami.dev" rel="preconnect" />
        <link href="https://vitals.vercel-insights.com" rel="preconnect" />
        <link href="https://o0.ingest.sentry.io" rel="preconnect" />
        <link
          href={`https://webmention.io/${new URL(SITE_URL).host}/webmention`}
          rel="webmention"
        />
        <link
          href={`https://webmention.io/${new URL(SITE_URL).host}/xmlrpc`}
          rel="pingback"
        />
      </head>
      <body
        className={cn(
          activeFont.className,
          activeFont.variable,
          "min-h-screen bg-background font-canvas text-foreground antialiased"
        )}
      >
        <div className="sr-only h-card" hidden>
          <a className="u-url p-name" href={SITE_URL} rel="me">
            {AUTHOR_NAME}
          </a>
          <span className="p-job-title">Design Engineer</span>
          <a className="u-url" href={GITHUB_URL} rel="me">
            GitHub
          </a>
          <a className="u-url" href={TWITTER_URL} rel="me">
            X
          </a>
          <a className="u-url" href={LINKEDIN_URL} rel="me">
            LinkedIn
          </a>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (!('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
                  document.documentElement.setAttribute('data-cursor-hidden', 'true');
                }
              } catch (e) {}
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: safeJsonLdStringify(generateWebSiteJsonLd()),
          }}
          type="application/ld+json"
        />
        <UmamiScript />
        <GlobalTracking />
        <ConsoleEasterEgg />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <CursorProvider>{children}</CursorProvider>
        </ThemeProvider>
        <DeferredVercelAnalytics />
      </body>
    </html>
  );
}
