import "../experiments.css";
import { ThemeProvider } from "@/components/experiments/send-button/ThemeProvider";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";

export const metadata = {
  title: 'Send-Button',
  description: 'A cool animated send button animation',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
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
