import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { ThemeProvider } from "@/components/experiments/send-button/ThemeProvider";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";

export const metadata = {
  title: "Send-Button",
  description: "A cool animated send button animation",
  openGraph: {
    title: "Send-Button",
    description: "A cool animated send button animation",
    url: "https://www.razisyed.cv/experiments/send-button",
    images: ["/experiments/send-button/preview-send-button.png"],
    videos: ["/experiments/send-button/preview-send-button.mp4"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Send-Button",
    description: "A cool animated send button animation",
    images: ["/experiments/send-button/preview-send-button.png"],
  },
  alternates: {
    canonical: "https://www.razisyed.cv/experiments/send-button",
  },
  authors: [{ name: "Razi Syed", url: "https://www.razisyed.cv" }],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <UmamiScript />
        <ExperimentBackButton />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
