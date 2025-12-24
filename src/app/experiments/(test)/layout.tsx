import "../experiments.css";

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
      <body>{children}</body>
    </html>
  );
}
