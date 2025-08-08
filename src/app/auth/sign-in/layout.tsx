import type { Metadata } from 'next'
import "@/app/globals.css"; 

export const metadata: Metadata = {
  title: 'Whalalora | Login',
  description: 'Login page',
  icons: '/logo.png',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div>{children}</div>
    </>
  );
}
