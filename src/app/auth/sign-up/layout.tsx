import { Alexandria } from 'next/font/google';
import type { Metadata } from 'next';

const alexandria = Alexandria({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Whalalora | Sign up',
  description: 'Login page',
};

export default function TradingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`min-h-screen ${alexandria.className}`}>
      <div>{children}</div>
    </div>
  );
}
