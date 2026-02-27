import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Capital Call | Startup Dealroom',
  description: 'Premium platform for managing startup applications and investor deals',
  keywords: ['startup', 'investment', 'dealroom', 'venture capital', 'funding'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-dark-50 text-dark-900 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
