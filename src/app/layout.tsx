import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Control X — Luxury Digital Web Application',
  description:
    'An interactive benchmark for high-end digital agency platforms synthesizing editorial typography with real-time physical WebGL optics.',
};

export default function RootLayout({
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
