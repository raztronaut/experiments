import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";

export const metadata = {
  title: "Test",
  description: "test",
  openGraph: {
    title: "Test",
    description: "test",
    url: "https://www.razisyed.cv/experiments/test",
    images: ["/experiments/test/preview.gif"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Test",
    description: "test",
    images: ["/experiments/test/preview.gif"],
  },
  alternates: {
    canonical: "https://www.razisyed.cv/experiments/test",
  },
  authors: [{ name: "Razi Syed", url: "https://www.razisyed.cv" }],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UmamiScript />
        <ExperimentBackButton />
        {children}
      </body>
    </html>
  );
}
