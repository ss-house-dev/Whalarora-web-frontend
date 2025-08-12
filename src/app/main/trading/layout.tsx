import Navbar from "@/shared/components/ui/Navbar";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Whalalora | Trading",
  description: "Login page",
  icons: "/logo.png",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Navbar/>
      <div>{children}</div>
    </div>
  );
}
