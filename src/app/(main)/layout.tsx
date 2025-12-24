import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { UmamiScript } from "@/components/analytics/UmamiScript";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
  },
  twitter: {
    card: 'summary_large_image',
    title: "Razi's Experiments",
    description: "A playground for exploring UI interactions, shaders, and modern web techniques.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "min-h-screen bg-background font-sans antialiased text-foreground")}>
        <UmamiScript />
        {children}
      </body>
    </html>
  );
}
