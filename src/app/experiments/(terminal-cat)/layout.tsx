import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";
import { Toaster } from "@/components/ui/sonner";
import { UmamiScript } from "@/components/analytics/UmamiScript";

export const metadata = {
  title: 'Terminal Cat',
  description: 'A demo of streaming ASCII animation in console',
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
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}

