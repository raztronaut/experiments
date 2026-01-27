import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";
import { UmamiScript } from "@/components/analytics/UmamiScript";

export const metadata = {
  title: '404 Not Found',
  description: 'A cinematic 404 experience with procedurally animated 3D ribbons and custom GLSL shader effects.',
  openGraph: {
    title: '404 Not Found',
    description: 'A cinematic 404 experience with procedurally animated 3D ribbons and custom GLSL shader effects.',
    url: 'https://www.razisyed.cv/experiments/404-not-found',
    images: ['/experiments/404-not-found/poster.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '404 Not Found',
    description: 'A cinematic 404 experience with procedurally animated 3D ribbons and custom GLSL shader effects.',
    images: ['/experiments/404-not-found/poster.jpg'],
  },
  alternates: {
    canonical: 'https://www.razisyed.cv/experiments/404-not-found',
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