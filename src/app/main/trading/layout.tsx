import Navbar from "@/components/ui/Navbar";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Whalalora | Trading',
  description: 'Trading page',
  icons: '/logo.png',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div>{children}</div>
    </>
  );
}
