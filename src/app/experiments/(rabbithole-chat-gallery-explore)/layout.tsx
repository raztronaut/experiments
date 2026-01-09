import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";
import { UmamiScript } from "@/components/analytics/UmamiScript";

export const metadata = {
  title: 'rabbithole.chat Gallery Explore',
  description: '',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">

      <body style={{ backgroundColor: 'hsl(0, 0%, 14%)', overscrollBehavior: 'none' }}>
        <UmamiScript />
        <ExperimentBackButton />
        {children}
      </body>

    </html>
  );
}