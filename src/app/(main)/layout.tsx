import type { Metadata } from "next";
import { activeFont } from "@/lib/fonts";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GlobalTracking } from "@/components/analytics/GlobalTracking";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { ConsoleEasterEgg } from "@/components/ui/ConsoleEasterEgg";
import { CursorProvider } from "@/components/ui/cursor/Provider";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    default: "Razi's Experiments",
    template: "%s | Razi's Experiments",
  },
  description:
    "A playground for exploring UI interactions, shaders, and modern web techniques.",
  keywords: [
    "Next.js",
    "React",
    "Three.js",
    "Shaders",
    "Creative Coding",
    "Experiment",
    "Portfolio",
    "Razi Syed",
  ],
  authors: [{ name: "Razi Syed", url: "https://www.razisyed.cv" }],
  creator: "Razi Syed",
  publisher: "Razi Syed",
  applicationName: "Razi's Experiments",
  alternates: {
    canonical: "/",
  },
  metadataBase: new URL("https://www.razisyed.cv"),
  openGraph: {
    title: "Razi's Experiments",
    description:
      "A playground for exploring UI interactions, shaders, and modern web techniques.",
    url: "https://www.razisyed.cv",
    siteName: "Razi's Experiments",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Razi's Experiments Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Razi's Experiments",
    description:
      "A playground for exploring UI interactions, shaders, and modern web techniques.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          activeFont.className,
          activeFont.variable,
          "min-h-screen bg-background font-canvas text-foreground antialiased"
        )}
      >
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
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Razi Syed",
              url: "https://www.razisyed.cv",
              sameAs: [
                "https://github.com/raztronaut",
                "https://twitter.com/razisyed",
              ],
              jobTitle: "Design Engineer",
              worksFor: {
                "@type": "Organization",
                name: "Independent",
              },
            }),
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
