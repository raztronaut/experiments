import "../experiments.css";
import { ThemeProvider } from "@/components/experiments/send-button/ThemeProvider";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";
import { UmamiScript } from "@/components/analytics/UmamiScript";

export const metadata = {
  title: 'Send-Button',
  description: 'A cool animated send button animation',
  openGraph: {
    title: 'Send-Button',
    description: 'A cool animated send button animation',
    url: 'https://www.razisyed.cv/experiments/send-button',
    images: ['/experiments/send-button/preview-send-button.png'],
    videos: ['/experiments/send-button/preview-send-button.mp4'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Send-Button',
    description: 'A cool animated send button animation',
    images: ['/experiments/send-button/preview-send-button.png'],
  },
  alternates: {
    canonical: 'https://www.razisyed.cv/experiments/send-button',
  },
  authors: [{ name: 'Razi Syed', url: 'https://www.razisyed.cv' }],
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <UmamiScript />
        <ExperimentBackButton />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
