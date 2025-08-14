import type { Metadata } from "next";
import "@/app/globals.css";
import Navbar from "@/components/ui/Navbar";

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