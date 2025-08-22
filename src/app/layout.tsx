import { Anuphan } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { CustomProviders } from "./provider";

const anuphan = Anuphan({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Whalalora",
  description: "Homepage of Whalalora",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomProviders>
      <html lang="en" className={`min-h-screen ${anuphan.className}`}>
        <body>{children}</body>
      </html>
    </CustomProviders>
  );
}
