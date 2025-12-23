import "../experiments.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
