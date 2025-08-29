import { Alexandria } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { CustomProviders } from "./provider";
import QueryProvider from "@/lib/react-query/QueryClientProvider";

const alexandria = Alexandria({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Whalarora",
  description: "Homepage of Whalarora",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomProviders>
      <QueryProvider>
        <html lang="en" className={`min-h-screen ${alexandria.className}`}>
          <body>{children}</body>
        </html>
      </QueryProvider>
    </CustomProviders>
  );
}
