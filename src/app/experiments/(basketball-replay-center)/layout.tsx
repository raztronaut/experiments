import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import experiment from "./experiment.json";

export const metadata = {
  title: experiment.title,
  description: experiment.description,
  openGraph: {
    title: experiment.title,
    description: experiment.description,
    url: `https://www.razisyed.cv/experiments/${experiment.slug}`,
    images: [experiment.poster || experiment.image], 
    videos: experiment.video ? [experiment.video] : [],
  },
  twitter: {
    card: 'summary_large_image',
    title: experiment.title,
    description: experiment.description,
    images: [experiment.poster || experiment.image],
  },
  alternates: {
    canonical: `https://www.razisyed.cv/experiments/${experiment.slug}`,
  },
  authors: [{ name: 'Razi Syed', url: 'https://www.razisyed.cv' }],
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
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