import { Alexandria } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';
import { CustomProviders } from './provider';

const alexandria = Alexandria({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Whalarora',
  description: 'Homepage of Whalarora',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`min-h-screen ${alexandria.className}`}>
        <CustomProviders>{children}</CustomProviders>
      </body>
    </html>
  );
}
