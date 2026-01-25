import type { Metadata } from "next";
import { activeFont } from "@/lib/fonts";
import "./globals.css";
import { cn } from "@/lib/utils";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { ConsoleEasterEgg } from "@/components/ui/ConsoleEasterEgg";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "Razi's Experiments",
    template: "%s | Razi's Experiments",
  },
  description: "A playground for exploring UI interactions, shaders, and modern web techniques.",
  metadataBase: new URL('https://raziexperiments.vercel.app'),
  openGraph: {
    title: "Razi's Experiments",
    description: "A playground for exploring UI interactions, shaders, and modern web techniques.",
    url: 'https://raziexperiments.vercel.app',
    siteName: "Razi's Experiments",
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "Razi's Experiments Preview",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Razi's Experiments",
    description: "A playground for exploring UI interactions, shaders, and modern web techniques.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { CursorProvider } from "@/components/ui/cursor/Provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(activeFont.className, activeFont.variable, "min-h-screen bg-background font-canvas antialiased text-foreground")}>
        <UmamiScript />
        <ConsoleEasterEgg />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <CursorProvider>
            {children}
          </CursorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
