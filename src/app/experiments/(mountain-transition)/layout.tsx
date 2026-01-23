import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";
import { UmamiScript } from "@/components/analytics/UmamiScript";

export const metadata = {
  title: 'Mountain Transition',
  description: 'A cinematic scene transition using a depth map and FBM noise to create a volumetric reveal that respects the 3D structure of the landscape',
  openGraph: {
    images: ['/experiments/mountain-transition/green.png'],
    videos: ['/experiments/mountain-transition/preview.mp4'],
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: metadata.title,
    description: metadata.description,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <html lang="en">
      <body>
        <UmamiScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <h1 className="sr-only">{metadata.title}</h1>
        <ExperimentBackButton />
        {children}
      </body>
    </html>
  );
}