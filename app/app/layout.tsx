
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { LayoutContent } from '@/components/layout-content';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AffiliateHub - Affiliate E-commerce Catalog',
  description: 'Discover great products from trusted affiliate partners',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background">
            <LayoutContent>{children}</LayoutContent>
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  );
}
