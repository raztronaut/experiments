import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";

export const metadata = {
  title: 'Test',
  description: 'test',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ExperimentBackButton />
        {children}
      </body>
    </html>
  );
}
