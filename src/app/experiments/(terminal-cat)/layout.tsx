import "../experiments.css";

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
      <body>{children}</body>
    </html>
  );
}
